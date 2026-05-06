import { useEffect, useMemo, useState } from 'react'
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
import axios from 'axios'
import { useSessionStore } from '@/entities/session/model/session.store'
import { updateProfile } from '@/entities/user/api/profile.api'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { fetchMyOrders, type Order } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './profile.module.css'

type Tab = 'account' | 'orders' | 'favorites' | 'settings'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )

const orderStatusLabel = (status: Order['status'], t: (m: { ru: string; en: string }) => string) => {
  switch (status) {
    case 'Pending':
      return t({ ru: 'Ожидает', en: 'Pending' })
    case 'Paid':
      return t({ ru: 'Оплачен', en: 'Paid' })
    case 'Shipped':
      return t({ ru: 'Отправлен', en: 'Shipped' })
    case 'Completed':
      return t({ ru: 'Выполнен', en: 'Completed' })
    case 'Cancelled':
      return t({ ru: 'Отменён', en: 'Cancelled' })
    default:
      return status
  }
}

export default function ProfilePage() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const isBootstrapped = useSessionStore((s) => s.isBootstrapped)
  const sessionUser = useSessionStore((s) => s.user)
  const setUser = useSessionStore((s) => s.setUser)
  const logout = useSessionStore((s) => s.logout)

  const favorites = useFavoritesStore((s) => s.favorites)

  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)

  const firstName = sessionUser?.firstName ?? ''
  const lastName = sessionUser?.lastName ?? ''
  const phone = sessionUser?.phone ?? ''
  const balance = sessionUser?.balance ?? 0

  const [editFirstName, setEditFirstName] = useState(firstName)
  const [editLastName, setEditLastName] = useState(lastName)
  const [editPhone, setEditPhone] = useState(phone)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!sessionUser) return
    let cancelled = false
    setIsOrdersLoading(true)
    fetchMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
      .finally(() => {
        if (!cancelled) setIsOrdersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sessionUser])

  if (isBootstrapped && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const stats = useMemo(() => {
    const paidOrders = orders.filter(
      (o) => o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Completed',
    )
    const items = paidOrders.reduce(
      (sum, order) => sum + order.items.reduce((s, line) => s + line.quantity, 0),
      0,
    )
    const spent = paidOrders.reduce((sum, order) => sum + order.subtotal, 0)
    const lastPurchaseAt = paidOrders.length > 0
      ? paidOrders.reduce((latest, order) => {
          const ts = order.paidAt ?? order.createdAt
          return ts > latest ? ts : latest
        }, '')
      : null
    return { ordersCount: paidOrders.length, items, spent, lastPurchaseAt }
  }, [orders])

  const displayName = sessionUser?.username ?? `${firstName} ${lastName}`.trim()
  const initials = displayName.slice(0, 2).toUpperCase() || 'U'
  const roleLabel = sessionUser?.role === 'admin'
    ? t({ ru: 'Администратор', en: 'Administrator' })
    : t({ ru: 'Клиент', en: 'Client' })
  const roleClass = sessionUser?.role === 'admin' ? styles.roleAdmin : styles.roleClient

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error(t({ ru: 'Имя и фамилия не могут быть пустыми', en: 'First and last name cannot be empty' }))
      return
    }
    setIsSaving(true)
    try {
      const updated = await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim(),
      })
      setUser(updated)
      toast.success(t({ ru: 'Профиль обновлён', en: 'Profile updated' }))
      setIsEditing(false)
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : t({ ru: 'Не удалось обновить профиль', en: 'Failed to update profile' })
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditFirstName(firstName)
    setEditLastName(lastName)
    setEditPhone(phone)
    setIsEditing(false)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: t({ ru: 'Аккаунт', en: 'Account' }), icon: <FiUser size={17} /> },
    { id: 'orders', label: `${t({ ru: 'Заказы', en: 'Orders' })} (${orders.length})`, icon: <FiShoppingBag size={17} /> },
    { id: 'favorites', label: `${t({ ru: 'Избранное', en: 'Favorites' })} (${favorites.length})`, icon: <FiHeart size={17} /> },
    { id: 'settings', label: t({ ru: 'Настройки', en: 'Settings' }), icon: <FiSettings size={17} /> },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t({ ru: 'Личный кабинет', en: 'My account' })}</h1>
          <p className={styles.pageSubtitle}>{t({ ru: 'Управляйте профилем, заказами и настройками', en: 'Manage your profile, orders, and settings' })}</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarProfile}>
              <div className={styles.avatar}>
                <span className={styles.avatarInitials}>{initials}</span>
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

          <main className={styles.main}>
            {activeTab === 'account' && (
              <div className={styles.tabContent}>
                <h2 className={styles.tabTitle}>{t({ ru: 'Информация об аккаунте', en: 'Account information' })}</h2>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t({ ru: 'Заказов', en: 'Orders' })}</span>
                    <strong className={styles.statValue}>{stats.ordersCount}</strong>
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
                        <button type="button" className={styles.saveBtn} onClick={handleSaveProfile} disabled={isSaving}>
                          <FiCheck size={15} /> {isSaving ? t({ ru: 'Сохраняем…', en: 'Saving…' }) : t({ ru: 'Сохранить', en: 'Save' })}
                        </button>
                        <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit} disabled={isSaving}>
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

            {activeTab === 'orders' && (
              <div className={styles.tabContent}>
                <div className={styles.tabTitleRow}>
                  <h2 className={styles.tabTitle}>{t({ ru: 'История заказов', en: 'Order history' })}</h2>
                  <span className={styles.countBadge}>{orders.length}</span>
                </div>

                {isOrdersLoading ? (
                  <div className={styles.emptyState}>
                    <p>{t({ ru: 'Загрузка…', en: 'Loading…' })}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FiShoppingBag size={40} className={styles.emptyIcon} />
                    <p>{t({ ru: 'У вас пока нет заказов', en: 'You have no orders yet' })}</p>
                    <Link to="/catalog" className={styles.ctaLink}>{t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}</Link>
                  </div>
                ) : (
                  <div className={styles.orderList}>
                    {orders.map((order) => {
                      const itemsCount = order.items.reduce((s, l) => s + l.quantity, 0)
                      return (
                        <article key={order.id} className={styles.orderCard}>
                          <button
                            type="button"
                            className={styles.orderHeader}
                            onClick={() =>
                              setExpandedOrder(expandedOrder === order.id ? null : order.id)
                            }
                          >
                            <div className={styles.orderMeta}>
                              <span className={styles.orderStatus}>{orderStatusLabel(order.status, t)}</span>
                              <span className={styles.orderDate}>{formatDate(order.paidAt ?? order.createdAt)}</span>
                            </div>
                            <div className={styles.orderSummary}>
                              <span className={styles.orderItems}>{itemsCount} {t({ ru: 'шт.', en: 'pcs.' })}</span>
                              <strong className={styles.orderTotal}>{formatMoney(order.subtotal)}</strong>
                              {expandedOrder === order.id ? (
                                <FiChevronUp size={16} />
                              ) : (
                                <FiChevronDown size={16} />
                              )}
                            </div>
                          </button>

                          {expandedOrder === order.id && (
                            <div className={styles.orderLines}>
                              {order.items.map((line) => (
                                <div
                                  key={line.id}
                                  className={styles.orderLine}
                                >
                                  <span className={styles.lineTitle}>{line.productName}</span>
                                  <span className={styles.lineQty}>
                                    {line.quantity} × {formatMoney(line.unitPrice)}
                                  </span>
                                  <span className={styles.lineTotal}>
                                    {formatMoney(line.lineTotal)}
                                  </span>
                                </div>
                              ))}
                              <div className={styles.orderFooter}>
                                <span>{t({ ru: 'Итого:', en: 'Total:' })}</span>
                                <strong>{formatMoney(order.subtotal)}</strong>
                              </div>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

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
