export interface ProductDto {
  id: number | string
  name?: string | null
  title?: string | null
  price: number | string
  category?: string | null
  image?: string | null
  images?: Array<string | null> | null
}

