import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import EmployeesPage from './pages/EmployeesPage'
import AttendancePage from './pages/AttendancePage'
import TimeOffPage from './pages/TimeOffPage'
import PayrollPage from './pages/PayrollPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import LeaveManagementPage from './pages/LeaveManagementPage'

export default function App() {
  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            {/* /timeoff alias → same page as /time-off */}
            <Route path="/timeoff"    element={<Navigate to="/time-off" replace />} />
            <Route path="/time-off"   element={<TimeOffPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leave-management" element={<LeaveManagementPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
