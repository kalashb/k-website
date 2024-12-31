import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Use the cookies() function to delete the cookie
  cookies().set('token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0)
  })
  
  return response
}

