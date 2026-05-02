'use client'

import { useState } from 'react'
import { createUser } from './actions'
import Link from 'next/link'

export default function CreateEmployeePage() {
  const [result, setResult] = useState<{ type: 'error' | 'success', text: string, creds?: any } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createUser(formData)
    
    if (res?.error) {
      setResult({ type: 'error', text: res.error })
    } else if (res?.success) {
      setResult({ 
        type: 'success', 
        text: 'Employee created successfully!', 
        creds: { loginId: res.generatedId, password: res.generatedPassword }
      })
      e.currentTarget.reset()
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold">Create New Employee</h1>
      </div>
      
      {result && result.type === 'error' && (
        <div className="p-4 mb-6 rounded-md bg-red-100 text-red-700">
          {result.text}
        </div>
      )}

      {result && result.type === 'success' && (
        <div className="p-6 mb-6 rounded-md bg-green-50 border border-green-200">
          <h2 className="text-green-800 font-bold text-lg mb-2">{result.text}</h2>
          <p className="text-sm text-green-700 mb-4">The following credentials should be emailed to the employee:</p>
          <div className="bg-white p-4 rounded border font-mono text-sm shadow-sm">
            <p><strong>Login ID:</strong> {result.creds?.loginId}</p>
            <p><strong>Password:</strong> {result.creds?.password}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input required name="first_name" className="w-full border p-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input required name="last_name" className="w-full border p-2 rounded-md" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Personal Email</label>
          <input required type="email" name="email" className="w-full border p-2 rounded-md" />
          <p className="text-xs text-gray-500 mt-1">Credentials will be sent to this email.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input required name="department" className="w-full border p-2 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">System Role / Permissions</label>
          <select required name="role" className="w-full border p-2 rounded-md">
            <option value="Employee">Employee (Standard Access)</option>
            <option value="HR Officer">HR Officer</option>
            <option value="Payroll Officer">Payroll Officer</option>
            <option value="Admin">Admin (Full Access)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold mt-4"
        >
          {loading ? 'Generating Employee Profile...' : 'Create Employee Profile & Credentials'}
        </button>
      </form>
    </div>
  )
}
