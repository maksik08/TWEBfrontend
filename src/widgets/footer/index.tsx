import { Link } from 'react-router-dom'
import { useLanguage } from '@/shared/i18n'
import styles from './footer.module.css'

export const Footer = () => {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <h3 className={styles.title}>NetInstall</h3>
            <p className={styles.text}>{t({ ru: 'Оборудование и услуги для сетей любой сложности', en: 'Equipment and services for networks of any complexity' })}</p>
          </div>
          <div>
            <h4 className={styles.subtitle}>{t({ ru: 'Каталог', en: 'Catalog' })}</h4>
            <ul className={styles.list}>
              <li>
                <Link to="/catalog?section=equipment">{t({ ru: 'Оборудование', en: 'Equipment' })}</Link>
              </li>
              <li>
                <Link to="/catalog?section=services">{t({ ru: 'Услуги', en: 'Services' })}</Link>
              </li>
              <li>
                <Link to="/catalog?section=promotions">{t({ ru: 'Акции', en: 'Promotions' })}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={styles.subtitle}>{t({ ru: 'Помощь', en: 'Help' })}</h4>
            <ul className={styles.list}>
              <li>
                <a href="#">{t({ ru: 'Доставка', en: 'Delivery' })}</a>
              </li>
              <li>
                <Link to="/cart?services=1">{t({ ru: 'Оплата', en: 'Payment' })}</Link>
              </li>
              <li>
                <a href="#">{t({ ru: 'Контакты', en: 'Contacts' })}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={styles.subtitle}>{t({ ru: 'Контакты', en: 'Contacts' })}</h4>
            <ul className={styles.list}>
              <li>info@netinstall.md</li>
              <li>+373 22 123-456</li>
              <li>{t({ ru: 'мун. Кишинёв, ул. Штефан чел Маре, 134', en: 'Chisinau, Stefan cel Mare St., 134' })}</li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>{t({ ru: '© 2026 NetInstall Moldova. Все права защищены.', en: '© 2026 NetInstall Moldova. All rights reserved.' })}</div>
      </div>
    </footer>
  )
}
