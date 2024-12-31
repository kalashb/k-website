import { NextResponse } from 'next/server'
import { verifyToken } from './lib/jwt'
import { cookies } from 'next/headers'

export function middleware(request: Request) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const decodedToken = verifyToken(token)

  if (!decodedToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}

