import { useState } from "react"
import type { Product } from "../model/types"

interface Props {
  product: Product
}

export const ProductCard = ({ product }: Props) => {

  const [likes, setLikes] = useState(0)

  return (
    <div className="productCard">

      <img
        src={product.image}
        alt={product.title}
      />

      <h3>{product.title}</h3>

      <p className="price">
        ${product.price}
      </p>

      <div className="cardButtons">

        <button
          onClick={() => setLikes(likes + 1)}
        >
          ❤️ {likes}
        </button>

        <button>
          🛒 В корзину
        </button>

      </div>

    </div>
  )
}