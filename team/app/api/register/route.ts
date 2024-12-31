import { NextResponse } from 'next/server'
import { store } from '@/lib/store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 })
    }

    const user = await store.addUser(username, password)

    if (user) {
      return NextResponse.json({ success: true, message: 'User registered successfully' })
    } else {
      return NextResponse.json({ success: false, message: 'Failed to register user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === '23505') { // Unique violation error code for PostgreSQL
      return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: 'An error occurred during registration' }, { status: 500 })
  }
}

