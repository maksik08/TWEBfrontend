import { Link } from 'react-router-dom'
import { useSessionStore } from '@/entities/session/model/session.store'

export default function Sidebar() {
  const user = useSessionStore((state) => state.user)

  return (
    <aside
      style={{
        width: 200,
        background: '#222',
        color: 'white',
        padding: '1rem',
      }}
    >
      {user?.role === 'admin' && (
        <div>
          <Link to="/admin">Admin Dashboard</Link>
        </div>
      )}

      {user?.role === 'client' && (
        <div>
          <Link to="/client">Client Dashboard</Link>
        </div>
      )}
    </aside>
  )
}
