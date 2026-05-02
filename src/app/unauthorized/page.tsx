import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 h-screen mx-auto text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
      <p className="text-gray-600 mb-8">
        You do not have permission to access this page. Your role restricts you from viewing this content.
      </p>
      <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  )
}
