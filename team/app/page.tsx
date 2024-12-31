import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to Course Team Manager</h1>
        <div className="space-y-4">
          <Link href="/login" className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
            Login
          </Link>
          <Link href="/register" className="block w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

