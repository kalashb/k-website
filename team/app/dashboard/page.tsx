import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { store } from '@/lib/store'
import TeamList from './team-list'
import CreateTeamForm from './create-team-form'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return <div>Please log in to view this page.</div>
  }

  const decodedToken = verifyToken(token) as { userId: number } | null

  if (!decodedToken) {
    return <div>Invalid token. Please log in again.</div>
  }

  const teams = await store.getTeamsByMember(decodedToken.userId)
  const courses = await store.getCourses()

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Teams</h2>
          <TeamList teams={teams} userId={decodedToken.userId} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Create a Team</h2>
          <CreateTeamForm courses={courses} userId={decodedToken.userId} />
        </div>
      </div>
    </div>
  )
}

