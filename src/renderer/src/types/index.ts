export interface DockerImage {
  name: string
  description: string
  pulls: number
  stars: number
  isOfficial: boolean
  isVerified: boolean
  updatedAt: string
  tags?: string[]
  architectures?: string[]
}
