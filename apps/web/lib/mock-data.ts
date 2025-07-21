export interface Plant {
  id: string
  name: string
  color: string
  height: number
  plantingDate: string
  status: string
  notes?: string
}

export interface PlantBed {
  id: string
  garden_id: string
  name: string
  location: string
  size: string
  soilType: string
  sunExposure: string
  description?: string
  plants: Plant[]
  lastModifiedDate: string
  lastModifiedBy?: string
}

export interface Garden {
  id: string
  name: string
  description: string
  location: string
  totalArea: string
  length: string
  width: string
  gardenType: string
  establishedDate: string
  lastModifiedDate: string
  lastModifiedBy: string
  notes?: string
}

export interface GardenSession {
  id: number
  title: string
  description: string
  date: string
  time: string
  location?: string
  maxVolunteers: number
  registeredVolunteers: string[]
  tasks: Task[]
  attendance: string[]
  progressEntries: ProgressEntry[]
  sessionCompleted: boolean
  sessionType?: "single" | "recurring"
  repeatFrequency?: "weekly" | "monthly"
  repeatUntil?: string
  weather?: WeatherEntry
}

export interface Task {
  id: number
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  status: "not-started" | "in-progress" | "completed"
  photos: string[]
  addedBy: string
  completedBy?: string
  completedDate?: string
  comments?: Comment[]
}

export interface Comment {
  id: number
  text: string
  author: string
  date: string
}

export interface ProgressEntry {
  id: number
  title: string
  description: string
  photos: string[]
  addedBy: string
  date: string
}

export interface WeatherEntry {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  recordedBy: string
  recordedAt: string
  weatherType: string
}

export interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  duration: string
  location: string
  maxVolunteers: number
  registeredVolunteers: number
  category: string
  isRecurring: boolean
  recurringType?: string
  recurringEnd?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "volunteer"
  registeredAt: string
}

// Mock data functions
export function getMockPlantBeds(): PlantBed[] {
  return [
    {
      id: "A",
      garden_id: "1",
      name: "Rose Garden",
      location: "Front entrance area",
      size: "Large (15-30m²)",
      soilType: "Clay soil with compost",
      sunExposure: "full-sun",
      description: "Beautiful rose garden at the main entrance",
      plants: [
        {
          id: "1",
          name: "Red Rose",
          color: "Red",
          height: 80,
          plantingDate: "2024-03-15",
          status: "Healthy",
          notes: "Blooming well",
        },
        {
          id: "2",
          name: "White Rose",
          color: "White",
          height: 75,
          plantingDate: "2024-03-15",
          status: "Healthy",
        },
      ],
      lastModifiedDate: "2024-11-15",
      lastModifiedBy: "Garden Admin",
    },
    {
      id: "B",
      garden_id: "1",
      name: "Herb Garden",
      location: "Near the kitchen area",
      size: "Medium (5-15m²)",
      soilType: "Humus-rich soil",
      sunExposure: "partial-sun",
      description: "Culinary herbs for cooking",
      plants: [
        {
          id: "3",
          name: "Basil",
          color: "Green",
          height: 25,
          plantingDate: "2024-04-01",
          status: "Healthy",
        },
        {
          id: "4",
          name: "Rosemary",
          color: "Green",
          height: 40,
          plantingDate: "2024-03-20",
          status: "Healthy",
        },
      ],
      lastModifiedDate: "2024-11-10",
      lastModifiedBy: "Volunteer",
    },
    {
      id: "C",
      garden_id: "1",
      name: "Vegetable Patch",
      location: "South side of garden",
      size: "Extra large (> 30m²)",
      soilType: "Sandy soil with compost",
      sunExposure: "full-sun",
      description: "Seasonal vegetables and crops",
      plants: [
        {
          id: "5",
          name: "Tomatoes",
          color: "Red",
          height: 120,
          plantingDate: "2024-05-01",
          status: "Healthy",
        },
      ],
      lastModifiedDate: "2024-11-12",
      lastModifiedBy: "Garden Admin",
    },
  ]
}

export function getMockGarden(): Garden {
  return {
    id: "main-garden",
    name: "Community Garden",
    description: "A beautiful community garden where volunteers come together to grow plants and vegetables",
    location: "123 Garden Street, Green City",
    totalArea: "450m²",
    length: "30m",
    width: "15m",
    gardenType: "Community garden",
    establishedDate: "2020-03-15",
    lastModifiedDate: "2024-11-15",
    lastModifiedBy: "Garden Admin",
    notes: "The garden is divided into multiple plant beds with different themes and purposes.",
  }
}

export function getMockSessions(): GardenSession[] {
  return [
    {
      id: 1,
      title: "Spring Planting Session",
      description: "Plant new flowers and vegetables for the spring season",
      date: "2024-12-20",
      time: "09:00",
      location: "Main Garden Area",
      maxVolunteers: 8,
      registeredVolunteers: ["Alice", "Bob", "Charlie"],
      tasks: [
        {
          id: 1,
          title: "Prepare soil in bed A",
          description: "Remove weeds and add compost",
          priority: "high",
          status: "not-started",
          photos: [],
          addedBy: "Garden Admin",
        },
        {
          id: 2,
          title: "Plant spring flowers",
          description: "Plant tulips and daffodils",
          priority: "medium",
          status: "not-started",
          photos: [],
          addedBy: "Garden Admin",
        },
      ],
      attendance: [],
      progressEntries: [],
      sessionCompleted: false,
      weather: {
        temperature: 18,
        condition: "Sunny",
        humidity: 65,
        windSpeed: 5,
        recordedBy: "Weather Station",
        recordedAt: "2024-12-20T09:00:00Z",
        weatherType: "sunny",
      },
    },
    {
      id: 2,
      title: "Garden Maintenance",
      description: "General maintenance and weeding",
      date: "2024-11-15",
      time: "10:00",
      location: "All Plant Beds",
      maxVolunteers: 6,
      registeredVolunteers: ["Alice", "David"],
      tasks: [
        {
          id: 3,
          title: "Weed removal",
          description: "Remove weeds from all beds",
          priority: "high",
          status: "completed",
          photos: ["/placeholder.svg?height=200&width=300"],
          addedBy: "Garden Admin",
          completedBy: "Alice",
          completedDate: "2024-11-15",
        },
      ],
      attendance: ["Alice", "David"],
      progressEntries: [
        {
          id: 1,
          title: "Weeding completed",
          description: "All beds are now weed-free",
          photos: ["/placeholder.svg?height=200&width=300"],
          addedBy: "Alice",
          date: "2024-11-15",
        },
      ],
      sessionCompleted: true,
      weather: {
        temperature: 15,
        condition: "Cloudy",
        humidity: 70,
        windSpeed: 8,
        recordedBy: "Weather Station",
        recordedAt: "2024-11-15T10:00:00Z",
        weatherType: "cloudy",
      },
    },
  ]
}

export function getMockEvents(): Event[] {
  return [
    {
      id: 1,
      title: "Weekly Garden Maintenance",
      description: "Regular maintenance of all plant beds",
      date: "2024-12-21",
      time: "09:00",
      duration: "3",
      location: "Main Garden",
      maxVolunteers: 8,
      registeredVolunteers: 5,
      category: "Maintenance",
      isRecurring: true,
      recurringType: "weekly",
    },
    {
      id: 2,
      title: "Herb Garden Workshop",
      description: "Learn about growing and caring for herbs",
      date: "2024-12-28",
      time: "14:00",
      duration: "2",
      location: "Herb Garden Area",
      maxVolunteers: 12,
      registeredVolunteers: 8,
      category: "Event",
      isRecurring: false,
    },
  ]
}

export function getMockUsers(): User[] {
  return [
    {
      id: 1,
      name: "Garden Admin",
      email: "admin@garden.com",
      role: "admin",
      registeredAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Alice Volunteer",
      email: "alice@garden.com",
      role: "volunteer",
      registeredAt: "2024-02-15T00:00:00Z",
    },
    {
      id: 3,
      name: "Bob Volunteer",
      email: "bob@garden.com",
      role: "volunteer",
      registeredAt: "2024-03-01T00:00:00Z",
    },
  ]
}
