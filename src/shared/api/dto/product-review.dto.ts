export interface ProductReviewDto {
  id: number
  productId: number
  userId: number
  authorUsername: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface CreateProductReviewPayload {
  rating: number
  comment: string
}
