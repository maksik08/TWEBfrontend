import { Header } from "@/widgets/header/header"
import { Hero } from "@/widgets/hero/Hero"
import { ProductCatalog } from "@/widgets/product-catalog/ProductCatalog"
import { Footer } from "@/widgets/footer/Footer"

export const HomePage = () => {

 return (
  <>
   <Header/>
   <Hero/>
   <ProductCatalog/>
   <Footer/>
  </>
 )

}