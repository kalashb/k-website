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

export default function ManageTeamRequests({ team }: { team: Team }) {
  const [pendingRequests, setPendingRequests] = useState(team.pendingRequests)

  const handleRequest = async (userId: string, action: 'approve' | 'deny') => {
    const response = await fetch('/api/manage-team-request', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ teamId: team.id, userId, action }),
    })
    if (response.ok) {
      setPendingRequests(prevRequests => prevRequests.filter(id => id !== userId))
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul className="space-y-2">
          {pendingRequests.map(userId => (
            <li key={userId} className="flex items-center justify-between border p-2 rounded">
              <span>User ID: {userId}</span>
              <div>
                <button
                  onClick={() => handleRequest(userId, 'approve')}
                  className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRequest(userId, 'deny')}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

