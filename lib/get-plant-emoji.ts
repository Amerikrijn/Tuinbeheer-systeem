export function getPlantEmoji(name?: string, storedEmoji?: string): string {
  if (storedEmoji && storedEmoji.trim()) {
    return storedEmoji;
  }

  const plantName = (name || '').toLowerCase();

  if (plantName.includes('zinnia')) return '🌻';
  if (plantName.includes('marigold') || plantName.includes('tagetes')) return '🌼';
  if (plantName.includes('impatiens')) return '🌸';
  if (plantName.includes('ageratum')) return '🌸';
  if (plantName.includes('salvia')) return '🌺';
  if (plantName.includes('verbena')) return '🌸';
  if (plantName.includes('lobelia')) return '🌸';
  if (plantName.includes('alyssum')) return '🤍';
  if (plantName.includes('cosmos')) return '🌸';
  if (plantName.includes('petunia')) return '🌺';
  if (plantName.includes('begonia')) return '🌸';
  if (plantName.includes('viooltje') || plantName.includes('viola')) return '🌸';
  if (plantName.includes('stiefmoedje') || plantName.includes('pansy')) return '🌸';
  if (plantName.includes('snapdragon') || plantName.includes('leeuwenbek')) return '🌸';
  if (plantName.includes('zonnebloem') || plantName.includes('sunflower')) return '🌻';
  if (plantName.includes('calendula') || plantName.includes('goudsbloem')) return '🌼';
  if (plantName.includes('nicotiana') || plantName.includes('siertabak')) return '🤍';
  if (plantName.includes('cleome') || plantName.includes('spinnenbloem')) return '🌸';
  if (plantName.includes('celosia') || plantName.includes('hanekam')) return '🌺';
  return '🌸';
}
