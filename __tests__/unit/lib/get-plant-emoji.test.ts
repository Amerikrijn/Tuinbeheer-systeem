import { getPlantEmoji } from '@/lib/get-plant-emoji'

describe('getPlantEmoji', () => {
  describe('when storedEmoji is provided', () => {
    it('should return stored emoji when it exists and is not empty', () => {
      expect(getPlantEmoji('test plant', '🌹')).toBe('🌹')
      expect(getPlantEmoji('test plant', '🍀')).toBe('🍀')
      expect(getPlantEmoji('test plant', '🌿')).toBe('🌿')
    })

    it('should return stored emoji even when name is empty', () => {
      expect(getPlantEmoji('', '🌹')).toBe('🌹')
      expect(getPlantEmoji(undefined, '🍀')).toBe('🍀')
    })

    it('should ignore stored emoji when it is empty or whitespace', () => {
      expect(getPlantEmoji('zinnia', '')).toBe('🌻')
      expect(getPlantEmoji('zinnia', '   ')).toBe('🌻')
      expect(getPlantEmoji('zinnia', '\t\n')).toBe('🌻')
    })
  })

  describe('when no storedEmoji is provided', () => {
    it('should return specific emoji for zinnia', () => {
      expect(getPlantEmoji('zinnia')).toBe('🌻')
      expect(getPlantEmoji('ZINNIA')).toBe('🌻')
      expect(getPlantEmoji('Zinnia Flower')).toBe('🌻')
      expect(getPlantEmoji('My Zinnia Plant')).toBe('🌻')
    })

    it('should return specific emoji for marigold and tagetes', () => {
      expect(getPlantEmoji('marigold')).toBe('🌼')
      expect(getPlantEmoji('MARIGOLD')).toBe('🌼')
      expect(getPlantEmoji('tagetes')).toBe('🌼')
      expect(getPlantEmoji('TAGETES')).toBe('🌼')
      expect(getPlantEmoji('Marigold Flower')).toBe('🌼')
      expect(getPlantEmoji('Tagetes Plant')).toBe('🌼')
    })

    it('should return specific emoji for impatiens', () => {
      expect(getPlantEmoji('impatiens')).toBe('🌸')
      expect(getPlantEmoji('IMPATIENS')).toBe('🌸')
      expect(getPlantEmoji('Impatiens Flower')).toBe('🌸')
    })

    it('should return specific emoji for ageratum', () => {
      expect(getPlantEmoji('ageratum')).toBe('🌸')
      expect(getPlantEmoji('AGERATUM')).toBe('🌸')
      expect(getPlantEmoji('Ageratum Plant')).toBe('🌸')
    })

    it('should return specific emoji for salvia', () => {
      expect(getPlantEmoji('salvia')).toBe('🌺')
      expect(getPlantEmoji('SALVIA')).toBe('🌺')
      expect(getPlantEmoji('Salvia Flower')).toBe('🌺')
    })

    it('should return specific emoji for verbena', () => {
      expect(getPlantEmoji('verbena')).toBe('🌸')
      expect(getPlantEmoji('VERBENA')).toBe('🌸')
      expect(getPlantEmoji('Verbena Plant')).toBe('🌸')
    })

    it('should return specific emoji for lobelia', () => {
      expect(getPlantEmoji('lobelia')).toBe('🌸')
      expect(getPlantEmoji('LOBELIA')).toBe('🌸')
      expect(getPlantEmoji('Lobelia Flower')).toBe('🌸')
    })

    it('should return specific emoji for alyssum', () => {
      expect(getPlantEmoji('alyssum')).toBe('🤍')
      expect(getPlantEmoji('ALYSSUM')).toBe('🤍')
      expect(getPlantEmoji('Alyssum Plant')).toBe('🤍')
    })

    it('should return specific emoji for cosmos', () => {
      expect(getPlantEmoji('cosmos')).toBe('🌸')
      expect(getPlantEmoji('COSMOS')).toBe('🌸')
      expect(getPlantEmoji('Cosmos Flower')).toBe('🌸')
    })

    it('should return specific emoji for petunia', () => {
      expect(getPlantEmoji('petunia')).toBe('🌺')
      expect(getPlantEmoji('PETUNIA')).toBe('🌺')
      expect(getPlantEmoji('Petunia Plant')).toBe('🌺')
    })

    it('should return specific emoji for begonia', () => {
      expect(getPlantEmoji('begonia')).toBe('🌸')
      expect(getPlantEmoji('BEGONIA')).toBe('🌸')
      expect(getPlantEmoji('Begonia Flower')).toBe('🌸')
    })

    it('should return specific emoji for viooltje and viola', () => {
      expect(getPlantEmoji('viooltje')).toBe('🌸')
      expect(getPlantEmoji('VIOOLTJE')).toBe('🌸')
      expect(getPlantEmoji('viola')).toBe('🌸')
      expect(getPlantEmoji('VIOLA')).toBe('🌸')
      expect(getPlantEmoji('Viooltje Plant')).toBe('🌸')
      expect(getPlantEmoji('Viola Flower')).toBe('🌸')
    })

    it('should return specific emoji for stiefmoedje and pansy', () => {
      expect(getPlantEmoji('stiefmoedje')).toBe('🌸')
      expect(getPlantEmoji('STIEFMOEDJE')).toBe('🌸')
      expect(getPlantEmoji('pansy')).toBe('🌸')
      expect(getPlantEmoji('PANSY')).toBe('🌸')
      expect(getPlantEmoji('Stiefmoedje Plant')).toBe('🌸')
      expect(getPlantEmoji('Pansy Flower')).toBe('🌸')
    })

    it('should return specific emoji for snapdragon and leeuwenbek', () => {
      expect(getPlantEmoji('snapdragon')).toBe('🌸')
      expect(getPlantEmoji('SNAPDRAGON')).toBe('🌸')
      expect(getPlantEmoji('leeuwenbek')).toBe('🌸')
      expect(getPlantEmoji('LEEUWENBEK')).toBe('🌸')
      expect(getPlantEmoji('Snapdragon Plant')).toBe('🌸')
      expect(getPlantEmoji('Leeuwenbek Flower')).toBe('🌸')
    })

    it('should return specific emoji for zonnebloem and sunflower', () => {
      expect(getPlantEmoji('zonnebloem')).toBe('🌻')
      expect(getPlantEmoji('ZONNEBLOEM')).toBe('🌻')
      expect(getPlantEmoji('sunflower')).toBe('🌻')
      expect(getPlantEmoji('SUNFLOWER')).toBe('🌻')
      expect(getPlantEmoji('Zonnebloem Plant')).toBe('🌻')
      expect(getPlantEmoji('Sunflower Flower')).toBe('🌻')
    })

    it('should return specific emoji for calendula and goudsbloem', () => {
      expect(getPlantEmoji('calendula')).toBe('🌼')
      expect(getPlantEmoji('CALENDULA')).toBe('🌼')
      expect(getPlantEmoji('goudsbloem')).toBe('🌼')
      expect(getPlantEmoji('GOUDSBLOEM')).toBe('🌼')
      expect(getPlantEmoji('Calendula Plant')).toBe('🌼')
      expect(getPlantEmoji('Goudsbloem Flower')).toBe('🌼')
    })

    it('should return specific emoji for nicotiana and siertabak', () => {
      expect(getPlantEmoji('nicotiana')).toBe('🤍')
      expect(getPlantEmoji('NICOTIANA')).toBe('🤍')
      expect(getPlantEmoji('siertabak')).toBe('🤍')
      expect(getPlantEmoji('SIERTABAK')).toBe('🤍')
      expect(getPlantEmoji('Nicotiana Plant')).toBe('🤍')
      expect(getPlantEmoji('Siertabak Flower')).toBe('🤍')
    })

    it('should return specific emoji for cleome and spinnenbloem', () => {
      expect(getPlantEmoji('cleome')).toBe('🌸')
      expect(getPlantEmoji('CLEOME')).toBe('🌸')
      expect(getPlantEmoji('spinnenbloem')).toBe('🌸')
      expect(getPlantEmoji('SPINNENBLOEM')).toBe('🌸')
      expect(getPlantEmoji('Cleome Plant')).toBe('🌸')
      expect(getPlantEmoji('Spinnenbloem Flower')).toBe('🌸')
    })

    it('should return specific emoji for celosia and hanekam', () => {
      expect(getPlantEmoji('celosia')).toBe('🌺')
      expect(getPlantEmoji('CELOSIA')).toBe('🌺')
      expect(getPlantEmoji('hanekam')).toBe('🌺')
      expect(getPlantEmoji('HANEKAM')).toBe('🌺')
      expect(getPlantEmoji('Celosia Plant')).toBe('🌺')
      expect(getPlantEmoji('Hanekam Flower')).toBe('🌺')
    })
  })

  describe('edge cases', () => {
    it('should return default emoji for unknown plants', () => {
      expect(getPlantEmoji('unknown plant')).toBe('🌸')
      expect(getPlantEmoji('random flower')).toBe('🌸')
      expect(getPlantEmoji('xyz')).toBe('🌸')
    })

    it('should return default emoji for empty or undefined name', () => {
      expect(getPlantEmoji('')).toBe('🌸')
      expect(getPlantEmoji(undefined)).toBe('🌸')
      expect(getPlantEmoji(null as any)).toBe('🌸')
    })

    it('should handle partial matches correctly', () => {
      expect(getPlantEmoji('mini zinnia')).toBe('🌻')
      expect(getPlantEmoji('dwarf marigold')).toBe('🌼')
      expect(getPlantEmoji('giant sunflower')).toBe('🌻')
    })

    it('should prioritize first match in the list', () => {
      // zinnia comes before sunflower in the list, so it should match first
      expect(getPlantEmoji('zinnia sunflower')).toBe('🌻')
      // marigold comes before tagetes in the list
      expect(getPlantEmoji('marigold tagetes')).toBe('🌼')
    })

    it('should handle mixed case correctly', () => {
      expect(getPlantEmoji('ZiNnIa')).toBe('🌻')
      expect(getPlantEmoji('MaRiGoLd')).toBe('🌼')
      expect(getPlantEmoji('SuNfLoWeR')).toBe('🌻')
    })

    it('should handle names with special characters', () => {
      expect(getPlantEmoji('zinnia-flower')).toBe('🌻')
      expect(getPlantEmoji('marigold_plant')).toBe('🌼')
      expect(getPlantEmoji('sunflower.flower')).toBe('🌻')
    })
  })

  describe('emoji types', () => {
    it('should return 🌻 for sunflower-like plants', () => {
      expect(getPlantEmoji('zinnia')).toBe('🌻')
      expect(getPlantEmoji('sunflower')).toBe('🌻')
      expect(getPlantEmoji('zonnebloem')).toBe('🌻')
    })

    it('should return 🌼 for daisy-like plants', () => {
      expect(getPlantEmoji('marigold')).toBe('🌼')
      expect(getPlantEmoji('tagetes')).toBe('🌼')
      expect(getPlantEmoji('calendula')).toBe('🌼')
      expect(getPlantEmoji('goudsbloem')).toBe('🌼')
    })

    it('should return 🌺 for trumpet-like flowers', () => {
      expect(getPlantEmoji('salvia')).toBe('🌺')
      expect(getPlantEmoji('petunia')).toBe('🌺')
      expect(getPlantEmoji('celosia')).toBe('🌺')
      expect(getPlantEmoji('hanekam')).toBe('🌺')
    })

    it('should return 🤍 for white flowers', () => {
      expect(getPlantEmoji('alyssum')).toBe('🤍')
      expect(getPlantEmoji('nicotiana')).toBe('🤍')
      expect(getPlantEmoji('siertabak')).toBe('🤍')
    })

    it('should return 🌸 for general flowers (default)', () => {
      expect(getPlantEmoji('impatiens')).toBe('🌸')
      expect(getPlantEmoji('ageratum')).toBe('🌸')
      expect(getPlantEmoji('verbena')).toBe('🌸')
      expect(getPlantEmoji('lobelia')).toBe('🌸')
      expect(getPlantEmoji('cosmos')).toBe('🌸')
      expect(getPlantEmoji('begonia')).toBe('🌸')
      expect(getPlantEmoji('viooltje')).toBe('🌸')
      expect(getPlantEmoji('viola')).toBe('🌸')
      expect(getPlantEmoji('stiefmoedje')).toBe('🌸')
      expect(getPlantEmoji('pansy')).toBe('🌸')
      expect(getPlantEmoji('snapdragon')).toBe('🌸')
      expect(getPlantEmoji('leeuwenbek')).toBe('🌸')
      expect(getPlantEmoji('cleome')).toBe('🌸')
      expect(getPlantEmoji('spinnenbloem')).toBe('🌸')
      expect(getPlantEmoji('unknown')).toBe('🌸')
    })
  })
})