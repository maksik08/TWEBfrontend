import type { Product, ProductAvailability, ProductCategory, ProductSpecification } from './types'

type ProductDetailContent = Pick<
  Product,
  | 'brand'
  | 'sku'
  | 'shortDescription'
  | 'description'
  | 'availability'
  | 'technology'
  | 'keyFeatures'
  | 'specifications'
  | 'packageContents'
  | 'warranty'
>

const categoryTechnologies: Record<string, string[]> = {
  router: ['Wi-Fi 6', 'MU-MIMO', 'Beamforming'],
  switch: ['Gigabit Ethernet', 'Auto MDI/MDIX', 'QoS'],
  antenna: ['MIMO', 'Всепогодное исполнение', 'Наружный монтаж'],
  cable: ['Cat6', 'Гигабитная передача', 'PoE Ready'],
  nas: ['RAID', 'Сетевое хранилище', 'Резервное копирование'],
  server: ['Rackmount', 'Кабель-менеджмент', 'Пассивная вентиляция'],
}

const categoryFeatures: Record<string, string[]> = {
  router: [
    'Стабильная работа нескольких устройств одновременно',
    'Защита сети для дома и офиса',
    'Подходит для стриминга, игр и видеозвонков',
  ],
  switch: [
    'Быстрое подключение без сложной настройки',
    'Подходит для офисных и домашних сетей',
    'Минимальные задержки внутри локальной сети',
  ],
  antenna: [
    'Усиление сигнала на сложных участках',
    'Подходит для установки на улице',
    'Стабильная работа в точках с нестабильным покрытием',
  ],
  cable: [
    'Подходит для стационарной и скрытой прокладки',
    'Надежное соединение для сетевого оборудования',
    'Совместим с PoE-устройствами',
  ],
  nas: [
    'Централизованное хранение файлов и резервных копий',
    'Доступ к данным с нескольких устройств',
    'Подходит для домашнего офиса и небольшой команды',
  ],
  server: [
    'Удобная интеграция в стойку',
    'Подходит для серверных и технических помещений',
    'Упрощает обслуживание инфраструктуры',
  ],
}

const categoryPackages: Record<string, string[]> = {
  router: ['Устройство', 'Блок питания', 'Ethernet-кабель', 'Документация'],
  switch: ['Коммутатор', 'Кабель питания', 'Комплект крепления', 'Инструкция'],
  antenna: ['Антенна', 'Монтажный комплект', 'Крепеж', 'Краткое руководство'],
  cable: ['Кабель', 'Защитная упаковка'],
  nas: ['NAS-устройство', 'Блок питания', 'Сетевой кабель', 'Документация'],
  server: ['Устройство', 'Крепежный комплект', 'Документация'],
}

const defaultSpecsByCategory: Record<string, ProductSpecification[]> = {
  router: [
    { label: 'Порты', value: '1 x WAN, 4 x LAN' },
    { label: 'Стандарт Wi-Fi', value: '802.11ax / Wi-Fi 6' },
    { label: 'Безопасность', value: 'WPA3, гостевая сеть, родительский контроль' },
  ],
  switch: [
    { label: 'Порты', value: '8 x Gigabit RJ45' },
    { label: 'Коммутационная матрица', value: '16 Гбит/с' },
    { label: 'Установка', value: 'Настольная или в стойку' },
  ],
  antenna: [
    { label: 'Диапазон', value: '2.4 / 5 ГГц' },
    { label: 'Усиление', value: '9-12 dBi' },
    { label: 'Монтаж', value: 'Стена или мачта' },
  ],
  cable: [
    { label: 'Категория', value: 'Cat6' },
    { label: 'Скорость', value: 'До 1 Гбит/с, до 10 Гбит/с на коротких дистанциях' },
    { label: 'Совместимость', value: 'PoE / роутеры / коммутаторы / NAS' },
  ],
  nas: [
    { label: 'Сетевые порты', value: '2 x 1GbE' },
    { label: 'Поддержка RAID', value: 'RAID 0/1/JBOD' },
    { label: 'Доступ', value: 'Веб-интерфейс, SMB, резервное копирование' },
  ],
  server: [
    { label: 'Форм-фактор', value: 'Rackmount' },
    { label: 'Материал', value: 'Сталь с порошковым покрытием' },
    { label: 'Назначение', value: 'Серверная стойка / инфраструктурный шкаф' },
  ],
}

const defaultAvailabilityByCategory: Record<string, ProductAvailability> = {
  router: 'in-stock',
  switch: 'in-stock',
  antenna: 'limited',
  cable: 'in-stock',
  nas: 'limited',
  server: 'preorder',
}

const productDetailsById: Record<number, ProductDetailContent> = {
  1: {
    brand: 'NetInstall Pro',
    sku: 'RTR-AX3000-01',
    shortDescription:
      'Двухдиапазонный роутер Wi-Fi 6 для квартиры, дома или небольшого офиса с хорошим запасом скорости.',
    description:
      'Wi-Fi Router AX3000 рассчитан на стабильную работу под высокой нагрузкой: онлайн-игры, 4K-стриминг, видеозвонки и одновременное подключение большого количества устройств. Устройство поддерживает современные механизмы распределения трафика и позволяет быстро организовать домашнюю или офисную сеть без сложной настройки.',
    availability: 'in-stock',
    technology: ['Wi-Fi 6', 'OFDMA', 'MU-MIMO', 'Beamforming', 'WPA3'],
    keyFeatures: [
      '1 гигабитный WAN и 4 гигабитных LAN-порта',
      'До 3000 Мбит/с суммарной беспроводной скорости',
      'Удобная настройка через веб-интерфейс и мобильное приложение',
    ],
    specifications: [
      { label: 'Порты', value: '1 x Gigabit WAN, 4 x Gigabit LAN' },
      { label: 'Скорость Wi-Fi', value: 'До 2402 + 574 Мбит/с' },
      { label: 'Антенны', value: '4 внешние антенны с усилением' },
      { label: 'Процессор', value: 'Двухъядерный 1.3 ГГц' },
      { label: 'Покрытие', value: 'До 140 м²' },
    ],
    packageContents: ['Роутер', 'Блок питания', 'Patch cord Cat5e', 'Инструкция'],
    warranty: '36 месяцев',
  },
  2: {
    brand: 'SwitchCore',
    sku: 'SWT-8G-02',
    shortDescription:
      'Гигабитный 8-портовый коммутатор для расширения локальной сети без сложной конфигурации.',
    description:
      'Network Switch 8 Port подойдёт для рабочего места, кассовой зоны, небольшого офиса или домашней лаборатории. Коммутатор обеспечивает стабильную передачу данных между компьютерами, точками доступа, IP-камерами и сетевыми хранилищами.',
    availability: 'in-stock',
    technology: ['Gigabit Ethernet', 'Auto Negotiation', 'Auto MDI/MDIX', 'QoS'],
    keyFeatures: [
      '8 полноценных гигабитных портов',
      'Plug-and-play без дополнительного ПО',
      'Энергоэффективная работа и низкий нагрев',
    ],
    specifications: [
      { label: 'Порты', value: '8 x 10/100/1000 Mbps RJ45' },
      { label: 'Коммутационная матрица', value: '16 Гбит/с' },
      { label: 'Таблица MAC-адресов', value: '4K записей' },
      { label: 'Буфер пакетов', value: '1.5 МБ' },
      { label: 'Монтаж', value: 'Настольный' },
    ],
    packageContents: ['Коммутатор', 'Адаптер питания', 'Резиновые ножки', 'Документация'],
    warranty: '24 месяца',
  },
  3: {
    brand: 'AirLink',
    sku: 'ANT-ODR-03',
    shortDescription:
      'Наружная антенна для усиления сигнала на объектах с нестабильным покрытием и длинными радиолиниями.',
    description:
      'Outdoor Antenna предназначена для монтажа на фасаде, мачте или выносной опоре. Она помогает уверенно держать соединение в частных домах, на складах, производственных площадках и удалённых объектах, где обычной комнатной антенны недостаточно.',
    availability: 'limited',
    technology: ['MIMO', 'Всепогодный корпус', 'Наружный монтаж', 'Защита IP65'],
    keyFeatures: [
      'Усиление сигнала для сложных зон покрытия',
      'Устойчивость к дождю, ветру и пыли',
      'Подходит для Wi-Fi и LTE-сценариев в зависимости от конфигурации',
    ],
    specifications: [
      { label: 'Частотный диапазон', value: '2.4 / 5 ГГц' },
      { label: 'Коэффициент усиления', value: '12 dBi' },
      { label: 'Разъём', value: 'N-type' },
      { label: 'Монтаж', value: 'Стена / мачта' },
      { label: 'Класс защиты', value: 'IP65' },
    ],
    packageContents: ['Антенна', 'Кронштейн', 'Хомуты для мачты', 'Инструкция'],
    warranty: '24 месяца',
  },
  4: {
    brand: 'CableWorks',
    sku: 'CBL-CAT6-04',
    shortDescription:
      'Надёжный сетевой кабель Cat6 для подключения ПК, роутеров, коммутаторов, NAS и IP-оборудования.',
    description:
      'Ethernet Cable Cat6 подходит для повседневной эксплуатации дома и в офисе. Кабель обеспечивает стабильную передачу данных, хорошо держит геометрию пары и подходит для систем, где важны скорость, минимальные потери и корректная работа PoE.',
    availability: 'in-stock',
    technology: ['Cat6', 'UTP', 'PoE Ready', '250 MHz'],
    keyFeatures: [
      'Подходит для гигабитных сетей',
      'Совместим с роутерами, NAS и сетевыми камерами',
      'Гибкая оболочка для удобной укладки',
    ],
    specifications: [
      { label: 'Тип', value: 'Patch cord Cat6 UTP' },
      { label: 'Длина', value: '10 м' },
      { label: 'Пропускная способность', value: 'До 250 МГц' },
      { label: 'Коннекторы', value: '2 x RJ-45' },
      { label: 'Совместимость', value: 'PoE / роутеры / свитчи / NAS' },
    ],
    packageContents: ['Кабель Cat6'],
    warranty: '12 месяцев',
  },
  5: {
    brand: 'DataKeep',
    sku: 'NAS-4TB-05',
    shortDescription:
      'Компактное сетевое хранилище для резервного копирования, домашних медиаархивов и общего доступа к файлам.',
    description:
      'NAS Storage 4TB даёт удобную точку хранения для документов, фотоархива, проектов и резервных копий. Устройство рассчитано на круглосуточную работу, поддерживает сетевой доступ для нескольких пользователей и упрощает организацию безопасного хранения данных.',
    availability: 'limited',
    technology: ['RAID', 'SMB', 'Snapshot', 'Мобильный доступ'],
    keyFeatures: [
      'Готовое сетевое хранилище для дома и малого офиса',
      'Удобная работа с резервными копиями и медиаконтентом',
      'Поддержка нескольких сценариев доступа к данным',
    ],
    specifications: [
      { label: 'Объём', value: '4 ТБ' },
      { label: 'Отсеки', value: '2-bay' },
      { label: 'Сетевые порты', value: '2 x Gigabit LAN' },
      { label: 'Интерфейсы', value: '2 x USB 3.2' },
      { label: 'Поддержка RAID', value: 'RAID 0 / 1 / JBOD' },
    ],
    packageContents: ['NAS-устройство', 'Блок питания', 'LAN-кабель', 'Документация'],
    warranty: '36 месяцев',
  },
  6: {
    brand: 'RackPro',
    sku: 'SRV-RACK-06',
    shortDescription:
      'Стойковый модуль для размещения и организации серверного оборудования в инфраструктурной стойке.',
    description:
      'Server Rack Unit предназначен для аккуратной и безопасной установки инфраструктурных компонентов. Подходит для серверных шкафов, технических помещений и проектов, где важны порядок кабелей, удобство обслуживания и устойчивость конструкции.',
    availability: 'preorder',
    technology: ['Rackmount', 'Кабель-менеджмент', 'Порошковое покрытие'],
    keyFeatures: [
      'Оптимален для серверной инфраструктуры и сетевых узлов',
      'Удобный доступ для обслуживания оборудования',
      'Надёжная металлическая конструкция',
    ],
    specifications: [
      { label: 'Форм-фактор', value: '1U' },
      { label: 'Глубина', value: '600 мм' },
      { label: 'Максимальная нагрузка', value: '60 кг' },
      { label: 'Материал', value: 'Сталь 1.2 мм' },
      { label: 'Охлаждение', value: 'Пассивная вентиляция' },
    ],
    packageContents: ['Стойковый модуль', 'Крепёжный комплект', 'Инструкция'],
    warranty: '24 месяца',
  },
  7: {
    brand: 'NetInstall Pro',
    sku: 'RTR-AX6000-07',
    shortDescription:
      'Флагманский роутер Wi-Fi 6 для высоких нагрузок, больших квартир и активного стриминга.',
    description:
      'Wi-Fi Router AX6000 ориентирован на пользователей, которым нужна высокая скорость, широкий радиус покрытия и запас производительности под десятки устройств. Подходит для гейминга, 4K/8K-контента, NAS и интенсивного сетевого трафика.',
    availability: 'in-stock',
    technology: ['Wi-Fi 6', 'MU-MIMO 8x8', 'OFDMA', 'Beamforming', 'Link Aggregation'],
    keyFeatures: [
      'Высокая производительность для требовательных сценариев',
      'Поддержка 2.5G uplink для быстрого интернет-канала',
      'Большое покрытие и стабильный сигнал по всей квартире или офису',
    ],
    specifications: [
      { label: 'Порты', value: '1 x 2.5G WAN, 4 x Gigabit LAN' },
      { label: 'Скорость Wi-Fi', value: 'До 4804 + 1148 Мбит/с' },
      { label: 'Антенны', value: '8 внешних антенн' },
      { label: 'Оперативная память', value: '512 МБ' },
      { label: 'Поддержка Mesh', value: 'Да' },
    ],
    packageContents: ['Роутер', 'Блок питания', 'LAN-кабель', 'Руководство'],
    warranty: '36 месяцев',
  },
  8: {
    brand: 'MeshFlow',
    sku: 'MSH-2PK-08',
    shortDescription:
      'Mesh-система из двух модулей для бесшовного покрытия большого дома без мёртвых зон.',
    description:
      'Mesh Wi-Fi System (2-Pack) помогает равномерно покрыть сигналом несколько комнат, этажей или небольшой офис. Система автоматически переключает устройства между узлами и обеспечивает более стабильный роуминг по сравнению с одиночным роутером.',
    availability: 'in-stock',
    technology: ['Mesh Wi-Fi', '802.11k/v/r', 'Seamless Roaming', 'WPA3'],
    keyFeatures: [
      'Два узла в комплекте для расширенного покрытия',
      'Бесшовное переключение между точками доступа',
      'Подходит для многокомнатных квартир и частных домов',
    ],
    specifications: [
      { label: 'Комплект', value: '2 узла' },
      { label: 'Покрытие', value: 'До 450 м²' },
      { label: 'Порты на узел', value: '3 x Gigabit Ethernet' },
      { label: 'Скорость Wi-Fi', value: 'До 3000 Мбит/с' },
      { label: 'Управление', value: 'Веб-интерфейс / мобильное приложение' },
    ],
    packageContents: ['2 mesh-узла', '2 блока питания', 'LAN-кабель', 'Документация'],
    warranty: '24 месяца',
  },
  9: {
    brand: 'GoNet',
    sku: 'TRV-AC1200-09',
    shortDescription:
      'Компактный travel-роутер для поездок, гостиниц, командировок и мобильных рабочих мест.',
    description:
      'Travel Router AC1200 легко взять с собой в дорогу и быстро развернуть защищённую личную сеть в гостинице, коворкинге или на временном объекте. Поддерживает несколько режимов работы и помогает безопасно подключать ноутбук, смартфон и рабочие сервисы.',
    availability: 'in-stock',
    technology: ['Dual Band Wi-Fi', 'Repeater Mode', 'VPN Client', 'USB-C Power'],
    keyFeatures: [
      'Компактный корпус для поездок и командировок',
      'Быстрое подключение к публичным сетям',
      'Поддержка повторителя и клиентского VPN',
    ],
    specifications: [
      { label: 'Порты', value: '1 x WAN/LAN, 1 x LAN' },
      { label: 'Скорость Wi-Fi', value: 'До 867 + 300 Мбит/с' },
      { label: 'Питание', value: 'USB-C, 5V / 3A' },
      { label: 'Режимы', value: 'Router / Repeater / Access Point' },
      { label: 'Вес', value: 'Менее 250 г' },
    ],
    packageContents: ['Travel-роутер', 'USB-C кабель', 'Краткая инструкция'],
    warranty: '24 месяца',
  },
  10: {
    brand: 'SecureEdge',
    sku: 'VPN-GIG-10',
    shortDescription:
      'Маршрутизатор с упором на защищённые VPN-подключения, удалённый доступ и разделение сетей.',
    description:
      'VPN Router Gigabit рассчитан на небольшие офисы, кассовые зоны, удалённые рабочие места и пользователей, которым нужна безопасная передача данных. Поддерживает популярные VPN-протоколы и помогает изолировать трафик между рабочими сегментами сети.',
    availability: 'limited',
    technology: ['WireGuard', 'OpenVPN', 'VLAN', 'Firewall', 'Multi-WAN'],
    keyFeatures: [
      'Стабильная работа VPN-туннелей для удалённого доступа',
      'Разделение локальных сегментов и гостевого трафика',
      'Подходит для малого бизнеса и защищённого домашнего офиса',
    ],
    specifications: [
      { label: 'Порты', value: '1 x WAN, 4 x Gigabit LAN' },
      { label: 'VPN-протоколы', value: 'OpenVPN / WireGuard / IPSec passthrough' },
      { label: 'Пропускная способность VPN', value: 'До 350 Мбит/с' },
      { label: 'Управление', value: 'Web UI / CLI' },
      { label: 'Безопасность', value: 'Firewall, ACL, VLAN' },
    ],
    packageContents: ['VPN-роутер', 'Блок питания', 'LAN-кабель', 'Документация'],
    warranty: '36 месяцев',
  },
}

const buildDefaultSku = (product: Product) =>
  `NT-${product.category.toUpperCase()}-${String(product.id).padStart(4, '0')}`

const buildDefaultDescription = (product: Product) =>
  `${product.title} подходит для сетевых инсталляций, где важны стабильность, удобство эксплуатации и понятные технические характеристики.`

const buildDefaultShortDescription = (product: Product) =>
  `${product.title} для задач категории "${product.category}".`

export const enrichProduct = (product: Product): Product => {
  const specific = productDetailsById[product.id] ?? {}
  const category = product.category as ProductCategory

  return {
    ...product,
    brand: specific.brand ?? 'NetInstall',
    sku: specific.sku ?? buildDefaultSku(product),
    shortDescription: specific.shortDescription ?? buildDefaultShortDescription(product),
    description: specific.description ?? buildDefaultDescription(product),
    availability: specific.availability ?? defaultAvailabilityByCategory[category] ?? 'in-stock',
    technology: specific.technology ?? categoryTechnologies[category] ?? [],
    keyFeatures: specific.keyFeatures ?? categoryFeatures[category] ?? [],
    specifications: specific.specifications ?? defaultSpecsByCategory[category] ?? [],
    packageContents: specific.packageContents ?? categoryPackages[category] ?? ['Устройство'],
    warranty: specific.warranty ?? '12 месяцев',
  }
}
