import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Helper to build consistent JSON responses
function json(data: any, status = 200) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}

/**
 * POST /api/user/avatar
 * Body: { url: string }
 * Sets / replaces the user's custom avatar URL.
 *
 * Expected flow on the client:
 *  1. Upload image to storage (e.g. S3 / Cloudinary) and obtain a public URL.
 *  2. Call this endpoint with { url }.
 *  3. Update local UI with returned avatar.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return json({ message: 'Unauthorized' }, 401)
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ message: 'Invalid JSON body' }, 400)
    }

    const url = (body as any)?.url
    if (!url || typeof url !== 'string') {
      return json({ message: 'Field "url" (string) is required' }, 400)
    }

    // Basic sanity checks (avoid data: URIs or extremely short strings)
    if (!/^https?:\/\//i.test(url) || url.length < 12) {
      return json({ message: 'Avatar URL must be a valid http(s) URL' }, 400)
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { customAvatarUrl: url }
    })

    return json({
      message: 'Avatar updated',
      avatar: url
    })
  } catch (err) {
    console.error('POST /api/user/avatar error:', err)
    return json({ message: 'Internal server error' }, 500)
  }
}

/**
 * DELETE /api/user/avatar
 * Reverts to the provider (e.g. Google) image by clearing customAvatarUrl.
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return json({ message: 'Unauthorized' }, 401)
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { customAvatarUrl: null }
    })

    return json({ message: 'Reverted to provider avatar' })
  } catch (err) {
    console.error('DELETE /api/user/avatar error:', err)
    return json({ message: 'Internal server error' }, 500)
  }
}
