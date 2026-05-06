import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/entities/cart/model/cart.store'
import { calculatePrice } from '@/entities/calculator/Model/calculate'
import type {
  CalculateRequest,
  InstallationType,
  ObjectType,
} from '@/entities/calculator/Model/types'
import { useProfileStore } from '@/entities/user/model/profile.store'
import { createOrder, payOrder } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './cart.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const createInitialServiceForm = (): Omit<CalculateRequest, 'selectedEquipment'> => ({
  objectType: 'flat',
  works: ['setup'],
  installationType: 'wireless',
  staffCount: 1,
  staffRate: 35,
  installationCost: 90,
  deliveryCost: 25,
  comment: '',
})

export default function CartPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const balance = useProfileStore((s) => s.balance)
  const recordPurchase = useProfileStore((s) => s.recordPurchase)

  const [discount, setDiscount] = useState<number>(0)
  const [servicesEnabled, setServicesEnabled] = useState(() => searchParams.get('services') === '1')
  const [serviceForm, setServiceForm] = useState<Omit<CalculateRequest, 'selectedEquipment'>>(
    createInitialServiceForm,
  )
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const count = useMemo(() => selectCartCount(items), [items])
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])
  const cartEquipment = useMemo(
    () =>
      items.map((item) => ({
        equipmentId: String(item.product.id),
        title: item.product.title || item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    [items],
  )
  const serviceCalculation = useMemo(() => {
    if (!servicesEnabled || cartEquipment.length === 0) {
      return null
    }

    return calculatePrice({
      ...serviceForm,
      selectedEquipment: cartEquipment,
    })
  }, [cartEquipment, serviceForm, servicesEnabled])

  const objectOptions: Array<{ value: ObjectType; label: string }> = [
    { value: 'flat', label: t({ ru: 'Квартира', en: 'Apartment' }) },
    { value: 'house', label: t({ ru: 'Дом', en: 'House' }) },
    { value: 'small_office', label: t({ ru: 'Малый офис', en: 'Small office' }) },
    { value: 'medium_office', label: t({ ru: 'Средний офис', en: 'Medium office' }) },
  ]

  const installationOptions: Array<{ value: InstallationType; label: string }> = [
    { value: 'wireless', label: t({ ru: 'Беспроводной монтаж', en: 'Wireless installation' }) },
    { value: 'fiber', label: t({ ru: 'Оптика', en: 'Fiber' }) },
    { value: 'copper', label: t({ ru: 'Медная сеть', en: 'Copper network' }) },
  ]

  const workOptions = [
    { id: 'survey', label: t({ ru: 'Обследование объекта', en: 'Site survey' }) },
    { id: 'design', label: t({ ru: 'Проектирование', en: 'Design' }) },
    { id: 'mounting', label: t({ ru: 'Монтаж линий', en: 'Cable installation' }) },
    { id: 'setup', label: t({ ru: 'Настройка оборудования', en: 'Equipment setup' }) },
    { id: 'testing', label: t({ ru: 'Тестирование и сдача', en: 'Testing & handover' }) },
  ]

  const goodsTotal = Math.max(0, subtotal - Math.max(0, discount))
  const servicesTotal = serviceCalculation?.total ?? 0
  const total = goodsTotal + servicesTotal
  const hasEnoughBalance = total <= balance

  const toggleWork = (workId: string) => {
    setServiceForm((current) => ({
      ...current,
      works: current.works.includes(workId)
        ? current.works.filter((item) => item !== workId)
        : [...current.works, workId],
    }))
  }

  const resetCartAddons = () => {
    setDiscount(0)
    setServicesEnabled(false)
    setServiceForm(createInitialServiceForm())
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t({ ru: 'Корзина', en: 'Cart' })}</h1>
          <span className={styles.muted}>{t({ ru: 'Позиций:', en: 'Items:' })} {count}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {items.length === 0 ? (
              <p className={styles.muted}>{t({ ru: 'Корзина пуста.', en: 'Cart is empty.' })}</p>
            ) : (
              <>
                <div className={styles.list}>
                  {items.map((item) => (
                    <div key={item.product.id} className={styles.card}>
                      <div className={styles.thumb}>
                        <img src={item.product.image} alt={item.product.title} />
                      </div>

                      <div>
                        <div className={styles.name}>{item.product.title || item.product.name}</div>
                        <div className={styles.meta}>
                          <span>{t({ ru: 'Категория:', en: 'Category:' })} {item.product.category}</span>
                          <span>{t({ ru: 'За шт.:', en: 'Per unit:' })} {formatMoney(item.product.price)}</span>
                        </div>
                      </div>

                      <div className={styles.right}>
                        <div className={styles.price}>
                          {formatMoney(item.quantity * item.product.price)}
                        </div>

                        <div className={styles.qty}>
                          <button
                            className={styles.qtyButton}
                            onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            className={styles.qtyButton}
                            onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button className={styles.remove} onClick={() => remove(item.product.id)}>
                          {t({ ru: 'Удалить', en: 'Remove' })}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <section className={styles.servicesPanel}>
                  <div className={styles.servicesHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>{t({ ru: 'Калькулятор услуг', en: 'Services calculator' })}</h2>
                      <p className={styles.sectionText}>
                        {t({ ru: 'Дополнительные услуги считаются по оборудованию, которое уже лежит в корзине. Доставка обязательна и всегда входит в сервисную часть заказа.', en: 'Additional services are calculated based on equipment already in the cart. Delivery is mandatory and always included in the service part of the order.' })}
                      </p>
                    </div>

                    <label className={styles.toggleBox}>
                      <input
                        type="checkbox"
                        checked={servicesEnabled}
                        onChange={(event) => setServicesEnabled(event.target.checked)}
                      />
                      <span>{t({ ru: 'Добавить услуги и установку', en: 'Add services and installation' })}</span>
                    </label>
                  </div>

                  {servicesEnabled ? (
                    <>
                      <div className={styles.serviceEquipmentList}>
                        {cartEquipment.map((equipment) => (
                          <div key={equipment.equipmentId} className={styles.serviceEquipmentItem}>
                            <span>{equipment.title}</span>
                            <strong>
                              {equipment.quantity} {t({ ru: 'шт.', en: 'pcs.' })} · {formatMoney(equipment.unitPrice)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className={styles.optionGroup}>
                        <h3 className={styles.optionTitle}>{t({ ru: 'Тип объекта', en: 'Object type' })}</h3>
                        <div className={styles.optionPills}>
                          {objectOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`${styles.optionPill} ${
                                serviceForm.objectType === option.value ? styles.optionPillActive : ''
                              }`}
                              onClick={() =>
                                setServiceForm((current) => ({
                                  ...current,
                                  objectType: option.value,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.optionGroup}>
                        <h3 className={styles.optionTitle}>{t({ ru: 'Формат установки', en: 'Installation format' })}</h3>
                        <div className={styles.optionPills}>
                          {installationOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`${styles.optionPill} ${
                                serviceForm.installationType === option.value
                                  ? styles.optionPillActive
                                  : ''
                              }`}
                              onClick={() =>
                                setServiceForm((current) => ({
                                  ...current,
                                  installationType: option.value,
                                }))
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.optionGroup}>
                        <h3 className={styles.optionTitle}>{t({ ru: 'Опциональные функции', en: 'Optional features' })}</h3>
                        <div className={styles.checkGrid}>
                          {workOptions.map((work) => (
                            <label key={work.id} className={styles.checkItem}>
                              <input
                                type="checkbox"
                                checked={serviceForm.works.includes(work.id)}
                                onChange={() => toggleWork(work.id)}
                              />
                              <span>{work.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={styles.serviceFields}>
                        <label className={styles.field}>
                          <span>{t({ ru: 'Штатных сотрудников', en: 'Staff count' })}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={serviceForm.staffCount}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                staffCount: Math.max(0, Number(event.target.value) || 0),
                              }))
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>{t({ ru: 'Ставка за сотрудника', en: 'Staff rate' })}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={serviceForm.staffRate}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                staffRate: Math.max(0, Number(event.target.value) || 0),
                              }))
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>{t({ ru: 'Стоимость установки', en: 'Installation cost' })}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={serviceForm.installationCost}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                installationCost: Math.max(0, Number(event.target.value) || 0),
                              }))
                            }
                          />
                        </label>

                        <label className={styles.field}>
                          <span>{t({ ru: 'Доставка (обязательно)', en: 'Delivery (required)' })}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={serviceForm.deliveryCost}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                deliveryCost: Math.max(0, Number(event.target.value) || 0),
                              }))
                            }
                          />
                        </label>

                        <label className={`${styles.field} ${styles.fieldWide}`}>
                          <span>{t({ ru: 'Комментарии', en: 'Comments' })}</span>
                          <textarea
                            rows={4}
                            value={serviceForm.comment ?? ''}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                comment: event.target.value,
                              }))
                            }
                            placeholder={t({ ru: 'Комментарии сохраняются для заявки, но не участвуют в расчёте.', en: 'Comments are saved for the request but do not affect the calculation.' })}
                          />
                        </label>
                      </div>

                      {serviceCalculation && (
                        <div className={styles.serviceBreakdown}>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'База по объекту', en: 'Object base' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.objectBase)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Формат установки', en: 'Installation format' })}</span>
                            <strong>
                              {formatMoney(serviceCalculation.breakdown.installationType)}
                            </strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Опциональные функции', en: 'Optional features' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.works)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Позиции из корзины', en: 'Cart items' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.equipment)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Штатные сотрудники', en: 'Staff' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.staff)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Установка', en: 'Installation' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.installation)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>{t({ ru: 'Доставка', en: 'Delivery' })}</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.delivery)}</strong>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.serviceHint}>
                      {t({ ru: 'Включите блок выше, если хотите сразу посчитать установку, сотрудников и обязательную доставку к текущему заказу.', en: 'Enable the block above if you want to calculate installation, staff, and mandatory delivery costs for your current order.' })}
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Сумма товаров', en: 'Subtotal' })}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Скидка', en: 'Discount' })}</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                step={1}
                value={Number.isFinite(discount) ? discount : 0}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Итого по товарам', en: 'Goods total' })}</span>
              <span>{formatMoney(goodsTotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Услуги', en: 'Services' })}</span>
              <span>{formatMoney(servicesTotal)}</span>
            </div>

            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>{t({ ru: 'Итого', en: 'Total' })}</span>
              <span>{formatMoney(total)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Баланс', en: 'Balance' })}</span>
              <span className={hasEnoughBalance ? styles.balanceOk : styles.balanceLow}>
                {formatMoney(balance)}
              </span>
            </div>

            {items.length > 0 && !hasEnoughBalance && (
              <p className={styles.balanceHint}>
                {t({ ru: 'Недостаточно средств.', en: 'Insufficient funds.' })} <Link to="/balance">{t({ ru: 'Пополнить баланс', en: 'Top up balance' })}</Link>
              </p>
            )}

            <button
              className={styles.pay}
              disabled={items.length === 0 || total === 0 || !hasEnoughBalance || isCheckingOut}
              onClick={async () => {
                if (!hasEnoughBalance) {
                  toast.error(t({ ru: 'Недостаточно средств для оплаты', en: 'Insufficient funds for payment' }))
                  return
                }

                setIsCheckingOut(true)
                try {
                  const order = await createOrder({
                    items: items.map((item) => ({
                      productId: item.product.id,
                      quantity: item.quantity,
                    })),
                  })

                  await payOrder(order.id)

                  const purchaseLines = items.map((item) => ({
                    productId: item.product.id,
                    title: item.product.title || item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.price,
                  }))

                  if (serviceCalculation) {
                    if (serviceCalculation.breakdown.delivery > 0) {
                      purchaseLines.push({
                        productId: 900001,
                        title: t({ ru: 'Доставка оборудования', en: 'Equipment delivery' }),
                        quantity: 1,
                        unitPrice: serviceCalculation.breakdown.delivery,
                      })
                    }

                    const extraServices =
                      serviceCalculation.total - serviceCalculation.breakdown.delivery

                    if (extraServices > 0) {
                      purchaseLines.push({
                        productId: 900002,
                        title: t({ ru: 'Услуги установки и настройки', en: 'Installation and setup services' }),
                        quantity: 1,
                        unitPrice: extraServices,
                      })
                    }
                  }

                  recordPurchase({
                    total,
                    lines: purchaseLines,
                  })
                  toast.success(
                    `${t({ ru: 'Заказ', en: 'Order' })} #${order.id} ${t({ ru: 'оплачен', en: 'paid' })} · ${formatMoney(total)}`,
                  )
                  clear()
                  resetCartAddons()
                } catch (error) {
                  const message =
                    axios.isAxiosError(error) && error.response?.data?.message
                      ? error.response.data.message
                      : t({ ru: 'Не удалось оформить заказ', en: 'Failed to place order' })
                  toast.error(message)
                } finally {
                  setIsCheckingOut(false)
                }
              }}
            >
              {isCheckingOut
                ? t({ ru: 'Оплата…', en: 'Paying…' })
                : t({ ru: 'Оплатить', en: 'Pay' })}
            </button>

            {items.length > 0 && (
              <button
                className={styles.remove}
                onClick={() => {
                  clear()
                  resetCartAddons()
                }}
                style={{ marginTop: '0.75rem' }}
              >
                {t({ ru: 'Очистить корзину', en: 'Clear cart' })}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
