interface Props{
 total:number
}

export const ProductsCounter = ({total}:Props) => {

 return (
  <p>
   Найдено товаров: {total}
  </p>
 )

}