import type { CategoryDto } from '@/shared/api/dto/category.dto'
import { http } from '@/shared/api/http'

export const fetchCategoryDtos = async (): Promise<CategoryDto[]> => {
  const { data } = await http.get<CategoryDto[]>('/categories')
  return data
}
