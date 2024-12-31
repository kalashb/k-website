import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { store } from '@/lib/store'

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  const decodedToken = token ? verifyToken(token) as { userId: number } | null : null

  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { teamId, userId, action } = await request.json()
  
  if (action === 'approve') {
    await store.approveJoinRequest(teamId, userId)
  } else if (action === 'deny') {
    await store.denyJoinRequest(teamId, userId)
  }

  return NextResponse.json({ success: true })
}

