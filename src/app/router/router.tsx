import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/app/layouts/app-shell'
import PublicLayout from '@/app/layouts/public-layout'
import { RoleRoute } from '@/app/router/role-route'
import AdminDashboard from '@/pages/dashboard/admin'
import ClientDashboard from '@/pages/dashboard/client'
import Forbidden from '@/pages/forbidden'
import Login from '@/pages/login'
import AboutPage from '@/pages/about'
import CatalogPage from '@/pages/catalog'
import FavoritesPage from '@/pages/favorites'
import NotFoundPage from '@/pages/not-found'
import CartPage from '@/pages/cart'
import BalancePage from '@/pages/balance'
import CalculatorPage from '@/pages/calculator'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <AboutPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'balance',
        element: <BalancePage />,
      },
      {
        path: 'calculator',
        element: <CalculatorPage />,
      },
      {
        path: 'admin',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        ),
      },
      {
        path: 'client',
        element: (
          <RoleRoute allowedRoles={['client']}>
            <ClientDashboard />
          </RoleRoute>
        ),
      },
      {
        path: 'forbidden',
        element: <Forbidden />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
