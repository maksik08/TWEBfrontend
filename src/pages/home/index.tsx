import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './home.module.css'

const slides = [
  {
    id: 1,
    badge: '🔥 Весенняя распродажа',
    title: 'Сетевое оборудование',
    accent: 'до −30%',
    desc: 'Коммутаторы, маршрутизаторы, точки доступа и серверное оборудование ведущих мировых брендов. Акции действуют до 31 марта.',
    discount: '−30%',
    note: 'на топовые позиции',
    theme: 'slideBlue',
    ctaLink: '/catalog',
    ctaText: 'Смотреть каталог',
  },
  {
    id: 2,
    badge: '⚡ Горячее предложение',
    title: 'Коммутаторы Cisco',
    accent: 'скидка −20%',
    desc: 'Управляемые и неуправляемые коммутаторы Catalyst и Nexus по специальной цене. Только до конца недели.',
    discount: '−20%',
    note: 'на коммутаторы',
    theme: 'slideRed',
    ctaLink: '/catalog',
    ctaText: 'Выбрать коммутатор',
  },
  {
    id: 3,
    badge: '🆕 Новинки сезона',
    title: 'Wi‑Fi 6E роутеры',
    accent: '−15% сейчас',
    desc: 'Трёхдиапазонные маршрутизаторы с поддержкой 6 ГГц. Максимальная скорость и минимальные задержки.',
    discount: '−15%',
    note: 'новинки в наличии',
    theme: 'slideGreen',
    ctaLink: '/catalog',
    ctaText: 'Смотреть роутеры',
  },
  {
    id: 4,
    badge: '⏳ Ограниченный остаток',
    title: 'Серверное оборудование',
    accent: 'осталось 12 шт.',
    desc: 'Стоечные серверы и системы хранения данных со склада. Успейте заказать по текущей цене.',
    discount: '−10%',
    note: 'серверы и СХД',
    theme: 'sliderOrange',
    ctaLink: '/catalog',
    ctaText: 'Смотреть серверы',
  },
  {
    id: 5,
    badge: '🛠️ Комплексное решение',
    title: 'Монтаж и настройка',
    accent: 'под ключ',
    desc: 'При заказе оборудования на сумму от $300 — выезд и настройка специалистов в подарок. Работаем по всей Молдове.',
    discount: 'Gratis',
    note: 'монтаж в подарок',
    theme: 'slidePurple',
    ctaLink: '/calculator',
    ctaText: 'Рассчитать проект',
  },
]

const AUTOPLAY_DELAY = 5000

const HeroBanner = () => {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const touchStartX = useRef<number | null>(null)
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPaused = useRef(false)

  const goTo = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    if (isAnimating) return
    setDirection(dir)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setIsAnimating(false)
    }, 350)
  }, [isAnimating])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 'next')
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev')
  }, [current, goTo])

  const resetAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current)
    if (!isPaused.current) {
      autoplayTimer.current = setTimeout(next, AUTOPLAY_DELAY)
    }
  }, [next])

  useEffect(() => {
    resetAutoplay()
    return () => { if (autoplayTimer.current) clearTimeout(autoplayTimer.current) }
  }, [resetAutoplay])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
      resetAutoplay()
    }
    touchStartX.current = null
  }

  const handleDotClick = (i: number) => {
    goTo(i, i > current ? 'next' : 'prev')
    resetAutoplay()
  }

  const slide = slides[current]

  return (
    <section
      className={styles.bannerWrapper}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => { isPaused.current = true; if (autoplayTimer.current) clearTimeout(autoplayTimer.current) }}
      onMouseLeave={() => { isPaused.current = false; resetAutoplay() }}
    >
      <div className={`${styles.bannerSlide} ${styles[slide.theme]} ${isAnimating ? (direction === 'next' ? styles.exitLeft : styles.exitRight) : styles.enter}`}>
        <div className={styles.bannerContent}>
          <span className={styles.bannerBadge}>{slide.badge}</span>
          <h1 className={styles.bannerTitle}>
            {slide.title}<br />
            <span className={styles.bannerAccent}>{slide.accent}</span>
          </h1>
          <p className={styles.bannerDesc}>{slide.desc}</p>
          <div className={styles.bannerActions}>
            <Link to={slide.ctaLink} className={styles.btnPrimary}>{slide.ctaText}</Link>
            <Link to="/calculator" className={styles.btnOutline}>Рассчитать проект</Link>
          </div>
        </div>
        <div className={styles.bannerVisual}>
          <div className={styles.bannerDiscount}>{slide.discount}</div>
          <div className={styles.bannerVisualNote}>{slide.note}</div>
        </div>
      </div>

      {/* Стрелки */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => { prev(); resetAutoplay() }} aria-label="Предыдущий слайд">
        ‹
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => { next(); resetAutoplay() }} aria-label="Следующий слайд">
        ›
      </button>

      {/* Точки */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => handleDotClick(i)}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>

      {/* Прогресс-бар */}
      <div className={styles.progressBar} key={`${current}-progress`} />
    </section>
  )
}

const promos = [
  {
    id: 1,
    badge: 'Хит продаж',
    badgeColor: 'danger',
    title: 'Скидка 20% на коммутаторы',
    desc: 'Управляемые и неуправляемые коммутаторы Cisco, TP-Link, D-Link по специальной цене до конца месяца.',
    discount: '−20%',
    gradient: 'gradientDanger',
  },
  {
    id: 2,
    badge: 'Новинки',
    badgeColor: 'success',
    title: 'Wi-Fi 6E роутеры',
    desc: 'Новое поколение беспроводного оборудования. Трёхдиапазонные маршрутизаторы с поддержкой 6 ГГц.',
    discount: '−15%',
    gradient: 'gradientSuccess',
  },
  {
    id: 3,
    badge: 'Ограничено',
    badgeColor: 'warning',
    title: 'Серверное оборудование',
    desc: 'Стоечные серверы и системы хранения данных. Остаток на складе — только 12 единиц.',
    discount: '−10%',
    gradient: 'gradientWarm',
  },
]

const categories = [
  { icon: '🔀', name: 'Коммутаторы', count: '120+ моделей' },
  { icon: '📡', name: 'Точки доступа', count: '80+ моделей' },
  { icon: '🌐', name: 'Маршрутизаторы', count: '95+ моделей' },
  { icon: '🔒', name: 'Файрволы', count: '40+ моделей' },
  { icon: '💾', name: 'СХД', count: '35+ моделей' },
  { icon: '📦', name: 'Кабели и патч-панели', count: '200+ позиций' },
]

const benefits = [
  { icon: '🚚', title: 'Быстрая доставка', text: 'Отправка со склада в день заказа. Доставка по всей Молдове от 1 рабочего дня.' },
  { icon: '✅', title: 'Гарантия 3 года', text: 'Официальная гарантия на всё оборудование от производителя.' },
  { icon: '🛠️', title: 'Монтаж и настройка', text: 'Выезд специалистов для установки и конфигурации оборудования.' },
  { icon: '💬', title: 'Тех. поддержка 24/7', text: 'Консультации по подбору и поддержка после покупки.' },
]

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <div className="container">

        <HeroBanner />

        {/* ПРОМО-КАРТОЧКИ */}
        <section className={styles.promoSection}>
          <h2 className={styles.sectionTitle}>Акции и специальные предложения</h2>
          <div className={styles.promoGrid}>
            {promos.map((promo) => (
              <div key={promo.id} className={`${styles.promoCard} ${styles[promo.gradient]}`}>
                <span className={`${styles.promoBadge} ${styles[`badge_${promo.badgeColor}`]}`}>
                  {promo.badge}
                </span>
                <div className={styles.promoDiscount}>{promo.discount}</div>
                <h3 className={styles.promoTitle}>{promo.title}</h3>
                <p className={styles.promoDesc}>{promo.desc}</p>
                <Link to="/catalog" className={styles.promoBtn}>Перейти к товарам →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* КАТЕГОРИИ */}
        <section className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>Популярные категории</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link to="/catalog" key={cat.name} className={styles.categoryCard}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ПРЕИМУЩЕСТВА */}
        <section className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((b) => (
              <div key={b.title} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{b.icon}</span>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitText}>{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA БАННЕР */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Готовы начать проект?</h2>
            <p className={styles.ctaText}>
              Воспользуйтесь калькулятором стоимости или сразу переходите в каталог —
              соберите нужное оборудование в корзину и оформите заказ.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link to="/catalog" className={styles.btnPrimary}>Открыть каталог</Link>
            <Link to="/calculator" className={styles.btnOutlineWhite}>Калькулятор</Link>
          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage
