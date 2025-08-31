import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// DELETE /api/gardens/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { error } = await supabase
      .from('gardens')
      .update({ is_active: false })
      .eq('id', params.id)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete garden' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}