import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Get the pathname of the request (e.g. /, /products, /checkout)
    const pathname = req.nextUrl.pathname

    // Check if user is authenticated
    const token = req.nextauth.token

    // Protected routes that require authentication
    const protectedRoutes = ['/checkout', '/profile', '/orders', '/admin']

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
      pathname.startsWith(route)
    )

    // If accessing a protected route without authentication
    if (isProtectedRoute && !token) {
      // Store the original URL they were trying to access
      const callbackUrl = encodeURIComponent(req.url)

      // Redirect to sign in with callback URL
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url)
      )
    }

    // If user is authenticated and trying to access auth pages, redirect to products
    if (token && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/products', req.url))
    }

    // Allow the request to continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // This callback is called for every request
        // Return true to allow the request, false to deny

        const pathname = req.nextUrl.pathname

        // Always allow access to public routes
        const publicRoutes = [
          '/',
          '/products',
          '/shop',
          '/how-it-works',
          '/auth',
          '/api/auth',
          '/api/products',
          '/api/shops',
          '/_next',
          '/favicon.ico',
          '/images',
          '/static'
        ]

        const isPublicRoute = publicRoutes.some(route =>
          pathname.startsWith(route)
        )

        if (isPublicRoute) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that don't require auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api/auth|api/products|api/shops|api/cart|_next/static|_next/image|favicon.ico|images|static).*)',
  ],
}
