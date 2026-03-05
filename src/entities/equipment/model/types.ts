export interface Equipment {
  id: string
  name: string
  price: number
  category: 'router' | 'switch' | 'antenna' | 'cable' | 'nas'
}