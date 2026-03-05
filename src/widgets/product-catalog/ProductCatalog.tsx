import { useState } from "react"

import { products } from "@/entities/product/data/products.mock.ts"
import { ProductCard } from "@/entities/product/ui/ProductCard"

import { SearchProducts } from "@/features/search-products/SearchProducts"
import { FilterProducts } from "@/features/filter-products/FilterProducts"
import { ProductsCounter } from "@/features/products-counter/ProductsCounter"

export const ProductCatalog = () => {

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filteredProducts = products
    .filter((product: typeof products[0]) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product: typeof products[0]) =>
      category === "all" ? true : product.category === category
    )

  return (
    <section className="catalogSection">

      <SearchProducts
        value={search}
        onChange={setSearch}
      />

      <FilterProducts
        current={category}
        setCategory={setCategory}
      />

      <ProductsCounter total={filteredProducts.length} />

      <div className="catalogGrid">

        {filteredProducts.map((product: typeof products[0]) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </section>
  )
}