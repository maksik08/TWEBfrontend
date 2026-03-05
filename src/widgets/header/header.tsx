import styles from "./header.module.css"

export const Header = () => {

 return (

  <header className={styles.header}>

   <div className={styles.headerInner}>

    <h2>NetInstall</h2>

    <nav className={styles.nav}>
     <a>Каталог</a>
     <a>Избранное</a>
     <a>О нас</a>
    </nav>

   </div>

  </header>

 )

}

export default Header