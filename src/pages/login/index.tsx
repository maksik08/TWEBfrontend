import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/features/auth'
import { useLanguage } from '@/shared/i18n'
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
  const { t } = useLanguage()

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>{t({ ru: 'Вход', en: 'Sign in' })}</h1>
          <p className={styles.subtitle}>
            {t({ ru: 'Страница уже открывается с примером текущего пользователя, так что можно войти сразу.', en: 'The page already opens with a demo user, so you can sign in right away.' })}
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
                {t({ ru: 'Логин', en: 'Username' })}
              </label>
              <input
                id="identifier"
                className={styles.input}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                placeholder={t({ ru: 'Введите логин', en: 'Enter username' })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                {t({ ru: 'Пароль', en: 'Password' })}
              </label>
              <input
                id="password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder={t({ ru: 'Введите пароль', en: 'Enter password' })}
              />
            </div>

            <div className={styles.demoBox}>
              <span>{t({ ru: 'Логин:', en: 'Username:' })} {demoCredentials.identifier}</span>
              <span>{t({ ru: 'Пароль:', en: 'Password:' })} {demoCredentials.password}</span>
            </div>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? t({ ru: 'Входим...', en: 'Signing in...' }) : t({ ru: 'Войти', en: 'Sign in' })}
              </button>
            </div>
          </form>

          <div className={styles.footer}>
            {t({ ru: 'Нет аккаунта?', en: "Don't have an account?" })}
            <Link to="/register" className={styles.footerLink}>
              {t({ ru: 'Зарегистрироваться', en: 'Sign up' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
