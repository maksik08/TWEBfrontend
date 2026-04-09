import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/i18n'
import styles from './hero.module.css'

export const Hero = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1>{t({ ru: 'Установка сетевой инфраструктуры', en: 'Network Infrastructure Installation' })}</h1>
          <p>{t({ ru: 'Настройка LAN, WAN, WLAN и серверного оборудования профессионального качества', en: 'Professional LAN, WAN, WLAN and server equipment configuration' })}</p>
          <button className={styles.heroButton} onClick={() => navigate('/catalog')}>
            {t({ ru: 'Перейти к каталогу', en: 'Go to catalog' })}
          </button>
        </div>
      </div>
    </section>
  )
}