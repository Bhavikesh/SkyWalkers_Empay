'use client'

import React, { useState } from 'react'
import { CloudUpload } from 'lucide-react'

interface Props {
  companyName: string
}

export default function SettingsForm({ companyName }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    
    // Simulate API call for saving settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    setSaved(true)
    
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
          <input 
            type="text" 
            defaultValue={companyName}
            required
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Industry</label>
          <select className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer">
            <option>Fintech</option>
            <option>Healthcare</option>
            <option>Technology</option>
            <option>Retail</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Email</label>
        <input 
          type="email" 
          defaultValue="admin@empay.io"
          required
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Logo Upload</label>
        <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-8 flex flex-col items-center justify-center bg-[#111]/50 hover:bg-[#111] transition-colors cursor-pointer group">
          <CloudUpload size={24} className="text-gray-500 group-hover:text-violet-400 transition-colors mb-3" />
          <p className="text-sm text-gray-400 mb-1">Drag and drop your company logo here, or <span className="text-violet-400 font-medium">browse</span></p>
          <p className="text-[10px] text-gray-600">Recommended: 512x512px SVG or PNG (Max 2MB)</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-2">
        {saved && <span className="text-sm text-emerald-400 font-medium">Changes saved successfully!</span>}
        <button 
          type="submit"
          disabled={loading}
          className="bg-[#e9d5ff] hover:bg-[#d8b4fe] text-violet-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
