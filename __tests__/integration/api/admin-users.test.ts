import { GET, POST, PUT, DELETE } from '@/app/api/admin/users/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: jest.fn(),
}))

const { getSupabaseAdminClient } = require('@/lib/supabase')

function createJsonRequest(body: any, url = 'http://localhost:3000/api/admin/users'): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
    nextUrl: new URL(url),
  } as unknown as NextRequest
}

describe('Admin Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET returns active users', async () => {
    const mockUsers = [
      { id: '1', email: 'a@example.com' },
    ]
    const order = jest.fn().mockResolvedValue({ data: mockUsers, error: null })
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order,
    }
    const from = jest.fn().mockReturnValue(query)
    const supabase = { from }
    getSupabaseAdminClient.mockReturnValue(supabase)

    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ users: mockUsers })
    expect(from).toHaveBeenCalledWith('users')
    expect(query.select).toHaveBeenCalled()
    expect(query.eq).toHaveBeenCalledWith('is_active', true)
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('POST rejects invalid data', async () => {
    const supabase = { from: jest.fn(), auth: { admin: {} } }
    getSupabaseAdminClient.mockReturnValue(supabase)
    const request = createJsonRequest({ email: 'invalid', fullName: 'Test', role: 'user' })

    const res = await POST(request)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid email format')
  })

  it('POST creates user with garden access', async () => {
    const userCheckQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }
    const insertProfile = jest.fn().mockResolvedValue({ error: null })
    const insertAccess = jest.fn().mockResolvedValue({ error: null })
    const from = jest
      .fn()
      .mockReturnValueOnce(userCheckQuery)
      .mockReturnValueOnce({ insert: insertProfile })
      .mockReturnValueOnce({ insert: insertAccess })
    const supabase = {
      from,
      auth: { admin: { createUser: jest.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null }) } },
    }
    getSupabaseAdminClient.mockReturnValue(supabase)

    const request = createJsonRequest({
      email: 'test@example.com',
      fullName: 'Test',
      role: 'user',
      gardenAccess: ['g1'],
    })

    const res = await POST(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(insertProfile).toHaveBeenCalled()
    expect(insertAccess).toHaveBeenCalledWith([
      {
        user_id: 'new-user',
        garden_id: 'g1',
        granted_by: null,
        created_at: expect.any(String),
      },
    ])
  })

  it('PUT handles reset_password', async () => {
    const selectQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '1', email: 'a@example.com', full_name: 'User', role: 'user' },
        error: null,
      }),
    }
    const updateQuery = {
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    }
    const from = jest.fn().mockReturnValueOnce(selectQuery).mockReturnValueOnce(updateQuery)
    const supabase = {
      from,
      auth: { admin: { updateUserById: jest.fn().mockResolvedValue({ error: null }) } },
    }
    getSupabaseAdminClient.mockReturnValue(supabase)

    const request = createJsonRequest({ userId: '1', action: 'reset_password' })
    const res = await PUT(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('1', expect.any(Object))
    expect(updateQuery.update).toHaveBeenCalled()
  })

  it('PUT handles edit_user', async () => {
    const selectQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '1', email: 'a@example.com', full_name: 'User', role: 'user' },
        error: null,
      }),
    }
    const updateQuery = {
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    }
    const deleteQuery = {
      delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    }
    const insertAccess = jest.fn().mockResolvedValue({ error: null })
    const from = jest
      .fn()
      .mockReturnValueOnce(selectQuery)
      .mockReturnValueOnce(updateQuery)
      .mockReturnValueOnce(deleteQuery)
      .mockReturnValueOnce({ insert: insertAccess })
    const supabase = { from }
    getSupabaseAdminClient.mockReturnValue(supabase)

    const request = createJsonRequest({
      userId: '1',
      action: 'edit_user',
      fullName: 'New Name',
      role: 'admin',
      gardenAccess: ['g1'],
    })

    const res = await PUT(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(updateQuery.update).toHaveBeenCalled()
    expect(deleteQuery.delete).toHaveBeenCalled()
    expect(insertAccess).toHaveBeenCalledWith([
      {
        user_id: '1',
        garden_id: 'g1',
        granted_by: null,
        created_at: expect.any(String),
      },
    ])
  })

  it('DELETE soft-deletes a user', async () => {
    const selectQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '1', email: 'a@example.com', full_name: 'User', role: 'user' },
        error: null,
      }),
    }
    const updateQuery = {
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
    }
    const from = jest.fn().mockReturnValueOnce(selectQuery).mockReturnValueOnce(updateQuery)
    const supabase = { from }
    getSupabaseAdminClient.mockReturnValue(supabase)

    const request = {
      nextUrl: new URL('http://localhost:3000/api/admin/users?userId=1'),
      headers: new Headers(),
    } as unknown as NextRequest

    const res = await DELETE(request)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(updateQuery.update).toHaveBeenCalled()
  })
})

