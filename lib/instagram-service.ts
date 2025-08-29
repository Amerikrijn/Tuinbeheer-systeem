// Instagram integration service for automatic posting
export interface InstagramPost {
  id: string
  caption: string
  imageUrl: string
  postedAt: string
  sessionTitle: string
  likes: number
  comments: number
}

export interface InstagramConfig {
  accessToken: string
  accountId: string
  enabled: boolean
}

// Simulate Instagram API integration
export const postToInstagram = async (
  caption: string,
  imageUrl: string,
  sessionTitle: string,
): Promise<InstagramPost> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // In real implementation, this would use Instagram Basic Display API
  // or Instagram Graph API for business accounts
  const post: InstagramPost = {
    id: `ig_${Date.now()}`,
    caption,
    imageUrl,
    postedAt: new Date().toISOString(),
    sessionTitle,
    likes: Math.floor(Math.random() * 50) + 10,
    comments: Math.floor(Math.random() * 10) + 2,
  }

  // Store in localStorage for demo purposes
  const existingPosts = JSON.parse(localStorage.getItem("instagramPosts") || "[]")
  localStorage.setItem("instagramPosts", JSON.stringify([post, ...existingPosts]))

  return post
}

export const getInstagramPosts = (): InstagramPost[] => {
  return JSON.parse(localStorage.getItem("instagramPosts") || "[]")
}

export const generateInstagramCaption = (
  sessionTitle: string,
  description: string,
  completedTasks: number,
  totalTasks: number,
  weather?: string,
): string => {
  const hashtags = [
    "#tuinieren",
    "#gardening",
    "#vrijwilligers",
    "#volunteers",
    "#natuur",
    "#nature",
    "#groentuin",
    "#vegetablegarden",
    "#duurzaam",
    "#sustainable",
    "#community",
    "#gemeenschap",
  ]

  let caption = `🌱 ${sessionTitle}\n\n`

  if (description) {
    caption += `${description}\n\n`
  }

  if (totalTasks > 0) {
    caption += `✅ ${completedTasks}/${totalTasks} taken voltooid\n`
  }

  if (weather) {
    caption += `🌤️ Weer: ${weather}\n`
  }

  caption += `\nSamen maken we onze tuin mooier! 💚\n\n`
  caption += hashtags.join(" ")

  return caption
}

export const autoPostProgress = async (
  sessionTitle: string,
  description: string,
  imageUrl: string,
  completedTasks: number,
  totalTasks: number,
  weather?: string,
): Promise<InstagramPost | null> => {
  try {
    const caption = generateInstagramCaption(sessionTitle, description, completedTasks, totalTasks, weather)

    return await postToInstagram(caption, imageUrl, sessionTitle)
  } catch (error) {
    console.error("Failed to post to Instagram:", error)
    return null
  }
}
