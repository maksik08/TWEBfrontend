export type ProductCategory =
  | "router"
  | "switch"
  | "antenna"
  | "cable"
  | "nas"
  | "server"
  | (string & {})

export interface Product {
  id: number
  name: string
  title: string
  price: number
  category: ProductCategory
  image: string
}
