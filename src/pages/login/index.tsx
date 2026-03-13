import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/features/auth'
import styles from './login.module.css'

const demoCredentials = {
  identifier: 'client',
  password: 'client123',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()

  const [identifier, setIdentifier] = useState(demoCredentials.identifier)
  const [password, setPassword] = useState(demoCredentials.password)

  type LocationState = { from?: { pathname: string } }
  const state = location.state as LocationState | null
  const fromPath = state?.from?.pathname ?? '/'

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>
            Страница уже открывается с примером текущего пользователя, так что можно войти сразу.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              loginMutation.mutate(
                { email: identifier, password },
                { onSuccess: () => navigate(fromPath, { replace: true }) },
              )
            }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="identifier">
                Логин
              </label>
              <input
                id="identifier"
                className={styles.input}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                placeholder="Введите логин"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Введите пароль"
              />
            </div>

            <div className={styles.demoBox}>
              <span>Логин: {demoCredentials.identifier}</span>
              <span>Пароль: {demoCredentials.password}</span>
            </div>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Входим...' : 'Войти'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
