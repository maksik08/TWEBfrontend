import type { Product } from "../model/types"

export const fetchProducts = async (): Promise<Product[]> => {

  const response = await fetch("https://fakestoreapi.com/products")

  if (!response.ok) {
    throw new Error("Ошибка загрузки товаров")
  }

  const data = await response.json()

  return data
}