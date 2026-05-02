'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
}

export default function SidebarLink({ href, icon, label }: SidebarLinkProps) {
  const pathname = usePathname()
  
  // Exact match for dashboard, prefix match for others
  const isActive = href === '/dashboard' 
    ? pathname === '/dashboard' 
    : pathname?.startsWith(href) || false

  return (
    <Link 
      href={href} 
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
        isActive 
          ? "bg-[#161328] text-violet-400 border border-violet-500/20 shadow-inner" 
          : "text-gray-400 hover:text-gray-200 hover:bg-[#111]"
      )}
    >
      <div className={clsx(
        "transition-colors",
        isActive ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300"
      )}>
        {icon}
      </div>
      {label}
    </Link>
  )
}
