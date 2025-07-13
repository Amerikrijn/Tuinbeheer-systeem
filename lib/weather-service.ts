// Weather service for dynamic theming and logging
export interface WeatherData {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "stormy"
  humidity?: number
  windSpeed?: number
  description: string
}

export const getCurrentWeather = async (): Promise<WeatherData> => {
  // Simulate weather API call
  const conditions = ["sunny", "cloudy", "rainy", "stormy"] as const
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

  const weatherData: Record<typeof randomCondition, WeatherData> = {
    sunny: {
      temperature: Math.floor(Math.random() * 10) + 20, // 20-30°C
      condition: "sunny",
      humidity: Math.floor(Math.random() * 20) + 40, // 40-60%
      windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
      description: "Zonnig en helder",
    },
    cloudy: {
      temperature: Math.floor(Math.random() * 8) + 15, // 15-23°C
      condition: "cloudy",
      humidity: Math.floor(Math.random() * 20) + 60, // 60-80%
      windSpeed: Math.floor(Math.random() * 15) + 10, // 10-25 km/h
      description: "Bewolkt",
    },
    rainy: {
      temperature: Math.floor(Math.random() * 8) + 10, // 10-18°C
      condition: "rainy",
      humidity: Math.floor(Math.random() * 20) + 80, // 80-100%
      windSpeed: Math.floor(Math.random() * 20) + 15, // 15-35 km/h
      description: "Regenachtig",
    },
    stormy: {
      temperature: Math.floor(Math.random() * 6) + 8, // 8-14°C
      condition: "stormy",
      humidity: 95,
      windSpeed: Math.floor(Math.random() * 30) + 40, // 40-70 km/h
      description: "Stormachtig",
    },
  }

  return weatherData[randomCondition]
}

export const getWeatherTheme = (condition: WeatherData["condition"]) => {
  switch (condition) {
    case "sunny":
      return {
        primary: "bg-yellow-50",
        secondary: "bg-orange-100",
        accent: "bg-yellow-500",
        text: "text-yellow-800",
        header: "bg-gradient-to-r from-yellow-500 to-orange-500",
        card: "bg-white border-yellow-200",
        description: "🌞 Perfecte dag voor tuinieren!",
      }
    case "cloudy":
      return {
        primary: "bg-gray-50",
        secondary: "bg-blue-100",
        accent: "bg-blue-500",
        text: "text-blue-800",
        header: "bg-gradient-to-r from-blue-500 to-gray-500",
        card: "bg-white border-gray-200",
        description: "☁️ Ideaal weer voor tuinwerk",
      }
    case "rainy":
      return {
        primary: "bg-slate-100",
        secondary: "bg-slate-200",
        accent: "bg-slate-600",
        text: "text-slate-800",
        header: "bg-gradient-to-r from-slate-600 to-slate-700",
        card: "bg-white border-slate-300",
        description: "🌧️ Binnenactiviteiten aanbevolen",
      }
    case "stormy":
      return {
        primary: "bg-gray-200",
        secondary: "bg-gray-300",
        accent: "bg-gray-700",
        text: "text-gray-900",
        header: "bg-gradient-to-r from-gray-700 to-gray-800",
        card: "bg-white border-gray-400",
        description: "⛈️ Sessie mogelijk geannuleerd",
      }
    default:
      return {
        primary: "bg-green-50",
        secondary: "bg-green-100",
        accent: "bg-green-600",
        text: "text-green-800",
        header: "bg-green-600",
        card: "bg-white border-green-200",
        description: "🌱 Normale tuindag",
      }
  }
}
