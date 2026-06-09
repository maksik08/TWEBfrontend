import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  previewWarehouseSync,
  syncWarehouse,
  type WarehouseSyncResult,
} from '@/entities/warehouse/api/warehouse.api'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const AdminWarehouseTab = () => {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<WarehouseSyncResult | null>(null)

  const previewMutation = useMutation({
    mutationFn: previewWarehouseSync,
    onSuccess: (data) => {
      setResult(data)
      toast.success('Предпросмотр готов')
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось получить остатки склада')),
  })

  const syncMutation = useMutation({
    mutationFn: syncWarehouse,
    onSuccess: async (data) => {
      setResult(data)
      toast.success(`Синхронизировано: обновлено ${data.updated}`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось синхронизировать склад')),
  })

  const busy = previewMutation.isPending || syncMutation.isPending

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Складской учёт</h2>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => previewMutation.mutate()}
              disabled={busy}
            >
              Предпросмотр
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => syncMutation.mutate()}
              disabled={busy}
            >
              Синхронизировать остатки
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
          Остатки подтягиваются из внешней складской системы по SKU. «Предпросмотр» показывает изменения
          без применения, «Синхронизировать» — записывает их в каталог.
        </p>

        {!result ? (
          <p style={{ marginTop: '1rem' }}>Запустите предпросмотр или синхронизацию.</p>
        ) : (
          <>
            <div className={styles.fieldGrid} style={{ marginTop: '1rem' }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Режим</span>
                <div style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                  {result.applied ? 'Применено' : 'Предпросмотр (без записи)'}
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Всего товаров</span>
                <div style={{ padding: '0.5rem 0' }}>{result.totalProducts}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Изменено</span>
                <div style={{ padding: '0.5rem 0', fontWeight: 700 }}>{result.updated}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Без изменений</span>
                <div style={{ padding: '0.5rem 0' }}>{result.unchanged}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Нет на складе</span>
                <div style={{ padding: '0.5rem 0' }}>{result.notInWarehouse}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Без SKU</span>
                <div style={{ padding: '0.5rem 0' }}>{result.withoutSku}</div>
              </div>
            </div>

            <div className={styles.subSection}>
              <p className={styles.subTitle}>Изменения остатков</p>
              {result.changes.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Расхождений нет</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--color-text-muted, #6b7280)' }}>
                        <th style={{ padding: '0.5rem' }}>SKU</th>
                        <th style={{ padding: '0.5rem' }}>Товар</th>
                        <th style={{ padding: '0.5rem' }}>Было</th>
                        <th style={{ padding: '0.5rem' }}>Стало</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.changes.map((line) => (
                        <tr key={line.productId} style={{ borderTop: '1px solid var(--color-border, #e5e7eb)' }}>
                          <td style={{ padding: '0.5rem' }}>{line.sku}</td>
                          <td style={{ padding: '0.5rem' }}>{line.productName}</td>
                          <td style={{ padding: '0.5rem' }}>{line.previousQuantity}</td>
                          <td style={{ padding: '0.5rem', fontWeight: 700 }}>{line.newQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
