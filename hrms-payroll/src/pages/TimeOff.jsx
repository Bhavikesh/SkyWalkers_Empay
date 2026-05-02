import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { LeaveBalanceCard } from '../components/LeaveBalanceCard'
import { LeaveModal } from '../components/LeaveModal'
import { LeaveTable } from '../components/LeaveTable'
import { Table, TableCell, TableRow } from '../components/Table'
import { useUserAttendance } from '../context/UserAttendanceContext'
import {
  applyAllApprovedRequests,
  applyDeductionForRequest,
  cloneTimeOffEmployees,
  findEmployeeByName,
  timeOffEmployees,
} from '../services/mockTimeOffEmployees'
import { userCanApproveLeave } from '../utils/leavePermissions'

const initialRequests = [
  {
    id: 1,
    name: 'Priya Nair',
    startDate: '2025-10-28',
    endDate: '2025-10-28',
    type: 'Paid Time Off',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    startDate: '2025-11-04',
    endDate: '2025-11-06',
    type: 'Sick Time Off',
    status: 'Pending',
    certificateFileName: 'clinic_note_rahul.pdf',
  },
  {
    id: 3,
    name: 'Ananya Sharma',
    startDate: '2025-10-15',
    endDate: '2025-10-16',
    type: 'Paid Time Off',
    status: 'Approved',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    startDate: '2025-09-20',
    endDate: '2025-09-22',
    type: 'Unpaid Leave',
    status: 'Rejected',
  },
]

const allocationRows = [
  { dept: 'Engineering', ptoAllocated: 20, sickAllocated: 10, ptoUsed: 6, sickUsed: 2 },
  { dept: 'Finance', ptoAllocated: 18, sickAllocated: 10, ptoUsed: 4, sickUsed: 1 },
  { dept: 'HR', ptoAllocated: 22, sickAllocated: 12, ptoUsed: 5, sickUsed: 0 },
  { dept: 'Operations', ptoAllocated: 18, sickAllocated: 8, ptoUsed: 7, sickUsed: 3 },
  { dept: 'Sales', ptoAllocated: 16, sickAllocated: 8, ptoUsed: 5, sickUsed: 2 },
]

const allocationColumns = [
  { key: 'dept', label: 'Department' },
  { key: 'pto', label: 'PTO allocated' },
  { key: 'sick', label: 'Sick allocated' },
  { key: 'used', label: 'Used (PTO / Sick)' },
  { key: 'rem', label: 'Remaining (PTO / Sick)' },
]

export default function TimeOff() {
  const { user } = useUserAttendance()
  const [activeTab, setActiveTab] = useState(/** @type {'timeoff' | 'allocation'} */ ('timeoff'))
  const [leaveRequests, setLeaveRequests] = useState(initialRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [employees, setEmployees] = useState(() =>
    applyAllApprovedRequests(cloneTimeOffEmployees(), initialRequests),
  )
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(timeOffEmployees[0].id)

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) ?? employees[0]
  }, [employees, selectedEmployeeId])

  const canApprove = userCanApproveLeave(user)

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return leaveRequests
    return leaveRequests.filter((r) => r.name.toLowerCase().includes(q))
  }, [leaveRequests, searchQuery])

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return
    const matches = employees.filter((e) => e.name.toLowerCase().includes(q))
    if (matches.length === 1) setSelectedEmployeeId(matches[0].id)
  }, [searchQuery, employees])

  const handleRowSelect = (row) => {
    const emp = findEmployeeByName(row.name, employees)
    if (emp) setSelectedEmployeeId(emp.id)
  }

  const handleApprove = (id) => {
    if (!canApprove) return
    const req = leaveRequests.find((r) => r.id === id)
    if (!req || req.status !== 'Pending') return
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id && r.status === 'Pending' ? { ...r, status: 'Approved' } : r)),
    )
    setEmployees((emps) => applyDeductionForRequest(emps, req))
    // Show balances for the employee whose request was approved (avoids “sick not updating” when another employee is selected).
    const approver = timeOffEmployees.find((e) => e.name === req.name)
    if (approver) setSelectedEmployeeId(approver.id)
  }

  const handleReject = (id) => {
    if (!canApprove) return
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id && r.status === 'Pending' ? { ...r, status: 'Rejected' } : r)),
    )
  }

  const handleNewSubmit = (payload) => {
    setLeaveRequests((prev) => [
      ...prev,
      {
        id: prev.reduce((m, r) => Math.max(m, r.id), 0) + 1,
        name: payload.name,
        startDate: payload.startDate,
        endDate: payload.endDate,
        type: payload.type,
        status: 'Pending',
        ...(payload.certificateFileName ? { certificateFileName: payload.certificateFileName } : {}),
      },
    ])
  }

  const tabClass = (id) =>
    `border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
      activeTab === id ? 'border-violet-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
    }`

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-white">Time Off</h1>
        <div className="flex border-b border-gray-800">
          <button type="button" className={tabClass('timeoff')} onClick={() => setActiveTab('timeoff')}>
            Time Off
          </button>
          <button type="button" className={tabClass('allocation')} onClick={() => setActiveTab('allocation')}>
            Allocation
          </button>
        </div>
      </div>

      {activeTab === 'timeoff' ? (
        <>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex shrink-0 items-center gap-4">
              <Button type="button" onClick={() => setModalOpen(true)}>
                NEW
              </Button>
            </div>
            <div className="flex flex-1 justify-center lg:px-8">
              <input
                type="search"
                placeholder="Search by employee name…"
                className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0f172a] px-4 py-2 text-base text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search leave requests"
              />
            </div>
            <div className="hidden w-[72px] shrink-0 lg:block" aria-hidden />
          </div>

          {!canApprove ? (
            <p className="text-sm text-gray-500">You can view requests. Approvals require an Admin or HR role.</p>
          ) : null}

          <div className="flex flex-col gap-6">
            <label className="flex max-w-md flex-col gap-4">
              <span className="text-sm text-gray-400">Leave balance for</span>
              <select
                className="rounded-xl border border-gray-800 bg-[#0f172a] px-4 py-2 text-base text-white focus:border-violet-500 focus:outline-none"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-gray-500">
              Balances update when a request is approved (paid / sick days). Click a row to view that employee.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <LeaveBalanceCard title="Paid Time Off" daysAvailable={selectedEmployee.leaveBalance.paid} />
              <LeaveBalanceCard title="Sick Time Off" daysAvailable={selectedEmployee.leaveBalance.sick} />
            </div>
          </div>

          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-medium text-white">Leave requests</h2>
            {filteredRequests.length === 0 ? (
              <p className="rounded-2xl border border-gray-800 bg-[#0f172a] p-5 text-sm text-gray-400">
                No matching requests.
              </p>
            ) : (
              <LeaveTable
                rows={filteredRequests}
                canApprove={canApprove}
                onApprove={handleApprove}
                onReject={handleReject}
                onRowSelect={handleRowSelect}
              />
            )}
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-white">Leave allocation by department</h2>
          <Table columns={allocationColumns}>
            {allocationRows.map((row) => (
              <TableRow key={row.dept}>
                <TableCell>{row.dept}</TableCell>
                <TableCell>{row.ptoAllocated} days</TableCell>
                <TableCell>{row.sickAllocated} days</TableCell>
                <TableCell>
                  {row.ptoUsed} / {row.sickUsed}
                </TableCell>
                <TableCell>
                  {row.ptoAllocated - row.ptoUsed} / {row.sickAllocated - row.sickUsed}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </section>
      )}

      <LeaveModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleNewSubmit} />
    </div>
  )
}
