import { Navigate } from 'react-router-dom'

export default function CalculatorPage() {
  return <Navigate to="/cart?services=1" replace />
}
