import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/entities/cart/model/cart.store'
import { calculatePrice } from '@/entities/calculator/Model/calculate'
import type {
  CalculateRequest,
  InstallationType,
  ObjectType,
} from '@/entities/calculator/Model/types'
import { useProfileStore } from '@/entities/user/model/profile.store'
import styles from './cart.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const objectOptions: Array<{ value: ObjectType; label: string }> = [
  { value: 'flat', label: 'Квартира' },
  { value: 'house', label: 'Дом' },
  { value: 'small_office', label: 'Малый офис' },
  { value: 'medium_office', label: 'Средний офис' },
]

const installationOptions: Array<{ value: InstallationType; label: string }> = [
  { value: 'wireless', label: 'Беспроводной монтаж' },
  { value: 'fiber', label: 'Оптика' },
  { value: 'copper', label: 'Медная сеть' },
]

const workOptions = [
  { id: 'survey', label: 'Обследование объекта' },
  { id: 'design', label: 'Проектирование' },
  { id: 'mounting', label: 'Монтаж линий' },
  { id: 'setup', label: 'Настройка оборудования' },
  { id: 'testing', label: 'Тестирование и сдача' },
]

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
          <h1 className={styles.title}>Корзина</h1>
          <span className={styles.muted}>Позиций: {count}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {items.length === 0 ? (
              <p className={styles.muted}>Корзина пуста.</p>
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
                          <span>Категория: {item.product.category}</span>
                          <span>За шт.: {formatMoney(item.product.price)}</span>
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
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <section className={styles.servicesPanel}>
                  <div className={styles.servicesHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Калькулятор услуг</h2>
                      <p className={styles.sectionText}>
                        Дополнительные услуги считаются по оборудованию, которое уже лежит в
                        корзине. Доставка обязательна и всегда входит в сервисную часть заказа.
                      </p>
                    </div>

                    <label className={styles.toggleBox}>
                      <input
                        type="checkbox"
                        checked={servicesEnabled}
                        onChange={(event) => setServicesEnabled(event.target.checked)}
                      />
                      <span>Добавить услуги и установку</span>
                    </label>
                  </div>

                  {servicesEnabled ? (
                    <>
                      <div className={styles.serviceEquipmentList}>
                        {cartEquipment.map((equipment) => (
                          <div key={equipment.equipmentId} className={styles.serviceEquipmentItem}>
                            <span>{equipment.title}</span>
                            <strong>
                              {equipment.quantity} шт. · {formatMoney(equipment.unitPrice)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className={styles.optionGroup}>
                        <h3 className={styles.optionTitle}>Тип объекта</h3>
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
                        <h3 className={styles.optionTitle}>Формат установки</h3>
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
                        <h3 className={styles.optionTitle}>Опциональные функции</h3>
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
                          <span>Штатных сотрудников</span>
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
                          <span>Ставка за сотрудника</span>
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
                          <span>Стоимость установки</span>
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
                          <span>Доставка (обязательно)</span>
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
                          <span>Комментарии</span>
                          <textarea
                            rows={4}
                            value={serviceForm.comment ?? ''}
                            onChange={(event) =>
                              setServiceForm((current) => ({
                                ...current,
                                comment: event.target.value,
                              }))
                            }
                            placeholder="Комментарии сохраняются для заявки, но не участвуют в расчёте."
                          />
                        </label>
                      </div>

                      {serviceCalculation && (
                        <div className={styles.serviceBreakdown}>
                          <div className={styles.breakdownRow}>
                            <span>База по объекту</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.objectBase)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Формат установки</span>
                            <strong>
                              {formatMoney(serviceCalculation.breakdown.installationType)}
                            </strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Опциональные функции</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.works)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Позиции из корзины</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.equipment)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Штатные сотрудники</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.staff)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Установка</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.installation)}</strong>
                          </div>
                          <div className={styles.breakdownRow}>
                            <span>Доставка</span>
                            <strong>{formatMoney(serviceCalculation.breakdown.delivery)}</strong>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.serviceHint}>
                      Включите блок выше, если хотите сразу посчитать установку, сотрудников и
                      обязательную доставку к текущему заказу.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.muted}>Сумма товаров</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>Скидка</span>
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
              <span className={styles.muted}>Итого по товарам</span>
              <span>{formatMoney(goodsTotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>Услуги</span>
              <span>{formatMoney(servicesTotal)}</span>
            </div>

            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Итого</span>
              <span>{formatMoney(total)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>Баланс</span>
              <span className={hasEnoughBalance ? styles.balanceOk : styles.balanceLow}>
                {formatMoney(balance)}
              </span>
            </div>

            {items.length > 0 && !hasEnoughBalance && (
              <p className={styles.balanceHint}>
                Недостаточно средств. <Link to="/balance">Пополнить баланс</Link>
              </p>
            )}

            <button
              className={styles.pay}
              disabled={items.length === 0 || total === 0 || !hasEnoughBalance}
              onClick={() => {
                if (!hasEnoughBalance) {
                  toast.error('Недостаточно средств для оплаты')
                  return
                }

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
                      title: 'Доставка оборудования',
                      quantity: 1,
                      unitPrice: serviceCalculation.breakdown.delivery,
                    })
                  }

                  const extraServices =
                    serviceCalculation.total - serviceCalculation.breakdown.delivery

                  if (extraServices > 0) {
                    purchaseLines.push({
                      productId: 900002,
                      title: 'Услуги установки и настройки',
                      quantity: 1,
                      unitPrice: extraServices,
                    })
                  }
                }

                recordPurchase({
                  total,
                  lines: purchaseLines,
                })
                toast.success(`Оплачено ${formatMoney(total)} (демо)`)
                clear()
                resetCartAddons()
              }}
            >
              Оплатить
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
                Очистить корзину
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
