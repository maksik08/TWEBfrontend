import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/entities/cart/model/cart.store'
import { calculatePrice } from '@/entities/calculator/Model/calculate'
import type {
  CalculateRequest,
  InstallationType,
  ObjectType,
} from '@/entities/calculator/Model/types'
import { useSessionStore } from '@/entities/session/model/session.store'
import { createOrder, payOrder } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './checkout.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

type ShippingForm = {
  recipientName: string
  phone: string
  city: string
  shippingAddress: string
  comment: string
}

type ShippingErrors = Partial<Record<keyof ShippingForm, string>>

const SHIPPING_STORAGE_KEY = 'tweb:checkout:shipping'

const emptyShipping: ShippingForm = {
  recipientName: '',
  phone: '',
  city: '',
  shippingAddress: '',
  comment: '',
}

const loadShipping = (): ShippingForm => {
  if (typeof window === 'undefined') return emptyShipping
  try {
    const raw = window.localStorage.getItem(SHIPPING_STORAGE_KEY)
    if (!raw) return emptyShipping
    const parsed = JSON.parse(raw) as Partial<ShippingForm>
    return { ...emptyShipping, ...parsed }
  } catch {
    return emptyShipping
  }
}

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

const validateShipping = (form: ShippingForm, t: ReturnType<typeof useLanguage>['t']): ShippingErrors => {
  const errors: ShippingErrors = {}
  const required = t({ ru: 'Обязательное поле', en: 'Required field' })

  if (form.recipientName.trim().length < 2) errors.recipientName = required
  if (form.phone.trim().length < 5) errors.phone = required
  if (form.city.trim().length < 2) errors.city = required
  if (form.shippingAddress.trim().length < 5) errors.shippingAddress = required

  return errors
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const sessionUser = useSessionStore((s) => s.user)
  const patchUser = useSessionStore((s) => s.patchUser)
  const balance = sessionUser?.balance ?? 0

  const [searchParams] = useSearchParams()
  const [shipping, setShipping] = useState<ShippingForm>(loadShipping)
  const [errors, setErrors] = useState<ShippingErrors>({})
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
    if (!servicesEnabled || cartEquipment.length === 0) return null
    return calculatePrice({ ...serviceForm, selectedEquipment: cartEquipment })
  }, [cartEquipment, serviceForm, servicesEnabled])

  const goodsTotal = Math.max(0, subtotal - Math.max(0, discount))
  const servicesTotal = serviceCalculation?.total ?? 0
  const total = goodsTotal + servicesTotal
  const hasEnoughBalance = total <= balance

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { comment: _omit, ...persistable } = shipping
    void _omit
    try {
      window.localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(persistable))
    } catch {
      // ignore
    }
  }, [shipping])

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

  const toggleWork = (workId: string) => {
    setServiceForm((current) => ({
      ...current,
      works: current.works.includes(workId)
        ? current.works.filter((item) => item !== workId)
        : [...current.works, workId],
    }))
  }

  const setShippingField = <K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) => {
    setShipping((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
  }

  const handleSubmit = async () => {
    const validation = validateShipping(shipping, t)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      toast.error(t({ ru: 'Заполните адрес доставки', en: 'Fill in the shipping details' }))
      return
    }

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
        recipientName: shipping.recipientName.trim(),
        phone: shipping.phone.trim(),
        city: shipping.city.trim(),
        shippingAddress: shipping.shippingAddress.trim(),
        comment: shipping.comment.trim() || undefined,
      })

      const paid = await payOrder(order.id)
      patchUser({ balance: balance - paid.subtotal })

      toast.success(
        `${t({ ru: 'Заказ', en: 'Order' })} #${order.id} ${t({ ru: 'оплачен', en: 'paid' })} · ${formatMoney(paid.subtotal)}`,
      )
      clear()
      navigate(`/orders/${order.id}`)
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : t({ ru: 'Не удалось оформить заказ', en: 'Failed to place order' })
      toast.error(message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{t({ ru: 'Оформление заказа', en: 'Checkout' })}</h1>
          </div>
          <div className={styles.emptyState}>
            <p>{t({ ru: 'Корзина пуста. Добавьте товары перед оформлением.', en: 'Your cart is empty. Add some items before checking out.' })}</p>
            <p style={{ marginTop: '0.75rem' }}>
              <Link to="/catalog">{t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t({ ru: 'Оформление заказа', en: 'Checkout' })}</h1>
          <span className={styles.muted}>{t({ ru: 'Позиций:', en: 'Items:' })} {count}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>{t({ ru: 'Доставка и контакты', en: 'Shipping & contacts' })}</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>{t({ ru: 'Получатель', en: 'Recipient name' })}</span>
                  <input
                    value={shipping.recipientName}
                    onChange={(e) => setShippingField('recipientName', e.target.value)}
                    aria-invalid={!!errors.recipientName}
                    autoComplete="name"
                  />
                  {errors.recipientName && <span className={styles.fieldError}>{errors.recipientName}</span>}
                </label>

                <label className={styles.field}>
                  <span>{t({ ru: 'Телефон', en: 'Phone' })}</span>
                  <input
                    value={shipping.phone}
                    onChange={(e) => setShippingField('phone', e.target.value)}
                    aria-invalid={!!errors.phone}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </label>

                <label className={styles.field}>
                  <span>{t({ ru: 'Город', en: 'City' })}</span>
                  <input
                    value={shipping.city}
                    onChange={(e) => setShippingField('city', e.target.value)}
                    aria-invalid={!!errors.city}
                    autoComplete="address-level2"
                  />
                  {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
                </label>

                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>{t({ ru: 'Адрес доставки', en: 'Shipping address' })}</span>
                  <input
                    value={shipping.shippingAddress}
                    onChange={(e) => setShippingField('shippingAddress', e.target.value)}
                    aria-invalid={!!errors.shippingAddress}
                    autoComplete="street-address"
                    placeholder={t({ ru: 'Улица, дом, квартира', en: 'Street, building, apt.' })}
                  />
                  {errors.shippingAddress && (
                    <span className={styles.fieldError}>{errors.shippingAddress}</span>
                  )}
                </label>

                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>{t({ ru: 'Комментарий', en: 'Comment' })}</span>
                  <textarea
                    rows={3}
                    value={shipping.comment}
                    onChange={(e) => setShippingField('comment', e.target.value)}
                    placeholder={t({ ru: 'Удобное время доставки, дополнительные пожелания', en: 'Preferred delivery time, extra notes' })}
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>{t({ ru: 'Состав заказа', en: 'Order contents' })}</h2>
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.product.id} className={styles.itemRow}>
                    <div>
                      <div className={styles.itemName}>{item.product.title || item.product.name}</div>
                      <div className={styles.itemMeta}>
                        {item.quantity} × {formatMoney(item.product.price)}
                      </div>
                    </div>
                    <div className={styles.itemPrice}>
                      {formatMoney(item.quantity * item.product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.servicesHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>{t({ ru: 'Услуги и установка', en: 'Services & installation' })}</h2>
                  <p className={styles.muted}>
                    {t({ ru: 'Стоимость услуг считается как preview и добавляется к итогу заказа.', en: 'Services are previewed and added to the order total.' })}
                  </p>
                </div>
                <label className={styles.toggleBox}>
                  <input
                    type="checkbox"
                    checked={servicesEnabled}
                    onChange={(event) => setServicesEnabled(event.target.checked)}
                  />
                  <span>{t({ ru: 'Добавить услуги', en: 'Add services' })}</span>
                </label>
              </div>

              {servicesEnabled && (
                <>
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
                            setServiceForm((current) => ({ ...current, objectType: option.value }))
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
                            serviceForm.installationType === option.value ? styles.optionPillActive : ''
                          }`}
                          onClick={() =>
                            setServiceForm((current) => ({ ...current, installationType: option.value }))
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
                  </div>
                </>
              )}
            </section>
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
                style={{ maxWidth: 110 }}
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

            {!hasEnoughBalance && (
              <p className={styles.balanceHint}>
                {t({ ru: 'Недостаточно средств.', en: 'Insufficient funds.' })}{' '}
                <Link to="/balance">{t({ ru: 'Пополнить баланс', en: 'Top up balance' })}</Link>
              </p>
            )}

            <button
              className={styles.pay}
              disabled={total === 0 || !hasEnoughBalance || isCheckingOut}
              onClick={handleSubmit}
            >
              {isCheckingOut
                ? t({ ru: 'Оформление…', en: 'Processing…' })
                : t({ ru: 'Оформить и оплатить', en: 'Place order & pay' })}
            </button>

            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <Link to="/cart" className={styles.muted}>
                ← {t({ ru: 'Вернуться в корзину', en: 'Back to cart' })}
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
