'use client'

import { useState } from 'react'

type Team = {
  id: string
  name: string
  course: string
  creator: string
  members: string[]
  pendingRequests: string[]
}

export default function TeamList({ teams, userId }: { teams: Team[], userId: string }) {
  const [localTeams, setLocalTeams] = useState(teams)

  const handleJoinRequest = async (teamId: string) => {
    const response = await fetch('/api/join-team', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ teamId, userId }),
    })
    if (response.ok) {
      setLocalTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? { ...team, pendingRequests: [...team.pendingRequests, userId] }
            : team
        )
      )
    }
  }

  return (
    <ul className="space-y-2">
      {localTeams.map(team => (
        <li key={team.id} className="border p-2 rounded">
          <h3 className="font-semibold">{team.name} - {team.course}</h3>
          <p>Members: {team.members.length}</p>
          {team.creator === userId && (
            <p>Pending Requests: {team.pendingRequests.length}</p>
          )}
          {!team.members.includes(userId) && !team.pendingRequests.includes(userId) && (
            <button
              onClick={() => handleJoinRequest(team.id)}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Request to Join
            </button>
          )}
          {team.pendingRequests.includes(userId) && (
            <p className="mt-2 text-yellow-600">Join request pending</p>
          )}
        </li>
      ))}
    </ul>
  )
}

