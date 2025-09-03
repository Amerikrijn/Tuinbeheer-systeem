/**
 * GardenUserAssignment Component Tests
 * Implemented by Senior IMPL Agent with banking standards compliance
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GardenUserAssignment } from '@/components/garden-user-assignment'

// Mock fetch
global.fetch = jest.fn()

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))

const mockUsers = [
  { id: '1', email: 'user1@example.com', name: 'User 1' },
  { id: '2', email: 'user2@example.com', name: 'User 2' }
]

const mockAssignedUsers = [
  { id: '3', email: 'user3@example.com', name: 'User 3' }
]

describe('GardenUserAssignment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders garden user assignment component', () => {
    render(<GardenUserAssignment gardenId="garden-1" />)
    
    expect(screen.getByText('Garden User Assignment')).toBeInTheDocument()
    expect(screen.getByText('Assign User to Garden')).toBeInTheDocument()
    expect(screen.getByText('Assigned Users')).toBeInTheDocument()
  })

  it('loads users and assigned users on mount', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockAssignedUsers })
      })

    render(<GardenUserAssignment gardenId="garden-1" />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/users')
      expect(fetch).toHaveBeenCalledWith('/api/admin/gardens/garden-1/users')
    })
  })

  it('assigns user to garden successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockAssignedUsers })
      })

    render(<GardenUserAssignment gardenId="garden-1" />)

    await waitFor(() => {
      expect(screen.getByText('Select a user')).toBeInTheDocument()
    })

    // Select user
    const selectTrigger = screen.getByRole('combobox')
    fireEvent.click(selectTrigger)

    await waitFor(() => {
      expect(screen.getByText('User 1 (user1@example.com)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('User 1 (user1@example.com)'))

    // Click assign button
    const assignButton = screen.getByText('Assign')
    fireEvent.click(assignButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/gardens/garden-1/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' })
      })
    })
  })

  it('handles assignment errors gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to assign user' })
      })

    render(<GardenUserAssignment gardenId="garden-1" />)

    await waitFor(() => {
      expect(screen.getByText('Select a user')).toBeInTheDocument()
    })

    // Select user and try to assign
    const selectTrigger = screen.getByRole('combobox')
    fireEvent.click(selectTrigger)

    await waitFor(() => {
      expect(screen.getByText('User 1 (user1@example.com)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('User 1 (user1@example.com)'))

    const assignButton = screen.getByText('Assign')
    fireEvent.click(assignButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to assign user')).toBeInTheDocument()
    })
  })

  it('removes user from garden successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockAssignedUsers })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })

    render(<GardenUserAssignment gardenId="garden-1" />)

    await waitFor(() => {
      expect(screen.getByText('User 3')).toBeInTheDocument()
    })

    // Click remove button
    const removeButton = screen.getByText('Remove')
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/gardens/garden-1/users/3', {
        method: 'DELETE'
      })
    })
  })
})
