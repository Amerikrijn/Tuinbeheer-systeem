import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const bucket: string = typeof body.bucket === 'string' && body.bucket ? body.bucket : 'plant-images'
    const isPublic: boolean = typeof body.public === 'boolean' ? body.public : true

    const { data: existing, error: getError } = await supabase.storage.getBucket(bucket)
    if (existing && !getError) {
      return NextResponse.json({ exists: true, public: existing.public === true })
    }

    const { data: created, error: createError } = await supabase.storage.createBucket(bucket, { public: isPublic })
    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({ created: true, public: isPublic })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}