import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pl-64">
        <Header />
        <main className="flex flex-1 flex-col px-6 py-4">
          <div className="mx-auto w-full max-w-7xl flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
