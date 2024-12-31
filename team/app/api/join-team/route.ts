import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { store } from '@/lib/store'

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  const decodedToken = token ? verifyToken(token) as { userId: number } | null : null

  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await request.json()
  await store.joinTeamRequest(teamId, decodedToken.userId)
  return NextResponse.json({ success: true })
}

