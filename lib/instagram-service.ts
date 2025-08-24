// Instagram service stub
export interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  timestamp: string;
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  // Stub implementation
  return [];
}

export async function generateInstagramCaption(
  gardenName: string,
  sessionDate: string,
  achievements: string[]
): Promise<string> {
  // Stub implementation
  return `Garden update for ${gardenName}`;
}

export async function postToInstagram(
  imageUrl: string,
  caption: string,
  accessToken: string
): Promise<boolean> {
  // Stub implementation
  return false;
}