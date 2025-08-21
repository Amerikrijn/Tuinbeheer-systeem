import { POST } from '@/app/api/user/change-password/route'
import type { NextRequest } from 'next/server'
import { vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: vi.fn(),
}))
import { getSupabaseAdminClient } from '@/lib/supabase'

const mockGetUserById = jest.fn()
const mockUpdateUserById = jest.fn()
const mockEq = jest.fn()
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate })

const mockSupabase = {
  auth: {
    admin: {
      getUserById: mockGetUserById,
      updateUserById: mockUpdateUserById,
    },
  },
  from: mockFrom,
}

function createRequest(body: any): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('Change Password API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseAdminClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 400 when fields are missing', async () => {
    const req = createRequest({ userId: '1', currentPassword: 'old' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 for weak password', async () => {
    const req = createRequest({ userId: '1', currentPassword: 'old', newPassword: 'short' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Password must be at least 8 characters')
  })

  it('returns 404 for nonexistent user', async () => {
    mockGetUserById.mockResolvedValue({ data: { user: null }, error: null })
    const req = createRequest({ userId: '1', currentPassword: 'old', newPassword: 'newpassword' })
    const res = await POST(req)
    expect(mockGetUserById).toHaveBeenCalledWith('1')
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('User not found')
  })

  it('returns success when password is changed', async () => {
    mockGetUserById.mockResolvedValue({ data: { user: {} }, error: null })
    mockUpdateUserById.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null })

    const req = createRequest({ userId: '1', currentPassword: 'old', newPassword: 'newpassword' })
    const res = await POST(req)

    expect(mockUpdateUserById).toHaveBeenCalledWith('1', { password: 'newpassword' })
    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(mockEq).toHaveBeenCalledWith('id', '1')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Password changed successfully')
  })
})
