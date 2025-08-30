import { NextResponse } from 'next/server'
import { updateGarden, getGarden } from '@/lib/database'

export async function GET() {
  try {
    console.log('Testing garden update functionality...')
    
    // Get the first garden
    const gardens = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/gardens?is_active=eq.true&limit=1`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      }
    }).then(res => res.json())
    
    if (!gardens || gardens.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No gardens found to test' 
      })
    }
    
    const garden = gardens[0]
    const originalData = { ...garden }
    
    // Test update
    const testUpdates = {
      name: garden.name + ' (Test)',
      length: '12.5',
      width: '9.5',
      description: 'Test update at ' + new Date().toISOString()
    }
    
    const updatedGarden = await updateGarden(garden.id, testUpdates)
    
    if (!updatedGarden) {
      return NextResponse.json({ 
        success: false, 
        message: 'Update failed' 
      })
    }
    
    // Verify the update
    const verifiedGarden = await getGarden(garden.id)
    
    // Restore original
    await updateGarden(garden.id, {
      name: originalData.name,
      length: originalData.length,
      width: originalData.width,
      description: originalData.description
    })
    
    return NextResponse.json({
      success: true,
      message: 'Garden update test successful',
      original: originalData,
      updated: updatedGarden,
      verified: verifiedGarden,
      updateWorked: verifiedGarden?.length === testUpdates.length && verifiedGarden?.width === testUpdates.width
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}