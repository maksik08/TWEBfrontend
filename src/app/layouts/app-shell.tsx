import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'
import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/app/router/scroll-to-top'

export const AppShell = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
