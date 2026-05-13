export interface ProductDto {
  id: number | string
  name?: string | null
  title?: string | null
  price: number | string
  category?: string | null
  categoryId?: number | null
  supplierId?: number | null
  image?: string | null
  images?: Array<string | null> | null
  stockQuantity?: number | null
  isPreorder?: boolean | null
  availability?: string | null
}

export interface UpdateProductPayload {
  name: string
  title?: string | null
  image?: string | null
  price: number
  stockQuantity: number
  isPreorder: boolean
  categoryId?: number | null
  supplierId?: number | null
}

export type CreateProductPayload = UpdateProductPayload
