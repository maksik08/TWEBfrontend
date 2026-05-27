import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type {
  CreateProductReviewPayload,
  ProductReviewDto,
} from '@/shared/api/dto/product-review.dto'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const productReviewKeys = {
  byProduct: (productId: number) => ['products', productId, 'reviews'] as const,
}

export const fetchProductReviews = async (productId: number): Promise<ProductReviewDto[]> => {
  const { data } = await http.get<ApiResponse<ProductReviewDto[]>>(`/products/${productId}/reviews`)
  return data.data
}

export const createProductReview = async (
  productId: number,
  payload: CreateProductReviewPayload,
): Promise<ProductReviewDto> => {
  const { data } = await http.post<ApiResponse<ProductReviewDto>>(
    `/products/${productId}/reviews`,
    payload,
  )
  return data.data
}

export const deleteProductReview = async (reviewId: number): Promise<void> => {
  await http.delete(`/reviews/${reviewId}`)
}

export const useProductReviewsQuery = (productId: number, enabled = true) =>
  useQuery({
    queryKey: productReviewKeys.byProduct(productId),
    queryFn: () => fetchProductReviews(productId),
    enabled: enabled && Number.isFinite(productId) && productId > 0,
    staleTime: 30_000,
  })

const invalidateProductCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  productId: number,
) => {
  void queryClient.invalidateQueries({ queryKey: productReviewKeys.byProduct(productId) })
  void queryClient.invalidateQueries({ queryKey: ['products'] })
}

export const useCreateReviewMutation = (productId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductReviewPayload) => createProductReview(productId, payload),
    onSuccess: () => invalidateProductCaches(queryClient, productId),
  })
}

export const useDeleteReviewMutation = (productId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: number) => deleteProductReview(reviewId),
    onSuccess: () => invalidateProductCaches(queryClient, productId),
  })
}

export const getRatingSummary = (reviews: ProductReviewDto[]) => {
  if (reviews.length === 0) return { average: 0, total: 0 }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return {
    average: Number((sum / reviews.length).toFixed(1)),
    total: reviews.length,
  }
}
