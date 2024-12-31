import { NextResponse } from 'next/server'
import { addUser } from '@/lib/store'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 })
    }

    const user = await addUser(username, password)

    if (user) {
      return NextResponse.json({ success: true, message: 'User registered successfully' })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to register user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, message: 'An error occurred during registration' }, { status: 500 })
  }
}

