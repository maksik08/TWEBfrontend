import { Navigate } from 'react-router-dom'

export default function CalculatorPage() {
  return <Navigate to="/checkout?services=1" replace />
}
