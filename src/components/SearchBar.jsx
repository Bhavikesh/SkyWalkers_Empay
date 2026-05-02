export function SearchBar({ value, onChange }) {
  return (
    <label className="block w-full">
      <span className="sr-only">Search by employee name</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name..."
          className="w-full rounded-xl border border-gray-800 bg-[#111827] py-2.5 pl-10 pr-4 text-sm text-white shadow-inner placeholder:text-gray-500 transition-all focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
    </label>
  )
}
