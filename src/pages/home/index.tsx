import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useContentStore } from '@/entities/content/model/content.store'
import { useLanguage } from '@/shared/i18n'
import styles from './home.module.css'

const AUTOPLAY_DELAY = 5000

const HeroBanner = () => {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const touchStartX = useRef<number | null>(null)
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPaused = useRef(false)

  const slides = [
    {
      id: 1,
      badge: t({ ru: '🔥 Весенняя распродажа', en: '🔥 Spring sale' }),
      title: t({ ru: 'Сетевое оборудование', en: 'Network equipment' }),
      accent: t({ ru: 'до −30%', en: 'up to −30%' }),
      desc: t({ ru: 'Коммутаторы, маршрутизаторы, точки доступа и серверное оборудование ведущих мировых брендов. Акции действуют до 31 марта.', en: 'Switches, routers, access points and server equipment from the world\'s leading brands. Promotions valid until March 31.' }),
      discount: '−30%',
      note: t({ ru: 'на топовые позиции', en: 'on top items' }),
      theme: 'slideBlue',
      ctaLink: '/catalog',
      ctaText: t({ ru: 'Смотреть каталог', en: 'View catalog' }),
    },
    {
      id: 2,
      badge: t({ ru: '⚡ Горячее предложение', en: '⚡ Hot deal' }),
      title: t({ ru: 'Коммутаторы Cisco', en: 'Cisco switches' }),
      accent: t({ ru: 'скидка −20%', en: 'discount −20%' }),
      desc: t({ ru: 'Управляемые и неуправляемые коммутаторы Catalyst и Nexus по специальной цене. Только до конца недели.', en: 'Managed and unmanaged Catalyst and Nexus switches at a special price. This week only.' }),
      discount: '−20%',
      note: t({ ru: 'на коммутаторы', en: 'on switches' }),
      theme: 'slideRed',
      ctaLink: '/catalog',
      ctaText: t({ ru: 'Выбрать коммутатор', en: 'Choose a switch' }),
    },
    {
      id: 3,
      badge: t({ ru: '🆕 Новинки сезона', en: '🆕 New arrivals' }),
      title: 'Wi‑Fi 6E',
      accent: t({ ru: '−15% сейчас', en: '−15% now' }),
      desc: t({ ru: 'Трёхдиапазонные маршрутизаторы с поддержкой 6 ГГц. Максимальная скорость и минимальные задержки.', en: 'Tri-band routers with 6 GHz support. Maximum speed and minimum latency.' }),
      discount: '−15%',
      note: t({ ru: 'новинки в наличии', en: 'new items in stock' }),
      theme: 'slideGreen',
      ctaLink: '/catalog',
      ctaText: t({ ru: 'Смотреть роутеры', en: 'View routers' }),
    },
    {
      id: 4,
      badge: t({ ru: '⏳ Ограниченный остаток', en: '⏳ Limited stock' }),
      title: t({ ru: 'Серверное оборудование', en: 'Server equipment' }),
      accent: t({ ru: 'осталось 12 шт.', en: '12 pcs left' }),
      desc: t({ ru: 'Стоечные серверы и системы хранения данных со склада. Успейте заказать по текущей цене.', en: 'Rack servers and storage systems from stock. Order now at the current price.' }),
      discount: '−10%',
      note: t({ ru: 'серверы и СХД', en: 'servers & storage' }),
      theme: 'sliderOrange',
      ctaLink: '/catalog',
      ctaText: t({ ru: 'Смотреть серверы', en: 'View servers' }),
    },
    {
      id: 5,
      badge: t({ ru: '🛠️ Комплексное решение', en: '🛠️ Complete solution' }),
      title: t({ ru: 'Монтаж и настройка', en: 'Installation & setup' }),
      accent: t({ ru: 'под ключ', en: 'turnkey' }),
      desc: t({ ru: 'При заказе оборудования на сумму от $300 — выезд и настройка специалистов в подарок. Работаем по всей Молдове.', en: 'Order equipment worth $300+ and get free specialist visit and setup. We work across Moldova.' }),
      discount: 'Gratis',
      note: t({ ru: 'монтаж в подарок', en: 'free installation' }),
      theme: 'slidePurple',
      ctaLink: '/calculator',
      ctaText: t({ ru: 'Рассчитать проект', en: 'Calculate project' }),
    },
  ]

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
  }, [current, goTo, slides.length])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, 'prev')
  }, [current, goTo, slides.length])

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
            <Link to="/calculator" className={styles.btnOutline}>{t({ ru: 'Рассчитать проект', en: 'Calculate project' })}</Link>
          </div>
        </div>
        <div className={styles.bannerVisual}>
          <div className={styles.bannerDiscount}>{slide.discount}</div>
          <div className={styles.bannerVisualNote}>{slide.note}</div>
        </div>
      </div>

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => { prev(); resetAutoplay() }} aria-label={t({ ru: 'Предыдущий слайд', en: 'Previous slide' })}>
        ‹
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => { next(); resetAutoplay() }} aria-label={t({ ru: 'Следующий слайд', en: 'Next slide' })}>
        ›
      </button>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => handleDotClick(i)}
            aria-label={t({ ru: `Слайд ${i + 1}`, en: `Slide ${i + 1}` })}
          />
        ))}
      </div>

      <div className={styles.progressBar} key={`${current}-progress`} />
    </section>
  )
}

const AboutPage = () => {
  const { t } = useLanguage()
  const { home } = useContentStore()

  return (
    <div className={styles.page}>
      <div className="container">

        <HeroBanner />

        {/* ПРОМО-КАРТОЧКИ */}
        <section className={styles.promoSection}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Акции и специальные предложения', en: 'Promotions and special offers' })}</h2>
          <div className={styles.promoGrid}>
            {home.promos.map((promo) => (
              <div key={promo.id} className={`${styles.promoCard} ${styles[promo.gradient]}`}>
                <span className={`${styles.promoBadge} ${styles[`badge_${promo.badgeColor}`]}`}>
                  {t(promo.badge)}
                </span>
                <div className={styles.promoDiscount}>{promo.discount}</div>
                <h3 className={styles.promoTitle}>{t(promo.title)}</h3>
                <p className={styles.promoDesc}>{t(promo.desc)}</p>
                <Link to="/catalog" className={styles.promoBtn}>{t({ ru: 'Перейти к товарам →', en: 'Browse products →' })}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* КАТЕГОРИИ */}
        <section className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Популярные категории', en: 'Popular categories' })}</h2>
          <div className={styles.categoriesGrid}>
            {home.categories.map((cat) => (
              <Link to="/catalog" key={cat.name.ru} className={styles.categoryCard}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{t(cat.name)}</span>
                <span className={styles.categoryCount}>{t(cat.count)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ПРЕИМУЩЕСТВА */}
        <section className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Почему выбирают нас', en: 'Why choose us' })}</h2>
          <div className={styles.benefitsGrid}>
            {home.benefits.map((b) => (
              <div key={b.title.ru} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{b.icon}</span>
                <h3 className={styles.benefitTitle}>{t(b.title)}</h3>
                <p className={styles.benefitText}>{t(b.text)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA БАННЕР */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>{t(home.cta.title)}</h2>
            <p className={styles.ctaText}>{t(home.cta.text)}</p>
          </div>
          <div className={styles.ctaActions}>
            <Link to="/catalog" className={styles.btnPrimary}>{t({ ru: 'Открыть каталог', en: 'Open catalog' })}</Link>
            <Link to="/calculator" className={styles.btnOutlineWhite}>{t({ ru: 'Калькулятор', en: 'Calculator' })}</Link>
          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage
