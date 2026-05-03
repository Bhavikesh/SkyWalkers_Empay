import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { UserAttendanceProvider } from './context/UserAttendanceContext'
import Dashboard from './vite-pages/Dashboard'
import EmployeesPage from './vite-pages/EmployeesPage'
import AttendancePage from './vite-pages/AttendancePage'
import LeaveManagementPage from './vite-pages/LeaveManagementPage'
import PayrollPage from './vite-pages/PayrollPage'
import ReportsPage from './vite-pages/ReportsPage'

export default function App() {
  return (
    <UserAttendanceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave-management" element={<LeaveManagementPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserAttendanceProvider>
  )
}
