import { useContentStore } from '@/entities/content/model/content.store'
import { useLanguage } from '@/shared/i18n'
import styles from './about.module.css'

const team = [
  {
    name: 'Драгош Вуткарёв',
    role: { ru: 'Разработчик', en: 'Developer' },
    desc: { ru: 'Более 12 лет опыта в проектировании корпоративных сетей. Сертифицированный специалист Cisco CCIE.', en: 'Over 12 years of experience in enterprise network design. Cisco CCIE certified specialist.' },
    image: '/images/team/dragosh-vutkarev.jpg',
  },
  {
    name: 'Максим Пометко',
    role: { ru: 'Разработчик', en: 'Developer' },
    desc: { ru: 'Эксперт по подбору сетевого оборудования для бизнеса любого масштаба — от малого офиса до дата-центра.', en: 'Expert in selecting network equipment for businesses of any scale — from small offices to data centers.' },
    image: '/images/team/maksim-pometko.jpg',
  },
  {
    name: 'Джейсон Стетхем',
    role: { ru: 'Крутой мужик', en: 'Cool guy' },
    desc: { ru: 'Обслуживание', en: 'Maintenance' },
    image: '/images/avatar/statham1.jpg',
  },
]

const AboutPage = () => {
  const { t } = useLanguage()
  const { about } = useContentStore()

  const stats = [
    { value: '5 000+', label: t({ ru: 'единиц оборудования в каталоге', en: 'equipment units in catalog' }) },
    { value: t({ ru: '3 года', en: '3 years' }), label: t({ ru: 'официальная гарантия', en: 'official warranty' }) },
    { value: '24/7', label: t({ ru: 'техническая поддержка', en: 'technical support' }) },
    { value: '500+', label: t({ ru: 'выполненных проектов', en: 'completed projects' }) },
  ]

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ЗАГОЛОВОК */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>NetInstall</span>
            <h1 className={styles.title}>{t({ ru: 'О компании', en: 'About us' })}</h1>
            <p className={styles.lead}>{t(about.lead)}</p>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ЦЕННОСТИ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Наши принципы', en: 'Our principles' })}</h2>
          <div className={styles.valuesGrid}>
            {about.values.map((v) => (
              <div key={v.title.ru} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{t(v.title)}</h3>
                <p className={styles.valueText}>{t(v.text)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ИСТОРИЯ */}
        <section className={styles.section}>
          <div className={styles.twoCol}>
            <article className={styles.card}>
              <h2>{t({ ru: 'История компании', en: 'Company history' })}</h2>
              <p>
                {t({ ru: 'NetInstall основана в 2015 году группой сетевых инженеров из Молдовы, которые хотели сделать процесс выбора и покупки оборудования максимально простым и понятным для заказчика.', en: 'NetInstall was founded in 2015 by a group of network engineers from Moldova who wanted to make the equipment selection and purchase process as simple and clear as possible for customers.' })}
              </p>
              <p>
                {t({ ru: 'Начав с небольшого склада в Кишинёве, сегодня мы обслуживаем клиентов по всей Молдове и соседним странам. Наш каталог насчитывает более 5 000 позиций от ведущих мировых производителей.', en: 'Starting with a small warehouse in Chisinau, we now serve customers throughout Moldova and neighboring countries. Our catalog features over 5,000 items from the world\'s leading manufacturers.' })}
              </p>
              <div className={styles.timeline}>
                {about.timeline.map((item) => (
                  <div key={item.year} className={styles.timelineItem}>
                    <span className={styles.timelineYear}>{item.year}</span>
                    <p>{t(item.text)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.card}>
              <h2>{t({ ru: 'Как мы работаем', en: 'How we work' })}</h2>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>01</span>
                  <div>
                    <strong>{t({ ru: 'Подбор оборудования', en: 'Equipment selection' })}</strong>
                    <p>{t({ ru: 'Вы выбираете позиции в каталоге или описываете задачу — мы предлагаем оптимальное решение.', en: 'You choose items from the catalog or describe your task — we offer the optimal solution.' })}</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>02</span>
                  <div>
                    <strong>{t({ ru: 'Расчёт стоимости', en: 'Cost calculation' })}</strong>
                    <p>{t({ ru: 'Формируем смету с учётом оборудования, доставки и услуг монтажа через встроенный калькулятор.', en: 'We create an estimate including equipment, delivery, and installation services via the built-in calculator.' })}</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>03</span>
                  <div>
                    <strong>{t({ ru: 'Доставка и монтаж', en: 'Delivery & installation' })}</strong>
                    <p>{t({ ru: 'Отправляем со склада в день заказа. При необходимости — выезд и настройка специалистами.', en: 'Ships from stock on the day of order. If needed — specialist visit and configuration.' })}</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>04</span>
                  <div>
                    <strong>{t({ ru: 'Поддержка', en: 'Support' })}</strong>
                    <p>{t({ ru: 'Гарантийное и постгарантийное обслуживание, техническая поддержка 24/7.', en: 'Warranty and post-warranty service, 24/7 technical support.' })}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* КОМАНДА */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Команда', en: 'Team' })}</h2>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                  <img src={member.image} alt={member.name} />
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <span className={styles.teamRole}>{t(member.role)}</span>
                <p className={styles.teamDesc}>{t(member.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ПАРТНЁРЫ */}
        <section className={styles.partnersSection}>
          <h2 className={styles.sectionTitle}>{t({ ru: 'Официальные партнёры', en: 'Official partners' })}</h2>
          <div className={styles.partnersGrid}>
            {['Cisco', 'TP-Link', 'MikroTik', 'Ubiquiti', 'HPE', 'D-Link'].map((brand) => (
              <div key={brand} className={styles.partnerCard}>{brand}</div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default AboutPage
