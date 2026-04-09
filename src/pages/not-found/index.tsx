import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/i18n'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className={styles.page}>
      {/* Декоративные сетевые узлы */}
      <div className={styles.nodes}>
        <span className={styles.node} />
        <span className={styles.node} />
        <span className={styles.node} />
        <span className={styles.node} />
        <span className={styles.node} />
        <span className={styles.node} />
      </div>

      <div className={styles.content}>
        {/* Иконка */}
        <div className={styles.iconWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {/* Код ошибки */}
        <div className={styles.code}>404</div>
        <div className={styles.divider} />

        {/* Текст */}
        <h1 className={styles.title}>{t({ ru: 'Страница не найдена', en: 'Page not found' })}</h1>
        <p className={styles.description}>
          {t({ ru: 'Похоже, соединение потеряно. Запрошенная страница не существует или была перемещена. Проверьте адрес или вернитесь на главную.', en: 'Looks like the connection was lost. The requested page does not exist or has been moved. Check the address or go back to the home page.' })}
        </p>

        {/* Кнопки */}
        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {t({ ru: 'На главную', en: 'Home' })}
          </Link>
          <button onClick={() => navigate(-1)} className={styles.btnSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t({ ru: 'Назад', en: 'Back' })}
          </button>
        </div>
      </div>
    </div>
  )
}
