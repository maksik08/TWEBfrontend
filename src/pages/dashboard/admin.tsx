import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useContentStore,
  defaultHome,
  defaultAbout,
  type ContentService,
  type ContentPromotion,
  type HomeContent,
  type AboutContent,
  type BilingualText,
} from '@/entities/content/model/content.store'
import { AdminProductsTab } from './admin-products-tab'
import styles from './admin.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'services' | 'promotions' | 'home' | 'about' | 'products'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BilingualField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: BilingualText
  onChange: (v: BilingualText) => void
  multiline?: boolean
}) {
  return (
    <div>
      <p className={styles.fieldLabel}>{label}</p>
      <div className={styles.bilingualRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>RU</span>
          {multiline ? (
            <textarea
              className={styles.textarea}
              value={value.ru}
              onChange={(e) => onChange({ ...value, ru: e.target.value })}
              rows={3}
            />
          ) : (
            <input
              className={styles.input}
              value={value.ru}
              onChange={(e) => onChange({ ...value, ru: e.target.value })}
            />
          )}
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>EN</span>
          {multiline ? (
            <textarea
              className={styles.textarea}
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              rows={3}
            />
          ) : (
            <input
              className={styles.input}
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
            />
          )}
        </label>
      </div>
    </div>
  )
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab() {
  const { services, promotions, home, resetToDefaults } = useContentStore()

  const handleReset = () => {
    resetToDefaults()
    toast.success('Все данные сброшены до значений по умолчанию')
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Обзор контента</h2>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{services.length}</span>
            <span className={styles.statLabel}>Услуг</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{promotions.length}</span>
            <span className={styles.statLabel}>Акций</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{home.promos.length}</span>
            <span className={styles.statLabel}>Промо-карточек</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{home.categories.length}</span>
            <span className={styles.statLabel}>Категорий</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{home.benefits.length}</span>
            <span className={styles.statLabel}>Преимуществ</span>
          </div>
        </div>
        <div className={styles.actionRow}>
          <button type="button" className={styles.btnReset} onClick={handleReset}>
            Сбросить всё до значений по умолчанию
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Быстрые ссылки</h2>
        </div>
        <div className={styles.overviewLinks}>
          <Link to="/" className={styles.overviewLink}>Главная страница</Link>
          <Link to="/about" className={styles.overviewLink}>О компании</Link>
          <Link to="/catalog?section=services" className={styles.overviewLink}>Каталог — Услуги</Link>
          <Link to="/catalog?section=promotions" className={styles.overviewLink}>Каталог — Акции</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Services ────────────────────────────────────────────────────────────

function ServicesTab() {
  const { services, setServices } = useContentStore()
  const [draft, setDraft] = useState<ContentService[]>(() => structuredClone(services))

  const update = (index: number, patch: Partial<ContentService>) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addItem = () => {
    setDraft((prev) => [
      ...prev,
      { id: `service-${Date.now()}`, name: '', description: '', price: 0, ctaLabel: '' },
    ])
  }

  const removeItem = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }

  const save = () => {
    setServices(draft)
    toast.success('Услуги сохранены')
  }

  const reset = () => {
    setDraft(structuredClone(services))
    toast('Черновик сброшен')
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Услуги ({draft.length})</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={reset}>Сбросить</button>
            <button type="button" className={styles.btnPrimary} onClick={save}>Сохранить</button>
          </div>
        </div>

        <div className={styles.itemList}>
          {draft.map((service, i) => (
            <div key={service.id} className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>Услуга {i + 1}</span>
                <button type="button" className={styles.btnDanger} onClick={() => removeItem(i)}>
                  Удалить
                </button>
              </div>
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Название</span>
                  <input className={styles.input} value={service.name} onChange={(e) => update(i, { name: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Цена ($)</span>
                  <input className={styles.input} type="number" value={service.price} onChange={(e) => update(i, { price: Number(e.target.value) })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Кнопка (CTA)</span>
                  <input className={styles.input} value={service.ctaLabel} onChange={(e) => update(i, { ctaLabel: e.target.value })} />
                </label>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Описание</span>
                <textarea className={styles.textarea} value={service.description} rows={2} onChange={(e) => update(i, { description: e.target.value })} />
              </label>
            </div>
          ))}
        </div>

        <button type="button" className={styles.btnAdd} onClick={addItem} style={{ marginTop: '1rem' }}>
          + Добавить услугу
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Promotions ──────────────────────────────────────────────────────────

function PromotionsTab() {
  const { promotions, setPromotions } = useContentStore()
  const [draft, setDraft] = useState<ContentPromotion[]>(() => structuredClone(promotions))

  const update = (index: number, patch: Partial<ContentPromotion>) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const addItem = () => {
    setDraft((prev) => [
      ...prev,
      { id: `promo-${Date.now()}`, title: '', description: '', badge: '', discountLabel: '' },
    ])
  }

  const removeItem = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }

  const save = () => {
    setPromotions(draft)
    toast.success('Акции сохранены')
  }

  const reset = () => {
    setDraft(structuredClone(promotions))
    toast('Черновик сброшен')
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Акции ({draft.length})</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnSecondary} onClick={reset}>Сбросить</button>
            <button type="button" className={styles.btnPrimary} onClick={save}>Сохранить</button>
          </div>
        </div>

        <div className={styles.itemList}>
          {draft.map((promo, i) => (
            <div key={promo.id} className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>Акция {i + 1}</span>
                <button type="button" className={styles.btnDanger} onClick={() => removeItem(i)}>
                  Удалить
                </button>
              </div>
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Заголовок</span>
                  <input className={styles.input} value={promo.title} onChange={(e) => update(i, { title: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Бейдж</span>
                  <input className={styles.input} value={promo.badge} onChange={(e) => update(i, { badge: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Скидка (лейбл)</span>
                  <input className={styles.input} value={promo.discountLabel} onChange={(e) => update(i, { discountLabel: e.target.value })} />
                </label>
              </div>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Описание</span>
                <textarea className={styles.textarea} value={promo.description} rows={2} onChange={(e) => update(i, { description: e.target.value })} />
              </label>
            </div>
          ))}
        </div>

        <button type="button" className={styles.btnAdd} onClick={addItem} style={{ marginTop: '1rem' }}>
          + Добавить акцию
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Home ────────────────────────────────────────────────────────────────

function HomeTab() {
  const { home, setHome } = useContentStore()
  const [draft, setDraft] = useState<HomeContent>(() => structuredClone(home))

  const save = () => {
    setHome(draft)
    toast.success('Главная страница сохранена')
  }

  const reset = () => {
    setDraft(structuredClone(home))
    toast('Черновик сброшен')
  }

  const resetToDefault = () => {
    setDraft(structuredClone(defaultHome))
    toast('Сброшено до значений по умолчанию')
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Главная страница</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnReset} onClick={resetToDefault}>По умолчанию</button>
            <button type="button" className={styles.btnSecondary} onClick={reset}>Сбросить</button>
            <button type="button" className={styles.btnPrimary} onClick={save}>Сохранить</button>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>CTA-баннер</p>
          <div className={styles.itemList}>
            <BilingualField
              label="Заголовок"
              value={draft.cta.title}
              onChange={(v) => setDraft((d) => ({ ...d, cta: { ...d.cta, title: v } }))}
            />
            <BilingualField
              label="Текст"
              value={draft.cta.text}
              onChange={(v) => setDraft((d) => ({ ...d, cta: { ...d.cta, text: v } }))}
              multiline
            />
          </div>
        </div>

        {/* Promo cards */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>Промо-карточки ({draft.promos.length})</p>
          <div className={styles.itemList}>
            {draft.promos.map((promo, i) => (
              <div key={promo.id} className={styles.itemRow}>
                <div className={styles.itemRowHeader}>
                  <span className={styles.itemIndex}>Карточка {i + 1}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => setDraft((d) => ({ ...d, promos: d.promos.filter((_, idx) => idx !== i) }))}
                  >
                    Удалить
                  </button>
                </div>
                <div className={styles.fieldGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Скидка</span>
                    <input className={styles.input} value={promo.discount} onChange={(e) => setDraft((d) => ({ ...d, promos: d.promos.map((p, idx) => idx === i ? { ...p, discount: e.target.value } : p) }))} />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Цвет бейджа</span>
                    <input className={styles.input} value={promo.badgeColor} onChange={(e) => setDraft((d) => ({ ...d, promos: d.promos.map((p, idx) => idx === i ? { ...p, badgeColor: e.target.value } : p) }))} placeholder="danger / success / warning" />
                  </label>
                </div>
                <BilingualField
                  label="Бейдж"
                  value={promo.badge}
                  onChange={(v) => setDraft((d) => ({ ...d, promos: d.promos.map((p, idx) => idx === i ? { ...p, badge: v } : p) }))}
                />
                <BilingualField
                  label="Заголовок"
                  value={promo.title}
                  onChange={(v) => setDraft((d) => ({ ...d, promos: d.promos.map((p, idx) => idx === i ? { ...p, title: v } : p) }))}
                />
                <BilingualField
                  label="Описание"
                  value={promo.desc}
                  onChange={(v) => setDraft((d) => ({ ...d, promos: d.promos.map((p, idx) => idx === i ? { ...p, desc: v } : p) }))}
                  multiline
                />
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>Преимущества ({draft.benefits.length})</p>
          <div className={styles.itemList}>
            {draft.benefits.map((benefit, i) => (
              <div key={i} className={styles.itemRow}>
                <div className={styles.itemRowHeader}>
                  <span className={styles.itemIndex}>Преимущество {i + 1}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => setDraft((d) => ({ ...d, benefits: d.benefits.filter((_, idx) => idx !== i) }))}
                  >
                    Удалить
                  </button>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Иконка (эмодзи)</span>
                  <input className={styles.input} value={benefit.icon} onChange={(e) => setDraft((d) => ({ ...d, benefits: d.benefits.map((b, idx) => idx === i ? { ...b, icon: e.target.value } : b) }))} />
                </label>
                <BilingualField
                  label="Заголовок"
                  value={benefit.title}
                  onChange={(v) => setDraft((d) => ({ ...d, benefits: d.benefits.map((b, idx) => idx === i ? { ...b, title: v } : b) }))}
                />
                <BilingualField
                  label="Текст"
                  value={benefit.text}
                  onChange={(v) => setDraft((d) => ({ ...d, benefits: d.benefits.map((b, idx) => idx === i ? { ...b, text: v } : b) }))}
                  multiline
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.btnAdd}
            style={{ marginTop: '1rem' }}
            onClick={() => setDraft((d) => ({ ...d, benefits: [...d.benefits, { icon: '', title: { ru: '', en: '' }, text: { ru: '', en: '' } }] }))}
          >
            + Добавить преимущество
          </button>
        </div>

        {/* Categories */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>Категории ({draft.categories.length})</p>
          <div className={styles.itemList}>
            {draft.categories.map((cat, i) => (
              <div key={i} className={styles.itemRow}>
                <div className={styles.itemRowHeader}>
                  <span className={styles.itemIndex}>Категория {i + 1}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => setDraft((d) => ({ ...d, categories: d.categories.filter((_, idx) => idx !== i) }))}
                  >
                    Удалить
                  </button>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Иконка (эмодзи)</span>
                  <input className={styles.input} value={cat.icon} onChange={(e) => setDraft((d) => ({ ...d, categories: d.categories.map((c, idx) => idx === i ? { ...c, icon: e.target.value } : c) }))} />
                </label>
                <BilingualField
                  label="Название"
                  value={cat.name}
                  onChange={(v) => setDraft((d) => ({ ...d, categories: d.categories.map((c, idx) => idx === i ? { ...c, name: v } : c) }))}
                />
                <BilingualField
                  label="Количество"
                  value={cat.count}
                  onChange={(v) => setDraft((d) => ({ ...d, categories: d.categories.map((c, idx) => idx === i ? { ...c, count: v } : c) }))}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.btnAdd}
            style={{ marginTop: '1rem' }}
            onClick={() => setDraft((d) => ({ ...d, categories: [...d.categories, { icon: '', name: { ru: '', en: '' }, count: { ru: '', en: '' } }] }))}
          >
            + Добавить категорию
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: About ───────────────────────────────────────────────────────────────

function AboutTab() {
  const { about, setAbout } = useContentStore()
  const [draft, setDraft] = useState<AboutContent>(() => structuredClone(about))

  const save = () => {
    setAbout(draft)
    toast.success('Страница «О компании» сохранена')
  }

  const reset = () => {
    setDraft(structuredClone(about))
    toast('Черновик сброшен')
  }

  const resetToDefault = () => {
    setDraft(structuredClone(defaultAbout))
    toast('Сброшено до значений по умолчанию')
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>О компании</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnReset} onClick={resetToDefault}>По умолчанию</button>
            <button type="button" className={styles.btnSecondary} onClick={reset}>Сбросить</button>
            <button type="button" className={styles.btnPrimary} onClick={save}>Сохранить</button>
          </div>
        </div>

        {/* Lead */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>Вводный текст</p>
          <BilingualField
            label="Текст"
            value={draft.lead}
            onChange={(v) => setDraft((d) => ({ ...d, lead: v }))}
            multiline
          />
        </div>

        {/* Values */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>Ценности ({draft.values.length})</p>
          <div className={styles.itemList}>
            {draft.values.map((value, i) => (
              <div key={i} className={styles.itemRow}>
                <div className={styles.itemRowHeader}>
                  <span className={styles.itemIndex}>Ценность {i + 1}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => setDraft((d) => ({ ...d, values: d.values.filter((_, idx) => idx !== i) }))}
                  >
                    Удалить
                  </button>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Иконка (эмодзи)</span>
                  <input className={styles.input} value={value.icon} onChange={(e) => setDraft((d) => ({ ...d, values: d.values.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v) }))} />
                </label>
                <BilingualField
                  label="Заголовок"
                  value={value.title}
                  onChange={(v) => setDraft((d) => ({ ...d, values: d.values.map((val, idx) => idx === i ? { ...val, title: v } : val) }))}
                />
                <BilingualField
                  label="Текст"
                  value={value.text}
                  onChange={(v) => setDraft((d) => ({ ...d, values: d.values.map((val, idx) => idx === i ? { ...val, text: v } : val) }))}
                  multiline
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.btnAdd}
            style={{ marginTop: '1rem' }}
            onClick={() => setDraft((d) => ({ ...d, values: [...d.values, { icon: '', title: { ru: '', en: '' }, text: { ru: '', en: '' } }] }))}
          >
            + Добавить ценность
          </button>
        </div>

        {/* Timeline */}
        <div className={styles.subSection}>
          <p className={styles.subTitle}>История компании ({draft.timeline.length})</p>
          <div className={styles.itemList}>
            {draft.timeline.map((item, i) => (
              <div key={i} className={styles.itemRow}>
                <div className={styles.itemRowHeader}>
                  <span className={styles.itemIndex}>Событие {i + 1}</span>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => setDraft((d) => ({ ...d, timeline: d.timeline.filter((_, idx) => idx !== i) }))}
                  >
                    Удалить
                  </button>
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Год</span>
                  <input className={styles.input} value={item.year} onChange={(e) => setDraft((d) => ({ ...d, timeline: d.timeline.map((t, idx) => idx === i ? { ...t, year: e.target.value } : t) }))} />
                </label>
                <BilingualField
                  label="Текст события"
                  value={item.text}
                  onChange={(v) => setDraft((d) => ({ ...d, timeline: d.timeline.map((t, idx) => idx === i ? { ...t, text: v } : t) }))}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.btnAdd}
            style={{ marginTop: '1rem' }}
            onClick={() => setDraft((d) => ({ ...d, timeline: [...d.timeline, { year: '', text: { ru: '', en: '' } }] }))}
          >
            + Добавить событие
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TAB_LABELS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Обзор', icon: '📊' },
  { id: 'services', label: 'Услуги', icon: '🛠️' },
  { id: 'promotions', label: 'Акции', icon: '🏷️' },
  { id: 'home', label: 'Главная', icon: '🏠' },
  { id: 'about', label: 'О компании', icon: '🏢' },
  { id: 'products', label: 'Товары', icon: '🛒' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <nav className={styles.sidebar}>
            <p className={styles.sidebarTitle}>Админ панель</p>
            <ul className={styles.navList}>
              {TAB_LABELS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'services' && <ServicesTab />}
            {activeTab === 'promotions' && <PromotionsTab />}
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'about' && <AboutTab />}
            {activeTab === 'products' && <AdminProductsTab />}
          </main>
        </div>
      </div>
    </section>
  )
}
