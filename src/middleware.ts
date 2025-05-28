import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is protected, redirect to login
  const protectedPaths = ['/dashboard', '/tracking', '/measurements', '/progress', '/profile']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  if (!session && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and the current path is auth pages or root, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/tracking/:path*', '/measurements/:path*', '/progress/:path*', '/profile/:path*', '/login', '/signup'],
}