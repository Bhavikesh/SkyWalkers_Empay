import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PayrollProvider } from './context/PayrollContext'
import { UserAttendanceProvider } from './context/UserAttendanceContext'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Dashboard from './pages/Dashboard'
import PayrollDashboard from './pages/PayrollDashboard'
import Payrun from './pages/Payrun'
import Payslip from './pages/Payslip'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import TimeOff from './pages/TimeOff'
import Settings from './pages/Settings'

export default function App() {
  return (
    <UserAttendanceProvider>
      <PayrollProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/time-off" element={<TimeOff />} />
              <Route path="/payroll" element={<PayrollDashboard />} />
              <Route path="/payrun" element={<Payrun />} />
              <Route path="/payslip" element={<Payslip />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PayrollProvider>
    </UserAttendanceProvider>
  )
}
