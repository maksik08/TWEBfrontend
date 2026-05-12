import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '@/features/auth'
import { useLanguage } from '@/shared/i18n'
import styles from './forgot-password.module.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const mutation = useForgotPassword()

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)

    const trimmed = email.trim()
    if (!trimmed) {
      setFieldError(t({ ru: 'Введите email', en: 'Email is required' }))
      return
    }
    if (!emailPattern.test(trimmed)) {
      setFieldError(t({ ru: 'Некорректный email', en: 'Invalid email' }))
      return
    }
    setFieldError(null)

    mutation.mutate(
      { email: trimmed },
      {
        onSuccess: () => setSubmitted(true),
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : t({ ru: 'Не удалось отправить запрос', en: 'Request failed' })
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
            {t({ ru: 'Восстановление пароля', en: 'Reset your password' })}
          </h1>
          <p className={styles.subtitle}>
            {t({
              ru: 'Введите email, который вы указывали при регистрации — мы отправим ссылку для сброса пароля.',
              en: 'Enter the email you signed up with — we will send a reset link to it.',
            })}
          </p>

          {submitted ? (
            <div className={styles.success}>
              {t({
                ru: 'Если этот email зарегистрирован, ссылка для сброса отправлена. Проверьте почту.',
                en: 'If the email is registered, a reset link has been sent. Check your inbox.',
              })}
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${fieldError ? styles.inputError : ''}`}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (fieldError) setFieldError(null)
                    if (submitError) setSubmitError(null)
                  }}
                  autoComplete="email"
                  placeholder={t({ ru: 'you@example.com', en: 'you@example.com' })}
                />
                {fieldError && <span className={styles.fieldError}>{fieldError}</span>}
              </div>

              {submitError && <div className={styles.formError}>{submitError}</div>}

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? t({ ru: 'Отправляем...', en: 'Sending...' })
                    : t({ ru: 'Отправить ссылку', en: 'Send reset link' })}
                </button>
              </div>
            </form>
          )}

          <div className={styles.footer}>
            <Link to="/login" className={styles.footerLink}>
              {t({ ru: 'Назад ко входу', en: 'Back to sign in' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
