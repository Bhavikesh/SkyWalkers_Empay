import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PayrollProvider } from './context/PayrollContext';
import Sidebar from './components/Sidebar/Sidebar';
import PayrollDashboard from './pages/PayrollDashboard';
import PayrunPage from './pages/PayrunPage';
import PayslipView from './pages/PayslipView';
import PayslipPDFPage from './pages/PayslipPDFPage';
import ReportsPage from './pages/ReportsPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import SettingsPage from './pages/SettingsPage';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="flex-1 ml-[251px] px-6 py-4 overflow-x-hidden min-h-screen bg-[#0f172a]">
        <div className="w-full max-w-[1200px] mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/payroll" replace />} />
            <Route path="/payroll" element={<PayrollDashboard />} />
            <Route path="/payrun" element={<PayrunPage />} />
            <Route path="/payslip/:id" element={<PayslipView />} />
            <Route path="/payslip-pdf/:id" element={<PayslipPDFPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/time-off" element={<TimeOffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PayrollProvider>
        <AppLayout />
      </PayrollProvider>
    </BrowserRouter>
  );
}
