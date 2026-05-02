import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pl-64 print:pl-0">
        <Header />
        <main className="flex flex-1 flex-col px-6 py-4 print:p-0">
          <div className="mx-auto w-full max-w-7xl flex-1 print:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
