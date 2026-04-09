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
import { useLanguage } from '@/shared/i18n'
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

  const { t } = useLanguage()
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
  const roleLabel = sessionUser?.role === 'admin' ? t({ ru: 'Администратор', en: 'Administrator' }) : t({ ru: 'Клиент', en: 'Client' })
  const roleClass = sessionUser?.role === 'admin' ? styles.roleAdmin : styles.roleClient

  const handleSaveProfile = () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error(t({ ru: 'Имя и фамилия не могут быть пустыми', en: 'First and last name cannot be empty' }))
      return
    }
    updateProfile({ firstName: editFirstName, lastName: editLastName, phone: editPhone })
    toast.success(t({ ru: 'Профиль обновлён', en: 'Profile updated' }))
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditFirstName(firstName)
    setEditLastName(lastName)
    setEditPhone(phone)
    setIsEditing(false)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: t({ ru: 'Аккаунт', en: 'Account' }), icon: <FiUser size={17} /> },
    { id: 'orders', label: `${t({ ru: 'Заказы', en: 'Orders' })} (${purchaseHistory.length})`, icon: <FiShoppingBag size={17} /> },
    { id: 'favorites', label: `${t({ ru: 'Избранное', en: 'Favorites' })} (${favorites.length})`, icon: <FiHeart size={17} /> },
    { id: 'settings', label: t({ ru: 'Настройки', en: 'Settings' }), icon: <FiSettings size={17} /> },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t({ ru: 'Личный кабинет', en: 'My account' })}</h1>
          <p className={styles.pageSubtitle}>{t({ ru: 'Управляйте профилем, заказами и настройками', en: 'Manage your profile, orders, and settings' })}</p>
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
              <span>{t({ ru: 'Баланс:', en: 'Balance:' })}</span>
              <strong>{formatMoney(balance)}</strong>
              <Link to="/balance" className={styles.topUpLink}>{t({ ru: 'Пополнить', en: 'Top up' })}</Link>
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
              {t({ ru: 'Выйти из аккаунта', en: 'Log out' })}
            </button>
          </aside>

          {/* Main content */}
          <main className={styles.main}>
            {/* Account tab */}
            {activeTab === 'account' && (
              <div className={styles.tabContent}>
                <h2 className={styles.tabTitle}>{t({ ru: 'Информация об аккаунте', en: 'Account information' })}</h2>

                {/* Stats row */}
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t({ ru: 'Заказов', en: 'Orders' })}</span>
                    <strong className={styles.statValue}>{stats.orders}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t({ ru: 'Товаров куплено', en: 'Items purchased' })}</span>
                    <strong className={styles.statValue}>{stats.items}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t({ ru: 'Потрачено', en: 'Spent' })}</span>
                    <strong className={styles.statValue}>{formatMoney(stats.spent)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t({ ru: 'Баланс', en: 'Balance' })}</span>
                    <strong className={`${styles.statValue} ${styles.statBalance}`}>{formatMoney(balance)}</strong>
                  </div>
                </div>

                {/* Profile info card */}
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{t({ ru: 'Личные данные', en: 'Personal data' })}</h3>
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
                        {t({ ru: 'Редактировать', en: 'Edit' })}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className={styles.editForm}>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>{t({ ru: 'Имя', en: 'First name' })}</label>
                        <input
                          className={styles.editInput}
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                        />
                      </div>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>{t({ ru: 'Фамилия', en: 'Last name' })}</label>
                        <input
                          className={styles.editInput}
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                        />
                      </div>
                      <div className={styles.editRow}>
                        <label className={styles.editLabel}>{t({ ru: 'Телефон', en: 'Phone' })}</label>
                        <input
                          className={styles.editInput}
                          placeholder="+373 (___) ___-___"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </div>
                      <div className={styles.editActions}>
                        <button type="button" className={styles.saveBtn} onClick={handleSaveProfile}>
                          <FiCheck size={15} /> {t({ ru: 'Сохранить', en: 'Save' })}
                        </button>
                        <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit}>
                          <FiX size={15} /> {t({ ru: 'Отмена', en: 'Cancel' })}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t({ ru: 'Имя', en: 'First name' })}</span>
                        <span className={styles.infoValue}>{firstName || '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t({ ru: 'Фамилия', en: 'Last name' })}</span>
                        <span className={styles.infoValue}>{lastName || '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{sessionUser?.email ?? '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t({ ru: 'Телефон', en: 'Phone' })}</span>
                        <span className={styles.infoValue}>{phone || t({ ru: 'Не указан', en: 'Not specified' })}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t({ ru: 'Роль', en: 'Role' })}</span>
                        <span className={styles.infoValue}>{roleLabel}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>{t({ ru: 'ID пользователя', en: 'User ID' })}</span>
                        <span className={styles.infoValue}>{sessionUser?.id ?? '—'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Last order */}
                {stats.lastPurchaseAt && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{t({ ru: 'Последняя активность', en: 'Recent activity' })}</h3>
                    <p className={styles.mutedText}>
                      {t({ ru: 'Последняя покупка:', en: 'Last purchase:' })} <strong>{formatDate(stats.lastPurchaseAt)}</strong>
                    </p>
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => setActiveTab('orders')}
                    >
                      {t({ ru: 'Посмотреть все заказы →', en: 'View all orders →' })}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className={styles.tabContent}>
                <div className={styles.tabTitleRow}>
                  <h2 className={styles.tabTitle}>{t({ ru: 'История заказов', en: 'Order history' })}</h2>
                  <span className={styles.countBadge}>{purchaseHistory.length}</span>
                </div>

                {purchaseHistory.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiShoppingBag size={40} className={styles.emptyIcon} />
                    <p>{t({ ru: 'У вас пока нет заказов', en: 'You have no orders yet' })}</p>
                    <Link to="/catalog" className={styles.ctaLink}>{t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}</Link>
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
                            <span className={styles.orderStatus}>{t({ ru: 'Выполнен', en: 'Completed' })}</span>
                            <span className={styles.orderDate}>{formatDate(order.purchasedAt)}</span>
                          </div>
                          <div className={styles.orderSummary}>
                            <span className={styles.orderItems}>{order.itemsCount} {t({ ru: 'шт.', en: 'pcs.' })}</span>
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
                              <span>{t({ ru: 'Итого:', en: 'Total:' })}</span>
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
                  <h2 className={styles.tabTitle}>{t({ ru: 'Избранное', en: 'Favorites' })}</h2>
                  <span className={styles.countBadge}>{favorites.length}</span>
                </div>

                {favorites.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiHeart size={40} className={styles.emptyIcon} />
                    <p>{t({ ru: 'Список избранного пуст', en: 'Favorites list is empty' })}</p>
                    <Link to="/catalog" className={styles.ctaLink}>{t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}</Link>
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
                <h2 className={styles.tabTitle}>{t({ ru: 'Настройки', en: 'Settings' })}</h2>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>{t({ ru: 'Безопасность', en: 'Security' })}</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>{t({ ru: 'Пароль', en: 'Password' })}</div>
                      <div className={styles.settingDesc}>{t({ ru: 'Последнее изменение: неизвестно', en: 'Last changed: unknown' })}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast(t({ ru: 'Смена пароля недоступна в демо-режиме', en: 'Password change unavailable in demo mode' }), { icon: 'ℹ️' })}
                    >
                      {t({ ru: 'Изменить', en: 'Change' })}
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>{t({ ru: 'Двухфакторная аутентификация', en: 'Two-factor authentication' })}</div>
                      <div className={styles.settingDesc}>{t({ ru: 'Отключена', en: 'Disabled' })}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast(t({ ru: '2FA недоступна в демо-режиме', en: '2FA unavailable in demo mode' }), { icon: 'ℹ️' })}
                    >
                      {t({ ru: 'Включить', en: 'Enable' })}
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>{t({ ru: 'Уведомления', en: 'Notifications' })}</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>{t({ ru: 'Email-уведомления о заказах', en: 'Email order notifications' })}</div>
                      <div className={styles.settingDesc}>{t({ ru: 'Получайте статус заказов на почту', en: 'Receive order status updates by email' })}</div>
                    </div>
                    <button
                      type="button"
                      className={`${styles.settingBtn} ${styles.settingBtnActive}`}
                      onClick={() => toast(t({ ru: 'Настройки уведомлений недоступны в демо', en: 'Notification settings unavailable in demo' }), { icon: 'ℹ️' })}
                    >
                      {t({ ru: 'Включено', en: 'Enabled' })}
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>{t({ ru: 'Промо-рассылка', en: 'Promotional emails' })}</div>
                      <div className={styles.settingDesc}>{t({ ru: 'Акции, скидки и новинки', en: 'Promotions, discounts and new arrivals' })}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingBtn}
                      onClick={() => toast(t({ ru: 'Настройки рассылки недоступны в демо', en: 'Mailing settings unavailable in demo' }), { icon: 'ℹ️' })}
                    >
                      {t({ ru: 'Отключена', en: 'Disabled' })}
                    </button>
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>{t({ ru: 'Аккаунт', en: 'Account' })}</h3>
                  <div className={styles.settingRow}>
                    <div>
                      <div className={styles.settingName}>{t({ ru: 'Выйти из аккаунта', en: 'Log out' })}</div>
                      <div className={styles.settingDesc}>{t({ ru: 'Завершить текущую сессию', en: 'End current session' })}</div>
                    </div>
                    <button type="button" className={styles.settingBtnDanger} onClick={logout}>
                      {t({ ru: 'Выйти', en: 'Log out' })}
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
