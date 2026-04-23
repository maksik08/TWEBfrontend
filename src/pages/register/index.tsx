import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/features/auth'
import { useLanguage } from '@/shared/i18n'
import styles from './register.module.css'

interface FormState {
  email: string
  username: string
  password: string
  confirmPassword: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { t } = useLanguage()

  const [form, setForm] = useState<FormState>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (submitError) setSubmitError(null)
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}

    if (!form.email.trim()) {
      next.email = t({ ru: 'Введите email', en: 'Email is required' })
    } else if (!emailPattern.test(form.email.trim())) {
      next.email = t({ ru: 'Некорректный email', en: 'Invalid email' })
    }

    const username = form.username.trim()
    if (!username) {
      next.username = t({ ru: 'Введите логин', en: 'Username is required' })
    } else if (username.length < 3) {
      next.username = t({
        ru: 'Логин должен быть не короче 3 символов',
        en: 'Username must be at least 3 characters',
      })
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      next.username = t({
        ru: 'Только латиница, цифры и символы _ . -',
        en: 'Only letters, digits and _ . - are allowed',
      })
    }

    if (!form.password) {
      next.password = t({ ru: 'Введите пароль', en: 'Password is required' })
    } else if (form.password.length < 6) {
      next.password = t({
        ru: 'Пароль должен быть не короче 6 символов',
        en: 'Password must be at least 6 characters',
      })
    }

    if (!form.confirmPassword) {
      next.confirmPassword = t({ ru: 'Повторите пароль', en: 'Confirm your password' })
    } else if (form.password && form.confirmPassword !== form.password) {
      next.confirmPassword = t({ ru: 'Пароли не совпадают', en: 'Passwords do not match' })
    }

    return next
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    registerMutation.mutate(
      {
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      },
      {
        onSuccess: () => navigate('/', { replace: true }),
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : t({ ru: 'Не удалось зарегистрироваться', en: 'Registration failed' })
          setSubmitError(message)
        },
      },
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>
            {t({ ru: 'Регистрация', en: 'Sign up' })}
          </h1>
          <p className={styles.subtitle}>
            {t({
              ru: 'Создайте аккаунт, чтобы оформлять заказы, копить бонусы и отслеживать покупки.',
              en: 'Create an account to place orders, earn bonuses and track your purchases.',
            })}
          </p>

          <form onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                placeholder={t({ ru: 'you@example.com', en: 'you@example.com' })}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                {t({ ru: 'Логин', en: 'Username' })}
              </label>
              <input
                id="username"
                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                value={form.username}
                onChange={update('username')}
                autoComplete="username"
                placeholder={t({ ru: 'Придумайте логин', en: 'Choose a username' })}
              />
              {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                {t({ ru: 'Пароль', en: 'Password' })}
              </label>
              <input
                id="password"
                type="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                value={form.password}
                onChange={update('password')}
                autoComplete="new-password"
                placeholder={t({ ru: 'Минимум 6 символов', en: 'At least 6 characters' })}
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">
                {t({ ru: 'Повторите пароль', en: 'Confirm password' })}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                autoComplete="new-password"
                placeholder={t({ ru: 'Повторите пароль', en: 'Repeat your password' })}
              />
              {errors.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>

            {submitError && <div className={styles.formError}>{submitError}</div>}

            <div className={styles.actions}>
              <button
                className={styles.button}
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? t({ ru: 'Создаём...', en: 'Creating...' })
                  : t({ ru: 'Создать аккаунт', en: 'Create account' })}
              </button>
            </div>
          </form>

          <div className={styles.footer}>
            {t({ ru: 'Уже есть аккаунт?', en: 'Already have an account?' })}
            <Link to="/login" className={styles.footerLink}>
              {t({ ru: 'Войти', en: 'Sign in' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
