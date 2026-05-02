import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CalendarOff,
  Wallet,
  BarChart3,
  Settings,
  Hexagon,
} from 'lucide-react';

const navItems = [
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/time-off', label: 'Time Off', icon: CalendarOff },
  { to: '/payroll', label: 'Payroll', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/payroll') {
      return (
        location.pathname === '/payroll' ||
        location.pathname.startsWith('/payroll/') ||
        location.pathname.startsWith('/payrun') ||
        location.pathname.startsWith('/payslip')
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-bg border-r border-gray-800 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
          <Hexagon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">HRMS</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Payroll Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group
                ${
                  active
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-sidebar-hover border border-transparent'
                }
              `.trim()}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${
                  active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              <span>{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
