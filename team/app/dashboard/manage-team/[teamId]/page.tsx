import { cookies } from 'next/headers'
import { store } from '@/lib/store'
import ManageTeamRequests from './manage-team-requests'

export default function ManageTeamPage({ params }: { params: { teamId: string } }) {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    return <div>Please log in to view this page.</div>
  }

  const team = store.getTeams().find(t => t.id === params.teamId)

  if (!team || team.creator !== userId) {
    return <div>You don't have permission to manage this team.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Team: {team.name}</h1>
      <ManageTeamRequests team={team} />
    </div>
  )
}

