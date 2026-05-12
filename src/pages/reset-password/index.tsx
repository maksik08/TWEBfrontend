import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useResetPassword } from '@/features/auth'
import { useLanguage } from '@/shared/i18n'
import styles from './reset-password.module.css'

interface FormState {
  newPassword: string
  confirmPassword: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const mutation = useResetPassword()

  const [form, setForm] = useState<FormState>({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (submitError) setSubmitError(null)
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.card}>
            <h1 className={styles.title}>
              {t({ ru: 'Ссылка недействительна', en: 'Invalid link' })}
            </h1>
            <p className={styles.subtitle}>
              {t({
                ru: 'В адресе не хватает токена сброса. Запросите новую ссылку.',
                en: 'The reset token is missing from the URL. Request a new link.',
              })}
            </p>
            <div className={styles.footer}>
              <Link to="/forgot-password" className={styles.footerLink}>
                {t({ ru: 'Запросить ссылку', en: 'Request a link' })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!form.newPassword) {
      next.newPassword = t({ ru: 'Введите новый пароль', en: 'New password is required' })
    } else if (form.newPassword.length < 6) {
      next.newPassword = t({
        ru: 'Пароль должен быть не короче 6 символов',
        en: 'Password must be at least 6 characters',
      })
    }
    if (!form.confirmPassword) {
      next.confirmPassword = t({ ru: 'Повторите пароль', en: 'Confirm your password' })
    } else if (form.newPassword && form.confirmPassword !== form.newPassword) {
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

    mutation.mutate(
      { token, newPassword: form.newPassword, confirmPassword: form.confirmPassword },
      {
        onSuccess: () => {
          navigate('/login', {
            replace: true,
            state: { resetSuccess: true },
          })
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : t({ ru: 'Не удалось сменить пароль', en: 'Failed to reset password' })
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
            {t({ ru: 'Новый пароль', en: 'Choose a new password' })}
          </h1>
          <p className={styles.subtitle}>
            {t({
              ru: 'Придумайте новый пароль. После смены все активные сессии будут завершены.',
              en: 'Set a new password. All active sessions will be signed out after the change.',
            })}
          </p>

          <form onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                {t({ ru: 'Новый пароль', en: 'New password' })}
              </label>
              <input
                id="newPassword"
                type="password"
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                value={form.newPassword}
                onChange={update('newPassword')}
                autoComplete="new-password"
                placeholder={t({ ru: 'Минимум 6 символов', en: 'At least 6 characters' })}
              />
              {errors.newPassword && <span className={styles.fieldError}>{errors.newPassword}</span>}
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
              <button className={styles.button} type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? t({ ru: 'Сохраняем...', en: 'Saving...' })
                  : t({ ru: 'Сменить пароль', en: 'Update password' })}
              </button>
            </div>
          </form>

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
