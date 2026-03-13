import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/app/router/scroll-to-top'

export default function PublicLayout() {
  return (
    <div style={{ padding: '2rem' }}>
      <ScrollToTop />
      <Outlet />
    </div>
  )
}
