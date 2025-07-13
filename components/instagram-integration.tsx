"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Instagram, Send, Heart, MessageCircle, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  postToInstagram,
  getInstagramPosts,
  generateInstagramCaption,
  type InstagramPost,
} from "@/lib/instagram-service"

interface InstagramIntegrationProps {
  sessionTitle: string
  description: string
  imageUrl?: string
  completedTasks: number
  totalTasks: number
  weather?: string
  onPostSuccess?: (post: InstagramPost) => void
}

export function InstagramIntegration({
  sessionTitle,
  description,
  imageUrl,
  completedTasks,
  totalTasks,
  weather,
  onPostSuccess,
}: InstagramIntegrationProps) {
  const [isPosting, setIsPosting] = useState(false)
  const [autoPost, setAutoPost] = useState(false)
  const [customCaption, setCustomCaption] = useState("")
  const [recentPosts] = useState<InstagramPost[]>(getInstagramPosts().slice(0, 3))
  const { toast } = useToast()

  const defaultCaption = generateInstagramCaption(sessionTitle, description, completedTasks, totalTasks, weather)

  const handlePost = async () => {
    if (!imageUrl) {
      toast({
        title: "Geen Foto",
        description: "Upload eerst een foto om te delen op Instagram",
        variant: "destructive",
      })
      return
    }

    setIsPosting(true)

    try {
      const caption = customCaption.trim() || defaultCaption
      const post = await postToInstagram(caption, imageUrl, sessionTitle)

      toast({
        title: "Instagram Post Succesvol",
        description: `Je post over "${sessionTitle}" is gedeeld op Instagram!`,
      })

      onPostSuccess?.(post)
      setCustomCaption("")
    } catch (error) {
      toast({
        title: "Post Mislukt",
        description: "Er ging iets mis bij het posten naar Instagram",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card className="border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-600" />
          Instagram Integratie
          <Badge variant="outline" className="bg-pink-100 text-pink-700">
            Admin Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-post toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Automatisch Posten</div>
            <div className="text-xs text-gray-600">Post automatisch bij voltooide sessies</div>
          </div>
          <Switch checked={autoPost} onCheckedChange={setAutoPost} />
        </div>

        {/* Caption preview/editor */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Instagram Caption</label>
          <Textarea
            value={customCaption || defaultCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            placeholder="Bewerk de caption..."
            rows={6}
            className="text-sm"
          />
          <div className="text-xs text-gray-500">{(customCaption || defaultCaption).length}/2200 karakters</div>
        </div>

        {/* Image preview */}
        {imageUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Foto Preview</label>
            <div className="relative">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Instagram post preview"
                className="w-full h-48 object-cover rounded border"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                Instagram Ready
              </div>
            </div>
          </div>
        )}

        {/* Post button */}
        <Button
          onClick={handlePost}
          disabled={isPosting || !imageUrl}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isPosting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Posten naar Instagram...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Deel op Instagram
            </>
          )}
        </Button>

        {/* Recent posts */}
        {recentPosts.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recente Instagram Posts</label>
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <img
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={post.sessionTitle}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{post.sessionTitle}</div>
                    <div className="text-xs text-gray-500">{new Date(post.postedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
