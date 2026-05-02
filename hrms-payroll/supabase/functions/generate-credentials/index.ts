// Supabase Edge Function: generate-credentials
// Creates a Supabase Auth user, updates employee row, and emails credentials via Resend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@4.0.0";

type Role = "Admin" | "HR Admin" | "HR Officer" | "Payroll Officer" | "Employee" | string;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function randomInt(min: number, max: number) {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function onlyLettersUpper(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function first2(s: string) {
  const v = onlyLettersUpper(s);
  return (v.slice(0, 2) || "XX").padEnd(2, "X");
}

function last2(s: string) {
  const v = onlyLettersUpper(s);
  const tail = v.slice(-2);
  return (tail || "XX").padStart(2, "X");
}

function buildLoginId(employeeName: string, joiningYear: number, joinSerial: number) {
  const parts = String(employeeName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "XX";
  const lastName = parts.length >= 2 ? parts[parts.length - 1] : parts[0] ?? "XX";
  const yy = String(joiningYear);
  const serial = String(joinSerial).padStart(4, "0");
  return `OI${first2(firstName)}${last2(lastName)}${yy}${serial}`;
}

function pick<T>(arr: T[]) {
  return arr[randomInt(0, arr.length - 1)];
}

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ".split("");
  const lower = "abcdefghijkmnopqrstuvwxyz".split("");
  const nums = "23456789".split("");
  const special = "!@#$%^&*_-+=".split("");
  const all = [...upper, ...lower, ...nums, ...special];

  const length = randomInt(10, 12);
  const chars: string[] = [pick(upper), pick(lower), pick(nums), pick(special)];
  while (chars.length < length) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function isAllowedRole(role: Role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" || r === "hr admin" || r === "hr officer";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "HRMS <no-reply@yourdomain.com>";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Supabase env not configured" });
  }
  if (!RESEND_API_KEY) return json(500, { error: "Resend env not configured" });

  const role = req.headers.get("x-hrms-role") ?? "";
  if (!isAllowedRole(role)) return json(403, { error: "Forbidden" });

  let payload: { employeeId?: string; email?: string; employeeName?: string; joiningDate?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const employeeId = String(payload.employeeId || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const employeeName = String(payload.employeeName || "Employee").trim();
  const joiningDate = String(payload.joiningDate || "").trim();

  if (!employeeId) return json(400, { error: "employeeId is required" });
  if (!email || !email.includes("@")) return json(400, { error: "Valid email is required" });
  if (!joiningDate) return json(400, { error: "joiningDate is required" });

  const joinYear = Number(joiningDate.slice(0, 4));
  if (!Number.isFinite(joinYear) || joinYear < 1900) return json(400, { error: "Invalid joiningDate" });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Generate join-serial for the joining year (best-effort, avoids collisions).
  let joinSerialBase = 1;
  try {
    const from = `${joinYear}-01-01`;
    const to = `${joinYear + 1}-01-01`;
    const { count, error } = await supabaseAdmin
      .from("employees")
      .select("id", { count: "exact", head: true })
      .gte("joining_date", from)
      .lt("joining_date", to);
    if (!error && typeof count === "number") joinSerialBase = count + 1;
  } catch {
    // If the table/column doesn't exist yet, we still generate a serial.
    joinSerialBase = randomInt(1, 999);
  }

  // Try a few times to avoid collisions: serial increments per attempt.
  let loginId = "";
  for (let i = 0; i < 12; i++) {
    const candidate = buildLoginId(employeeName, joinYear, joinSerialBase + i);
    const { data, error } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("login_id", candidate)
      .maybeSingle();
    if (error) return json(500, { error: "Employee lookup failed" });
    if (!data) {
      loginId = candidate;
      break;
    }
  }
  if (!loginId) return json(500, { error: "Failed to generate login id" });

  const password = generatePassword();

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      login_id: loginId,
      employee_id: employeeId,
      force_password_change: true,
    },
  });

  if (createErr || !created?.user) {
    return json(500, { error: "Failed to create auth user" });
  }

  const authUserId = created.user.id;

  const { error: updateErr } = await supabaseAdmin
    .from("employees")
    .update({
      email,
      login_id: loginId,
      auth_user_id: authUserId,
      credentials_sent: true,
    })
    .eq("id", employeeId);

  if (updateErr) return json(500, { error: "Failed to update employee record" });

  const resend = new Resend(RESEND_API_KEY);
  const { error: emailErr } = await resend.emails.send({
    from: RESEND_FROM,
    to: email,
    subject: "Your HRMS Login Credentials",
    html: `
      <p>Hello ${employeeName},</p>
      <p>Your account has been created.</p>
      <p><strong>Login ID:</strong> ${loginId}<br/>
      <strong>Password:</strong> ${password}</p>
      <p>Please login and change your password immediately.</p>
    `,
  });

  if (emailErr) {
    // Auth user exists + employee row updated; tell the caller it partially failed.
    return json(502, { error: "Failed to send email" });
  }

  // Security rule: never return the password to the frontend.
  return json(200, { ok: true, loginId, credentialsSent: true });
});

