import { registerCompany } from './actions'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, User, Mail, Phone, Lock } from 'lucide-react'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white">
      
      {/* LEFT COLUMN: Graphic and Copy */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-black">
        <div className="z-10 relative">
          <h1 className="text-2xl font-bold tracking-tight">EmPay</h1>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center top-[-10%] opacity-90 mix-blend-screen">
          <Image 
            src="/login-bg.png" 
            alt="3D Abstract glowing ribbon" 
            width={800} 
            height={800} 
            className="object-cover scale-110"
            priority
          />
        </div>

        <div className="z-10 relative mt-auto max-w-md">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Start managing your workforce today.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Create your company workspace and onboard your entire team in minutes.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
        <div className="w-full max-w-lg">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Create Your Workspace</h2>
            <p className="text-gray-400 text-sm">Register your company and set up your Admin account.</p>
          </div>

          <form action={registerCompany} className="flex flex-col gap-5">
            
            {params?.message && (
              <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center rounded-lg">
                {params.message}
              </p>
            )}

            {/* Company Name & Code */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-gray-500" />
                  </div>
                  <input className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" name="company_name" placeholder="Odoo India" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Code</label>
                <input className="w-full rounded-lg px-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm text-center uppercase" name="company_code" placeholder="OI" maxLength={2} required />
              </div>
            </div>

            {/* Admin First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <input className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" name="first_name" placeholder="John" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Last Name</label>
                <input className="w-full rounded-lg px-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" name="last_name" placeholder="Doe" required />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" type="email" name="email" placeholder="admin@company.com" required />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-500" />
                </div>
                <input className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" name="phone" placeholder="+91 9876543210" required />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input className="w-full rounded-lg pl-10 pr-4 py-3 bg-[#141414] border border-[#222] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-gray-600 text-sm" type="password" name="password" placeholder="••••••••" required minLength={6} />
              </div>
            </div>

            {/* Submit */}
            <button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-lg py-3 text-white text-sm font-semibold shadow-lg shadow-violet-900/20 transition-all hover:scale-[1.02] mt-2">
              Create Workspace
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Already have an account? <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
