import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiSettings,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiCheck,
  FiX,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useProfileStore } from '@/entities/user/model/profile.store'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import styles from './profile.module.css'

type Tab = 'account' | 'orders' | 'favorites' | 'settings'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )

export default function ProfilePage() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const isBootstrapped = useSessionStore((s) => s.isBootstrapped)
  const sessionUser = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)

  const firstName = useProfileStore((s) => s.firstName)
  const lastName = useProfileStore((s) => s.lastName)
  const phone = useProfileStore((s) => s.phone)
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const balance = useProfileStore((s) => s.balance)
  const stats = useProfileStore((s) => s.stats)
  const purchaseHistory = useProfileStore((s) => s.purchaseHistory)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  const favorites = useFavoritesStore((s) => s.favorites)

  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const [editFirstName, setEditFirstName] = useState(firstName)
  const [editLastName, setEditLastName] = useState(lastName)
  const [editPhone, setEditPhone] = useState(phone)
  const [isEditing, setIsEditing] = useState(false)

  if (isBootstrapped && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const displayName = sessionUser?.username ?? `${firstName} ${lastName}`.trim()
  const initials = displayName.slice(0, 2).toUpperCase() || 'U'
  const roleLabel = sessionUser?.role === 'admin' ? 'Администратор' : 'Клиент'
  const roleClass = sessionUser?.role === 'admin' ? styles.roleAdmin : styles.roleClient

  const handleSaveProfile = () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error('Имя и фамилия не могут быть пустыми')
      return
    }
    updateProfile({ firstName: editFirstName, lastName: editLastName, phone: editPhone })
    toast.success('Профиль обновлён')
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditFirstName(firstName)
    setEditLastName(lastName)
    setEditPhone(phone)
    setIsEditing(false)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Аккаунт', icon: <FiUser size={17} /> },
    { id: 'orders', label: `Заказы (${purchaseHistory.length})`, icon: <FiShoppingBag size={17} /> },
    { id: 'favorites', label: `Избранное (${favorites.length})`, icon: <FiHeart size={17} /> },
    { id: 'settings', label: 'Настройки', icon: <FiSettings size={17} /> },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Личный кабинет</h1>
          <p className={styles.pageSubtitle}>Управляйте профилем, заказами и настройками</p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarProfile}>
              <div className={styles.avatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span className={styles.avatarInitials}>{initials}</span>
                )}
              </div>
              <div className={styles.sidebarInfo}>
                <div className={styles.sidebarName}>{displayName}</div>
                <div className={styles.sidebarEmail}>{sessionUser?.email ?? '—'}</div>
                <span className={`${styles.roleBadge} ${roleClass}`}>{roleLabel}</span>
              </div>
            </div>

            <div className={styles.sidebarBalance}>
              <FiDollarSign size={15} />
              <span>Баланс:</span>
              <strong>{formatMoney(balance)}</strong>
              <Link to="/balance" className={styles.topUpLink}>Пополнить</Link>
            </div>

            <nav className={styles.sidebarNav}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <button type="button" className={styles.logoutBtn} onClick={logout}>
              Выйти из аккаунта
            </button>
          </aside>

          {/* Main content */}
          <main className={styles.main}>
            {/* Account tab */}
            {activeTab === 'account' && (
              <div className={styles.tabContent}>
                <h2 className={styles.tabTitle}>Информация об аккаунте</h2>

                {/* Stats row */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Заказов</span>
                    <strong className={styles.statValue}>{stats.orders}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Товаров куплено</span>
                    <strong className={styles.statValue}>{stats.items}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Потрачено</span>
                    <strong className={styles.statValue}>{formatMoney(stats.spent)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Баланс</span>
                    <strong className={`${styles.statValue} ${styles.statBalance}`}>{formatMoney(balance)}</strong>
                  </div>
                </div>

                {/* Profile info card */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Личные данные</h3>
                    {!isEditing && (
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => {
                          setEditFirstName(firstName)
                          setEditLastName(lastName)
                          setEditPhone(phone)
                          setIsEditing(true)
                        }}
                      >
                        <FiEdit2 size={14} />
                        Редактировать
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className={styles.editForm}>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>Имя</label>
                        <input
                          className={styles.editInput}
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                        />
                      </div>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>Фамилия</label>
                        <input
                          className={styles.editInput}
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                        />
                      </div>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>Телефон</label>
                        <input
                          className={styles.editInput}
                          placeholder="+373 (___) ___-___"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                      <div className={styles.editActions}>
                        <button type="button" className={styles.saveBtn} onClick={handleSaveProfile}>
                          <FiCheck size={15} /> Сохранить
                        </button>
                        <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit}>
                          <FiX size={15} /> Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Имя</span>
                        <span className={styles.infoValue}>{firstName || '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Фамилия</span>
                        <span className={styles.infoValue}>{lastName || '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{sessionUser?.email ?? '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Телефон</span>
                        <span className={styles.infoValue}>{phone || 'Не указан'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Роль</span>
                        <span className={styles.infoValue}>{roleLabel}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>ID пользователя</span>
                        <span className={styles.infoValue}>{sessionUser?.id ?? '—'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Last order */}
                {stats.lastPurchaseAt && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Последняя активность</h3>
                    <p className={styles.mutedText}>
                      Последняя покупка: <strong>{formatDate(stats.lastPurchaseAt)}</strong>
                    </p>
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => setActiveTab('orders')}
                    >
                      Посмотреть все заказы →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className={styles.tabContent}>
                <div className={styles.tabTitleRow}>
                  <h2 className={styles.tabTitle}>История заказов</h2>
                  <span className={styles.countBadge}>{purchaseHistory.length}</span>
                </div>

                {purchaseHistory.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiShoppingBag size={40} className={styles.emptyIcon} />
                    <p>У вас пока нет заказов</p>
                    <Link to="/catalog" className={styles.ctaLink}>Перейти в каталог</Link>
                  </div>
                ) : (
                  <div className={styles.orderList}>
                    {purchaseHistory.map((order) => (
                      <article key={order.id} className={styles.orderCard}>
                        <button
                          type="button"
                          className={styles.orderHeader}
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order.id ? null : order.id)
                          }
                        >
                          <div className={styles.orderMeta}>
                            <span className={styles.orderStatus}>Выполнен</span>
                            <span className={styles.orderDate}>{formatDate(order.purchasedAt)}</span>
                          </div>
                          <div className={styles.orderSummary}>
                            <span className={styles.orderItems}>{order.itemsCount} шт.</span>
                            <strong className={styles.orderTotal}>{formatMoney(order.total)}</strong>
                            {expandedOrder === order.id ? (
                              <FiChevronUp size={16} />
                            ) : (
                              <FiChevronDown size={16} />
                            )}
                          </div>
                        </button>

                        {expandedOrder === order.id && (
                          <div className={styles.orderLines}>
                            {order.lines.map((line) => (
                              <div
                                key={`${order.id}-${line.productId}`}
                                className={styles.orderLine}
                              >
                                <span className={styles.lineTitle}>{line.title}</span>
                                <span className={styles.lineQty}>
                                  {line.quantity} × {formatMoney(line.unitPrice)}
                                </span>
                                <span className={styles.lineTotal}>
                                  {formatMoney(line.quantity * line.unitPrice)}
                                </span>
                              </div>
                            ))}
                            <div className={styles.orderFooter}>
                              <span>Итого:</span>
                              <strong>{formatMoney(order.total)}</strong>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites tab */}
            {activeTab === 'favorites' && (
              <div className={styles.tabContent}>
                <div className={styles.tabTitleRow}>
                  <h2 className={styles.tabTitle}>Избранное</h2>
                  <span className={styles.countBadge}>{favorites.length}</span>
                </div>

                {favorites.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiHeart size={40} className={styles.emptyIcon} />
                    <p>Список избранного пуст</p>
                    <Link to="/catalog" className={styles.ctaLink}>Перейти в каталог</Link>
                  </div>
                ) : (
                  <div className={styles.favoritesList}>
                    {favorites.map((item) => (
                      <Link key={item.key} to={item.href} className={styles.favoriteCard}>
                        <div className={styles.favoriteInfo}>
                          <span className={styles.favoriteType}>{item.entityType}</span>
                          <span className={styles.favoriteTitle}>{item.title}</span>
                          {item.description && (
                            <span className={styles.favoriteDesc}>{item.description}</span>
                          )}
                        </div>
                        <div className={styles.favoritePriceCol}>
                          {item.priceLabel && (
                            <span className={styles.favoritePrice}>{item.priceLabel}</span>
                          )}
                          {item.metaLabel && (
                            <span className={styles.favoriteMeta}>{item.metaLabel}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className={styles.tabContent}>
                <h2 className={styles.tabTitle}>Настройки</h2>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Безопасность</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>Пароль</div>
                      <div className={styles.settingDesc}>Последнее изменение: неизвестно</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast('Смена пароля недоступна в демо-режиме', { icon: 'ℹ️' })}
                    >
                      Изменить
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>Двухфакторная аутентификация</div>
                      <div className={styles.settingDesc}>Отключена</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast('2FA недоступна в демо-режиме', { icon: 'ℹ️' })}
                    >
                      Включить
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Уведомления</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>Email-уведомления о заказах</div>
                      <div className={styles.settingDesc}>Получайте статус заказов на почту</div>
                    </div>
                    <button
                      type="button"
                      className={`${styles.settingBtn} ${styles.settingBtnActive}`}
                      onClick={() => toast('Настройки уведомлений недоступны в демо', { icon: 'ℹ️' })}
                    >
                      Включено
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>Промо-рассылка</div>
                      <div className={styles.settingDesc}>Акции, скидки и новинки</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast('Настройки рассылки недоступны в демо', { icon: 'ℹ️' })}
                    >
                      Отключена
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Аккаунт</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>Выйти из аккаунта</div>
                      <div className={styles.settingDesc}>Завершить текущую сессию</div>
                    </div>
                    <button type="button" className={styles.settingBtnDanger} onClick={logout}>
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
