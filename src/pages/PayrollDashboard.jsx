import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { supabase } from '../lib/supabase'

export default function PayrollDashboard() {
  const [payruns, setPayruns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPayroll() {
      try {
        setLoading(true)
        
        // Use true relational mapping, explicitly requesting linked employees data
        const { data, error: dbError } = await supabase
          .from('payroll')
          .select(`
            *,
            employees (
              id,
              name,
              email
            )
          `)
        
        if (dbError) throw dbError
        setPayruns(data || [])
      } catch (err) {
        console.error('Error fetching payroll:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPayroll()
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading payroll...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Payroll</h1>
        <Link to="/payrun">
          <Button variant="secondary">Open pay run</Button>
        </Link>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-medium text-white">Payrun list</h2>
        {payruns.length === 0 ? (
          <p className="text-sm text-gray-400">No payroll data found</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {payruns.map((pr) => (
              <Card key={pr.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-4">
                    {/* Access employee name through the explicit foreign-key join mapping */}
                    <p className="text-base text-white">{pr.employees?.name || 'Unknown Employee'}</p>
                    <p className="text-sm text-gray-400">Net Salary: {pr.net_salary || pr.amount || '—'}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium capitalize text-gray-300">
                    {pr.status || 'Computed'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}