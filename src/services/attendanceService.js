// Mock Attendance Data Service

const attendanceRecords = {
  '2025-10': [
    { employeeId: 1, totalDays: 31, workedDays: 22, paidLeave: 2, unpaidLeave: 0, holidays: 7 },
    { employeeId: 2, totalDays: 31, workedDays: 20, paidLeave: 3, unpaidLeave: 1, holidays: 7 },
    { employeeId: 3, totalDays: 31, workedDays: 21, paidLeave: 1, unpaidLeave: 2, holidays: 7 },
  ],
  '2025-09': [
    { employeeId: 1, totalDays: 30, workedDays: 22, paidLeave: 1, unpaidLeave: 0, holidays: 7 },
    { employeeId: 2, totalDays: 30, workedDays: 21, paidLeave: 2, unpaidLeave: 0, holidays: 7 },
    { employeeId: 3, totalDays: 30, workedDays: 20, paidLeave: 2, unpaidLeave: 1, holidays: 7 },
  ],
  '2025-08': [
    { employeeId: 1, totalDays: 31, workedDays: 23, paidLeave: 0, unpaidLeave: 0, holidays: 8 },
    { employeeId: 2, totalDays: 31, workedDays: 21, paidLeave: 2, unpaidLeave: 0, holidays: 8 },
    { employeeId: 3, totalDays: 31, workedDays: 22, paidLeave: 1, unpaidLeave: 0, holidays: 8 },
  ],
};

export const getAttendance = (period) => {
  const records = attendanceRecords[period] || [];
  return Promise.resolve([...records]);
};

export const getAttendanceByEmployee = (employeeId, period) => {
  const records = attendanceRecords[period] || [];
  const record = records.find((r) => r.employeeId === employeeId);
  return Promise.resolve(record ? { ...record } : null);
};

export const getAllAttendancePeriods = () => {
  return Promise.resolve(Object.keys(attendanceRecords).sort().reverse());
};

export default {
  getAttendance,
  getAttendanceByEmployee,
  getAllAttendancePeriods,
};
