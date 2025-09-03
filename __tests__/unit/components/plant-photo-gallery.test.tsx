import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlantPhotoGallery } from '@/components/plant-photo-gallery'
import { LogbookService } from '@/lib/services/database.service'

// Mock the LogbookService
jest.mock('@/lib/services/database.service')
const mockLogbookService = LogbookService as jest.Mocked<typeof LogbookService>

// Mock data
const mockPhotoData = {
  photos: [
    {
      id: '1',
      photo_url: 'https://example.com/photo1.jpg',
      entry_date: '2024-01-15',
      plant_bed_name: 'Bed A',
      plant_name: 'Tomato',
      plant_variety: 'Cherry',
      notes: 'Growing well'
    },
    {
      id: '2',
      photo_url: 'https://example.com/photo2.jpg',
      entry_date: '2024-02-01',
      plant_bed_name: 'Bed B',
      plant_name: 'Lettuce',
      notes: 'Ready to harvest'
    }
  ],
  totalCount: 2,
  hasMorePhotos: false
}

describe('PlantPhotoGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLogbookService.getPlantPhotos.mockResolvedValue({
      success: true,
      data: mockPhotoData
    })
  })

  it('renders loading state initially', () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    expect(screen.getByText('Foto\'s van Test Plant')).toBeInTheDocument()
    expect(screen.getByText('Foto\'s van Test Plant')).toBeInTheDocument()
  })

  it('loads and displays photos successfully', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('2 foto\'s dit jaar')).toBeInTheDocument()
    })
    
    expect(screen.getByAltText('Foto van Test Plant op 15 januari 2024')).toBeInTheDocument()
    expect(screen.getByAltText('Foto van Test Plant op 1 februari 2024')).toBeInTheDocument()
  })

  it('handles photo click and opens dialog', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByAltText('Foto van Test Plant op 15 januari 2024')).toBeInTheDocument()
    })
    
    const firstPhoto = screen.getByAltText('Foto van Test Plant op 15 januari 2024')
    fireEvent.click(firstPhoto)
    
    expect(screen.getByText('Foto van Test Plant')).toBeInTheDocument()
    expect(screen.getByText('Datum:')).toBeInTheDocument()
    // Use getAllByText since the date appears multiple times
    expect(screen.getAllByText('15 januari 2024')).toHaveLength(2)
  })

  it('displays photo details in dialog', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByAltText('Foto van Test Plant op 15 januari 2024')).toBeInTheDocument()
    })
    
    const firstPhoto = screen.getByAltText('Foto van Test Plant op 15 januari 2024')
    fireEvent.click(firstPhoto)
    
    expect(screen.getByText('Locatie:')).toBeInTheDocument()
    expect(screen.getByText('Bed A')).toBeInTheDocument()
    expect(screen.getByText('Plant:')).toBeInTheDocument()
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('Variëteit:')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
    expect(screen.getByText('Notities:')).toBeInTheDocument()
    expect(screen.getByText('Growing well')).toBeInTheDocument()
  })

  it('closes dialog when close button is clicked', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByAltText('Foto van Test Plant op 15 januari 2024')).toBeInTheDocument()
    })
    
    const firstPhoto = screen.getByAltText('Foto van Test Plant op 15 januari 2024')
    fireEvent.click(firstPhoto)
    
    expect(screen.getByText('Foto van Test Plant')).toBeInTheDocument()
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(screen.queryByText('Foto van Test Plant')).not.toBeInTheDocument()
  })

  it('handles year navigation', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('2 foto\'s dit jaar')).toBeInTheDocument()
    })
    
    // Get buttons by their position since they don't have accessible names
    const buttons = screen.getAllByRole('button')
    const prevButton = buttons[0] // First button (previous year)
    const nextButton = buttons[1] // Second button (next year)
    
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
    
    fireEvent.click(prevButton)
    expect(mockLogbookService.getPlantPhotos).toHaveBeenCalledWith('123', 2025)
    
    fireEvent.click(nextButton)
    expect(mockLogbookService.getPlantPhotos).toHaveBeenCalledWith('123', 2025)
  })

  it('shows more photos button when hasMorePhotos is true', async () => {
    const mockDataWithMore = {
      ...mockPhotoData,
      hasMorePhotos: true
    }
    
    mockLogbookService.getPlantPhotos.mockResolvedValue({
      success: true,
      data: mockDataWithMore
    })
    
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('Alle 2 foto\'s bekijken')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    mockLogbookService.getPlantPhotos.mockResolvedValue({
      success: false,
      error: 'Failed to load photos'
    })
    
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('Fout bij laden van foto\'s')).toBeInTheDocument()
    })
  })

  it('handles service exception', async () => {
    mockLogbookService.getPlantPhotos.mockRejectedValue(new Error('Service error'))
    
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('Fout bij laden van foto\'s')).toBeInTheDocument()
    })
  })

  it('formats dates correctly', async () => {
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('15 januari 2024')).toBeInTheDocument()
      expect(screen.getByText('1 februari 2024')).toBeInTheDocument()
    })
  })

  it('handles invalid date gracefully', async () => {
    const mockDataWithInvalidDate = {
      photos: [
        {
          ...mockPhotoData.photos[0],
          entry_date: 'invalid-date'
        }
      ],
      totalCount: 1,
      hasMorePhotos: false
    }
    
    mockLogbookService.getPlantPhotos.mockResolvedValue({
      success: true,
      data: mockDataWithInvalidDate
    })
    
    render(<PlantPhotoGallery plantId="123" plantName="Test Plant" />)
    
    await waitFor(() => {
      expect(screen.getByText('invalid-date')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(
      <PlantPhotoGallery 
        plantId="123" 
        plantName="Test Plant" 
        className="custom-class" 
      />
    )
    
    const card = screen.getByText('Foto\'s van Test Plant').closest('.custom-class')
    expect(card).toBeInTheDocument()
  })
})