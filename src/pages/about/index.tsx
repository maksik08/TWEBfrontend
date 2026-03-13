import styles from './about.module.css'

const highlights = [
  {
    title: 'Понятный каталог',
    text: 'Оборудование, услуги и акции собраны так, чтобы пользователь быстро находил нужный сценарий без лишнего шума.',
  },
  {
    title: 'Единый маршрут заказа',
    text: 'Из каталога можно перейти в избранное, собрать корзину, добавить услуги установки и увидеть итоговую сумму в одном потоке.',
  },
  {
    title: 'Акцент на удобство',
    text: 'Мы стараемся, чтобы интерфейс помогал выбрать решение, а не заставлял разбираться в сложных экранах и скрытых шагах.',
  },
]

const principles = [
  'Показываем товар, доставку и услуги отдельными частями, чтобы итог был прозрачным.',
  'Даём возможность сохранить интересные позиции в избранное и вернуться к ним позже.',
  'Собираем структуру проекта так, чтобы каталог, корзина и авторизация работали согласованно.',
]

const steps = [
  'Пользователь подбирает оборудование и отмечает интересные позиции.',
  'Собирает заказ в корзине и при необходимости добавляет услуги установки.',
  'Получает понятную смету с товарами, доставкой и дополнительными работами.',
]

const AboutPage = () => {
  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>NetInstall</span>
            <h1 className={styles.title}>О нас</h1>
            <p className={styles.lead}>
              NetInstall строится как удобный сервис для выбора сетевого оборудования и расчёта
              сопутствующих услуг. Здесь можно пройти полный путь от каталога и избранного до
              корзины и финальной стоимости без лишних переходов и путаницы.
            </p>
          </div>

          <div className={styles.statsGrid}>
            {highlights.map((item) => (
              <div key={item.title} className={styles.statCard}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.card}>
            <h2>Что важно в проекте</h2>
            <p>
              Мы делаем интерфейс, в котором легко понять, что именно выбирает пользователь и из
              чего складывается заказ. Важна не показная витрина, а понятная логика для каталога,
              лайков, избранного, корзины и услуг.
            </p>
            <ul className={styles.list}>
              {principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Как устроен сценарий</h2>
            <div className={styles.steps}>
              {steps.map((step, index) => (
                <div key={step} className={styles.step}>
                  <span className={styles.stepIndex}>0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.banner}>
          <div>
            <h2>Для чего всё это</h2>
            <p>
              Чтобы пользователь мог спокойно открыть сайт, выбрать нужные позиции, отметить
              интересные предложения, оформить заказ и при желании сразу добавить услуги по
              установке, не теряясь между разделами.
            </p>
          </div>
          <div className={styles.bannerNote}>Простой путь от выбора до расчёта заказа.</div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
