import { getPlantEmoji } from '@/lib/get-plant-emoji'

describe('getPlantEmoji', () => {
  it('returns stored emoji when provided', () => {
    expect(getPlantEmoji('zinnia', '🌼')).toBe('🌼')
  })

  it('matches plant names to specific emojis', () => {
    expect(getPlantEmoji('Sunflower')).toBe('🌻')
    expect(getPlantEmoji('tagetes')).toBe('🌼')
    expect(getPlantEmoji('Begonia')).toBe('🌸')
  })

  it('falls back to generic flower emoji', () => {
    expect(getPlantEmoji('unknown plant')).toBe('🌸')
  })
})
