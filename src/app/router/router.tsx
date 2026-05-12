import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/app/layouts/app-shell'
import PublicLayout from '@/app/layouts/public-layout'
import { RoleRoute } from '@/app/router/role-route'
import AdminDashboard from '@/pages/dashboard/admin'
import ClientDashboard from '@/pages/dashboard/client'
import Forbidden from '@/pages/forbidden'
import Login from '@/pages/login'
import Register from '@/pages/register'
import ForgotPasswordPage from '@/pages/forgot-password'
import ResetPasswordPage from '@/pages/reset-password'
import AboutPage from '@/pages/about'
import HomePage from '@/pages/home'
import CatalogPage from '@/pages/catalog'
import FavoritesPage from '@/pages/favorites'
import NotFoundPage from '@/pages/not-found'
import CartPage from '@/pages/cart'
import BalancePage from '@/pages/balance'
import CalculatorPage from '@/pages/calculator'
import ProductDetailPage from '@/pages/product-detail'
import ProfilePage from '@/pages/profile'
import OrdersPage from '@/pages/orders'
import OrderDetailPage from '@/pages/order-detail'
import ContactPage from '@/pages/contact'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '/register',
    element: <PublicLayout />,
    children: [{ index: true, element: <Register /> }],
  },
  {
    path: '/forgot-password',
    element: <PublicLayout />,
    children: [{ index: true, element: <ForgotPasswordPage /> }],
  },
  {
    path: '/reset-password/:token',
    element: <PublicLayout />,
    children: [{ index: true, element: <ResetPasswordPage /> }],
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'catalog/:productId',
        element: <ProductDetailPage />,
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
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'orders/:orderId',
        element: <OrderDetailPage />,
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
