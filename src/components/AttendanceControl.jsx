import React, { useEffect, useState } from 'react'
import { Button } from './Button'
import { useUserAttendance } from '../context/UserAttendanceContext'

class AttendanceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AttendanceControl crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center rounded-2xl border border-red-800 bg-[#3a0f0f] p-5 shadow-sm text-red-200 text-sm">
          Attendance widget unavailable.
        </div>
      );
    }
    return this.props.children;
  }
}

function formatTime(time) {
  if (!time) return "Not checked in";
  const date = new Date(time);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function AttendanceControlInner() {
  const context = useUserAttendance();
  const [, setTick] = useState(0);

  useEffect(() => {
    console.log("Attendance Data:", context?.attendance);
    console.log("Check-in Time Value:", context?.attendance?.checkedInAt);
  }, [context]);

  if (!context) {
    return (
      <div className="flex items-center rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm text-gray-400 text-sm">
        Loading attendance...
      </div>
    );
  }

  const { attendance, checkIn, checkOut } = context;

  if (!attendance) {
    return (
      <div className="flex items-center rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm text-gray-400 text-sm">
        No attendance data available
      </div>
    );
  }

  useEffect(() => {
    if (attendance?.status !== 'in') return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [attendance?.status]);

  const checkedIn = attendance?.status === 'in' && attendance?.checkedInAt;

  return (
    <div className="flex items-center rounded-2xl border border-gray-800 bg-[#0f172a] p-5 shadow-sm">
      <div className="flex w-full min-w-0 items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={"h-8 w-8 shrink-0 rounded-full " + (checkedIn ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.7)]' : 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.55)]')}
            title={checkedIn ? 'Checked in' : 'Not checked in'}
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-col gap-4">
            <span className="text-sm text-gray-400">{checkedIn ? 'Checked in' : 'Not checked in'}</span>
            {attendance?.checkedInAt ? (
              <span className="text-base text-white">Since {formatTime(attendance.checkedInAt)}</span>
            ) : (
              <span className="text-base text-white">Not checked in</span>
            )}
          </div>
        </div>
        {!checkedIn ? (
          <Button onClick={checkIn}>Check In →</Button>
        ) : (
          <Button variant="secondary" onClick={checkOut}>
            Check Out →
          </Button>
        )}
      </div>
    </div>
  )
}

export function AttendanceControl() {
  return (
    <AttendanceErrorBoundary>
      <AttendanceControlInner />
    </AttendanceErrorBoundary>
  );
}