import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const bucket: string = typeof body.bucket === 'string' && body.bucket ? body.bucket : 'plant-images'
    const isPublic: boolean = typeof body.public === 'boolean' ? body.public : true

    const { data: existing, error: getError } = await supabaseAdmin.storage.getBucket(bucket)
    if (existing && !getError) {
      return NextResponse.json({ exists: true, public: existing.public === true })
    }

    const { data: created, error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: isPublic })
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({ created: true, public: isPublic })
  } catch (error: unknown) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}