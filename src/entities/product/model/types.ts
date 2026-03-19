export type ProductCategory =
  | 'router'
  | 'switch'
  | 'antenna'
  | 'cable'
  | 'nas'
  | 'server'
  | (string & {})

export type ProductAvailability = 'in-stock' | 'limited' | 'preorder'

export interface ProductSpecification {
  label: string
  value: string
}

export interface Product {
  id: number
  name: string
  title: string
  price: number
  category: ProductCategory
  image: string
  brand?: string
  sku?: string
  shortDescription?: string
  description?: string
  availability?: ProductAvailability
  technology?: string[]
  keyFeatures?: string[]
  specifications?: ProductSpecification[]
  packageContents?: string[]
  warranty?: string
}
