import { useState } from 'react'
import axios from 'axios'
import { useSubmitContact } from '@/features/contact'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useLanguage } from '@/shared/i18n'
import styles from './contact.module.css'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const { t } = useLanguage()
  const mutation = useSubmitContact()
  const sessionUser = useSessionStore((s) => s.user)

  const prefillName =
    [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(' ').trim() ||
    sessionUser?.username ||
    ''

  const [form, setForm] = useState<FormState>({
    name: prefillName,
    email: sessionUser?.email ?? '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const update = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
      if (submitError) setSubmitError(null)
    }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}

    if (!form.name.trim()) {
      next.name = t({ ru: 'Введите имя', en: 'Name is required' })
    } else if (form.name.trim().length < 2) {
      next.name = t({ ru: 'Имя слишком короткое', en: 'Name is too short' })
    }

    if (!form.email.trim()) {
      next.email = t({ ru: 'Введите email', en: 'Email is required' })
    } else if (!emailPattern.test(form.email.trim())) {
      next.email = t({ ru: 'Некорректный email', en: 'Invalid email' })
    }

    if (!form.subject.trim()) {
      next.subject = t({ ru: 'Введите тему', en: 'Subject is required' })
    } else if (form.subject.trim().length < 3) {
      next.subject = t({
        ru: 'Тема должна быть не короче 3 символов',
        en: 'Subject must be at least 3 characters',
      })
    }

    if (!form.message.trim()) {
      next.message = t({ ru: 'Введите сообщение', en: 'Message is required' })
    } else if (form.message.trim().length < 10) {
      next.message = t({
        ru: 'Сообщение должно быть не короче 10 символов',
        en: 'Message must be at least 10 characters',
      })
    }

    return next
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    mutation.mutate(form, {
      onSuccess: () => {
        setSubmitted(true)
        setForm({ name: prefillName, email: sessionUser?.email ?? '', subject: '', message: '' })
      },
      onError: (err: unknown) => {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : t({ ru: 'Не удалось отправить сообщение', en: 'Failed to send message' })
        setSubmitError(message)
      },
    })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.intro}>
            <h1 className={styles.title}>{t({ ru: 'Обратная связь', en: 'Contact us' })}</h1>
            <p className={styles.subtitle}>
              {t({
                ru: 'Напишите нам — вопрос по товару, проблема с заказом или предложение. Мы отвечаем в течение рабочего дня.',
                en: 'Write to us — questions about a product, an issue with an order, or feedback. We respond within one business day.',
              })}
            </p>

            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <span className={styles.contactValue}>info@netinstall.md</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>{t({ ru: 'Телефон', en: 'Phone' })}</span>
                <span className={styles.contactValue}>+373 22 123-456</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>{t({ ru: 'Адрес', en: 'Address' })}</span>
                <span className={styles.contactValue}>
                  {t({
                    ru: 'мун. Кишинёв, ул. Штефан чел Маре, 134',
                    en: 'Chisinau, Stefan cel Mare St., 134',
                  })}
                </span>
              </li>
            </ul>
          </aside>

          <section className={styles.card}>
            {submitted ? (
              <div className={styles.success}>
                {t({
                  ru: 'Спасибо! Ваше сообщение получено. Мы свяжемся с вами в ближайшее время.',
                  en: "Thank you! Your message has been received. We'll be in touch shortly.",
                })}
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-name">
                    {t({ ru: 'Имя', en: 'Name' })}
                  </label>
                  <input
                    id="contact-name"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    value={form.name}
                    onChange={update('name')}
                    autoComplete="name"
                    placeholder={t({ ru: 'Как к вам обращаться', en: 'How should we address you' })}
                  />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-subject">
                    {t({ ru: 'Тема', en: 'Subject' })}
                  </label>
                  <input
                    id="contact-subject"
                    className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder={t({
                      ru: 'Кратко опишите вопрос',
                      en: 'Briefly describe your question',
                    })}
                  />
                  {errors.subject && <span className={styles.fieldError}>{errors.subject}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-message">
                    {t({ ru: 'Сообщение', en: 'Message' })}
                  </label>
                  <textarea
                    id="contact-message"
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    value={form.message}
                    onChange={update('message')}
                    placeholder={t({
                      ru: 'Подробности — чем больше деталей, тем быстрее поможем',
                      en: 'Details — the more context, the faster we can help',
                    })}
                  />
                  {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
                </div>

                {submitError && <div className={styles.formError}>{submitError}</div>}

                <div className={styles.actions}>
                  <button className={styles.button} type="submit" disabled={mutation.isPending}>
                    {mutation.isPending
                      ? t({ ru: 'Отправляем...', en: 'Sending...' })
                      : t({ ru: 'Отправить', en: 'Send' })}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
