import { NextResponse } from 'next/server'
import { getUser } from '@/lib/store'
import { signToken } from '@/lib/jwt'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 })
    }

    const user = await getUser(username, password)

    if (user) {
      const token = signToken({ userId: user.id, username: user.username })
      const response = NextResponse.json({ success: true, token })
      response.cookies.set('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 1 day
      })
      return response
    } else {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred during login' }, { status: 500 })
  }
}

