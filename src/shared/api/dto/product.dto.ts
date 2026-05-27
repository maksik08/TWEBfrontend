export type ProductAvailabilityState = 'InStock' | 'Limited' | 'Preorder' | 'OutOfStock'

export interface ProductSpecificationDto {
  label: string
  value: string
}

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
  availabilityState?: ProductAvailabilityState | null
  brand?: string | null
  sku?: string | null
  shortDescription?: string | null
  description?: string | null
  warranty?: string | null
  technology?: Array<string | null> | null
  keyFeatures?: Array<string | null> | null
  packageContents?: Array<string | null> | null
  specifications?: Array<ProductSpecificationDto | null> | null
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
  brand?: string | null
  sku?: string | null
  shortDescription?: string | null
  description?: string | null
  warranty?: string | null
  availability?: ProductAvailabilityState
  technology?: string[]
  keyFeatures?: string[]
  packageContents?: string[]
  specifications?: ProductSpecificationDto[]
}

export type CreateProductPayload = UpdateProductPayload
