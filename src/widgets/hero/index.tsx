import { useNavigate } from 'react-router-dom'
import styles from './hero.module.css'

export const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1>Установка сетевой инфраструктуры</h1>
          <p>Настройка LAN, WAN, WLAN и серверного оборудования профессионального качества</p>
          <button className={styles.heroButton} onClick={() => navigate('/catalog')}>
            Перейти к каталогу
          </button>
        </div>
      </div>
    </section>
  )
}