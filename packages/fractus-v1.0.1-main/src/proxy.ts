import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run on static files or API routes
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('/api/')) {
    return supabaseResponse
  }

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // PROTEÇÃO DE ROTAS
  // Se tentar acessar o dashboard ou root sem estar logado, redireciona pro login
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isRootRoute = request.nextUrl.pathname === '/'

  if (!user && (isDashboardRoute || isRootRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
