import { registerCompany } from './actions'
import Link from 'next/link'

export default function RegisterPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 py-12 sm:max-w-xl mx-auto">
      <div className="flex flex-col mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-purple-600">EmPay HRMS</h1>
        <p className="text-gray-500">Register your company and create an Admin account.</p>
      </div>

      <form action={registerCompany} className="bg-white p-8 border rounded-xl shadow-md flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        
        {searchParams?.message && (
          <p className="p-4 bg-red-100 text-red-600 text-center rounded-md">
            {searchParams.message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Company Name</label>
            <input className="w-full rounded-md px-4 py-2 border mt-1" name="company_name" placeholder="Odoo India" required />
          </div>
          <div>
            <label className="text-sm font-semibold">Company Code (2 Letters)</label>
            <input className="w-full rounded-md px-4 py-2 border mt-1" name="company_code" placeholder="OI" maxLength={2} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm font-semibold">Admin First Name</label>
            <input className="w-full rounded-md px-4 py-2 border mt-1" name="first_name" placeholder="John" required />
          </div>
          <div>
            <label className="text-sm font-semibold">Admin Last Name</label>
            <input className="w-full rounded-md px-4 py-2 border mt-1" name="last_name" placeholder="Doe" required />
          </div>
        </div>

        <div className="mt-2">
          <label className="text-sm font-semibold">Email</label>
          <input className="w-full rounded-md px-4 py-2 border mt-1" type="email" name="email" placeholder="admin@company.com" required />
        </div>

        <div className="mt-2">
          <label className="text-sm font-semibold">Phone Number</label>
          <input className="w-full rounded-md px-4 py-2 border mt-1" name="phone" placeholder="+91 9876543210" required />
        </div>

        <div className="mt-2 mb-4">
          <label className="text-sm font-semibold">Password</label>
          <input className="w-full rounded-md px-4 py-2 border mt-1" type="password" name="password" placeholder="••••••••" required minLength={6} />
        </div>

        <button className="bg-purple-600 rounded-md px-4 py-3 text-white font-bold transition-colors hover:bg-purple-700">
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link href="/login" className="text-purple-600 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
