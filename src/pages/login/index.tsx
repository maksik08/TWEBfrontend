import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/features/auth'
import styles from './login.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  type LocationState = { from?: { pathname: string } }
  const state = location.state as LocationState | null
  const fromPath = state?.from?.pathname ?? '/'

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>Login</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              loginMutation.mutate(
                { email, password },
                { onSuccess: () => navigate(fromPath, { replace: true }) },
              )
            }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            <div className={styles.actions}>
              <button
                className={styles.button}
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
