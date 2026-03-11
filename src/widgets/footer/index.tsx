import styles from './footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <h3 className={styles.title}>NetInstall</h3>
            <p className={styles.text}>Оборудование и услуги для сетей любой сложности</p>
          </div>
          <div>
            <h4 className={styles.subtitle}>Каталог</h4>
            <ul className={styles.list}>
              <li><a href="#">Оборудование</a></li>
              <li><a href="#">Услуги</a></li>
              <li><a href="#">Акции</a></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.subtitle}>Помощь</h4>
            <ul className={styles.list}>
              <li><a href="#">Доставка</a></li>
              <li><a href="#">Оплата</a></li>
              <li><a href="#">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.subtitle}>Контакты</h4>
            <ul className={styles.list}>
              <li>info@netinstall.ru</li>
              <li>+7 (495) 123-45-67</li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2026 NetInstall. Все права защищены.
        </div>
      </div>
    </footer>
  );
};