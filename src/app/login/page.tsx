import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 h-screen mx-auto">
      <div className="flex flex-col mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">EmPay HRMS</h1>
        <p className="text-gray-500">Sign in to your account</p>
      </div>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md font-semibold" htmlFor="login_id">
          Login Id / Email :-
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="login_id"
          placeholder="OIJODO20240001 or you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button
          formAction={login}
          className="bg-blue-600 rounded-md px-4 py-2 text-white mb-2 transition-colors hover:bg-blue-700"
        >
          Sign In
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-100 text-red-600 text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
