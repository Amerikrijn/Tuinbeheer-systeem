import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatArea(area: number): string {
  if (area < 1) {
    return `${(area * 10000).toFixed(0)} cm²`
  }
  return `${area.toFixed(1)} m²`
}

export function parseDimensions(dimensionString: string) {
  const match = dimensionString.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
  if (match) {
    return {
      length: parseFloat(match[1]),
      width: parseFloat(match[2])
    }
  }
  return null
}