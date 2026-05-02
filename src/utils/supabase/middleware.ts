import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Here we add RBAC Middleware logic
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  
  if (isAuthRoute) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // If there's no user, redirect to login
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fetch the user's profile and permissions
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_first_login, roles(can_manage_users, can_manage_leaves, can_process_payroll)')
      .eq('id', user.id)
      .single()
      
    const perms = (profile?.roles as unknown as { can_manage_users: boolean, can_manage_leaves: boolean, can_process_payroll: boolean }) || {}
    const path = request.nextUrl.pathname

    // Onboarding Redirect
    if (profile?.is_first_login && !path.startsWith('/change-password')) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }
    if (!profile?.is_first_login && path.startsWith('/change-password')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Permission-based route guards
    if (path.startsWith('/admin') && !perms.can_manage_users) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/hr') && !perms.can_manage_leaves && !perms.can_manage_users) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/payroll') && !perms.can_process_payroll) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return supabaseResponse
}
