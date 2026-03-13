import type { CalculateRequest, CalculateResponse } from './types'

export function calculatePrice(req: CalculateRequest): CalculateResponse {
  const objectBaseMap = {
    flat: 100,
    house: 200,
    small_office: 350,
    medium_office: 600,
  } as const

  const installationTypeMap = {
    wireless: 80,
    fiber: 180,
    copper: 120,
  } as const

  const worksPrice = req.works.length * 50
  const staffCount = Math.max(0, Math.floor(req.staffCount))
  const staffRate = Number.isFinite(req.staffRate) ? Math.max(0, req.staffRate) : 0
  const installationPrice = Number.isFinite(req.installationCost)
    ? Math.max(0, req.installationCost)
    : 0
  const deliveryPrice = Number.isFinite(req.deliveryCost) ? Math.max(0, req.deliveryCost) : 0
  const equipmentPrice = req.selectedEquipment.reduce((sum, item) => {
    const quantity = Math.max(0, Math.floor(item.quantity))
    const unitPrice = Number.isFinite(item.unitPrice) ? Math.max(0, item.unitPrice) : 0
    const installationUnit = Math.max(12, Math.round(unitPrice * 0.08))

    return sum + installationUnit * quantity
  }, 0)
  const objectBase = objectBaseMap[req.objectType] ?? 0
  const installationType = installationTypeMap[req.installationType] ?? 0
  const staffPrice = staffCount * staffRate
  const total =
    objectBase +
    installationType +
    worksPrice +
    equipmentPrice +
    staffPrice +
    installationPrice +
    deliveryPrice

  return {
    total,
    breakdown: {
      objectBase,
      installationType,
      works: worksPrice,
      equipment: equipmentPrice,
      staff: staffPrice,
      installation: installationPrice,
      delivery: deliveryPrice,
    },
  }
}
