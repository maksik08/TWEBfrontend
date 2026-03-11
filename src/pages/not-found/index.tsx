import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <p>
        <Link to="/">Go home</Link>
      </p>
    </div>
  )
}
