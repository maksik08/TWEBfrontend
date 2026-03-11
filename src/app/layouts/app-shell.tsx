import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';
import { Outlet } from 'react-router-dom';

export const AppShell = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};