import styles from './about.module.css'

const stats = [
  { value: '5 000+', label: 'единиц оборудования в каталоге' },
  { value: '3 года', label: 'официальная гарантия' },
  { value: '24/7', label: 'техническая поддержка' },
  { value: '500+', label: 'выполненных проектов' },
]

const team = [
  {
    name: 'Драгош Вуткарёв',
    role: 'Разработчик',
    desc: 'Более 12 лет опыта в проектировании корпоративных сетей. Сертифицированный специалист Cisco CCIE.',
    image: '/images/team/dragosh-vutkarev.jpg',
  },
  {
    name: 'Максим Пометко',
    role: 'Разработчик',
    desc: 'Эксперт по подбору сетевого оборудования для бизнеса любого масштаба — от малого офиса до дата-центра.',
    image: '/images/team/maksim-pometko.jpg',
  },
  {
    name: 'Джейсон Стетхем',
    role: 'Крутой мужик',
    desc: 'Обслуживание',
    image: '/images/avatar/statham1.jpg',
  },
]

const values = [
  {
    icon: '🎯',
    title: 'Экспертиза',
    text: 'Мы консультируем по подбору оборудования, а не просто продаём. Каждый специалист имеет профильные сертификаты.',
  },
  {
    icon: '🔍',
    title: 'Прозрачность',
    text: 'Показываем товар, доставку и услуги отдельными частями, чтобы итог формирования заказа был понятен.',
  },
  {
    icon: '⚡',
    title: 'Скорость',
    text: 'Склад в Кишинёве — отправка в день заказа. Доставка по всей Молдове от 1 рабочего дня.',
  },
  {
    icon: '🤝',
    title: 'Партнёрство',
    text: 'Официальные партнёры Cisco, TP-Link, MikroTik, Ubiquiti, HPE. Прямые поставки без посредников.',
  },
]

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <div className="container">

        {/* ЗАГОЛОВОК */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>NetInstall</span>
            <h1 className={styles.title}>О компании</h1>
            <p className={styles.lead}>
              NetInstall — молдавский интернет-магазин и системный интегратор в области сетевого оборудования.
              Мы работаем с 2015 года и помогаем бизнесу по всей Молдове строить надёжную IT-инфраструктуру:
              от небольшого офиса до распределённой корпоративной сети.
            </p>
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
          <h2 className={styles.sectionTitle}>Наши принципы</h2>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueText}>{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ИСТОРИЯ */}
        <section className={styles.section}>
          <div className={styles.twoCol}>
            <article className={styles.card}>
              <h2>История компании</h2>
              <p>
                NetInstall основана в 2015 году группой сетевых инженеров из Молдовы, которые хотели
                сделать процесс выбора и покупки оборудования максимально простым и понятным для заказчика.
              </p>
              <p>
                Начав с небольшого склада в Кишинёве, сегодня мы обслуживаем клиентов по всей
                Молдове и соседним странам. Наш каталог насчитывает более 5 000 позиций
                от ведущих мировых производителей.
              </p>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineYear}>2015</span>
                  <p>Основание компании, первые поставки Cisco и TP-Link</p>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineYear}>2018</span>
                  <p>Запуск отдела монтажа и технического обслуживания</p>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineYear}>2021</span>
                  <p>Открытие партнёрства с HPE и Ubiquiti</p>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineYear}>2024</span>
                  <p>Запуск обновлённой платформы с онлайн-калькулятором</p>
                </div>
              </div>
            </article>

            <article className={styles.card}>
              <h2>Как мы работаем</h2>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>01</span>
                  <div>
                    <strong>Подбор оборудования</strong>
                    <p>Вы выбираете позиции в каталоге или описываете задачу — мы предлагаем оптимальное решение.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>02</span>
                  <div>
                    <strong>Расчёт стоимости</strong>
                    <p>Формируем смету с учётом оборудования, доставки и услуг монтажа через встроенный калькулятор.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>03</span>
                  <div>
                    <strong>Доставка и монтаж</strong>
                    <p>Отправляем со склада в день заказа. При необходимости — выезд и настройка специалистами.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepIndex}>04</span>
                  <div>
                    <strong>Поддержка</strong>
                    <p>Гарантийное и постгарантийное обслуживание, техническая поддержка 24/7.</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* КОМАНДА */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Команда</h2>
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamAvatar}>
                  <img src={member.image} alt={member.name} />
                </div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <span className={styles.teamRole}>{member.role}</span>
                <p className={styles.teamDesc}>{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ПАРТНЁРЫ */}
        <section className={styles.partnersSection}>
          <h2 className={styles.sectionTitle}>Официальные партнёры</h2>
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
