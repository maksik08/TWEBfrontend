import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserDto } from '@/shared/api/dto/user.dto'
import { fetchUsers, setUserBlocked } from '@/entities/user/api/user.api'
import { useSessionStore } from '@/entities/session/model/session.store'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const isAdminRole = (role: string) => role.toLowerCase() === 'admin'

export const AdminUsersTab = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const currentUser = useSessionStore((s) => s.user)

  const { data: users = [], isLoading, isError, error } = useQuery<UserDto[]>({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
  })

  const blockMutation = useMutation({
    mutationFn: (vars: { id: number | string; isBlocked: boolean }) =>
      setUserBlocked(vars.id, vars.isBlocked),
    onSuccess: async (_data, vars) => {
      toast.success(vars.isBlocked ? 'Аккаунт заблокирован' : 'Аккаунт разблокирован')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось изменить статус аккаунта')),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const text = `${u.username ?? ''} ${u.email} ${u.role} ${u.id}`.toLowerCase()
      return text.includes(q)
    })
  }, [users, query])

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Пользователи</h2>
          </div>
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Пользователи</h2>
          </div>
          <p>{extractMessage(error, 'Не удалось загрузить пользователей')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Пользователи</h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя / email / роль / id"
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Найдено</span>
            <div style={{ padding: '0.5rem 0' }}>{filtered.length}</div>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Список</p>
          <div className={styles.itemList}>
            {filtered.map((user) => {
              const isSelf = currentUser != null && String(currentUser.id) === String(user.id)
              const isAdmin = isAdminRole(user.role)
              const blocked = Boolean(user.isBlocked)
              const cannotBlock = isSelf || isAdmin
              const pending =
                blockMutation.isPending && blockMutation.variables?.id === user.id

              return (
                <div key={String(user.id)} className={styles.itemRow}>
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>ID: {user.id}</span>
                    <button
                      type="button"
                      className={blocked ? styles.btnPrimary : styles.btnDanger}
                      onClick={() =>
                        blockMutation.mutate({ id: user.id, isBlocked: !blocked })
                      }
                      disabled={cannotBlock || pending}
                      title={
                        isSelf
                          ? 'Нельзя заблокировать свой аккаунт'
                          : isAdmin
                            ? 'Администратора нельзя заблокировать'
                            : undefined
                      }
                    >
                      {pending ? '…' : blocked ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {user.username || '(без имени)'}
                        {isSelf && (
                          <span style={{ color: 'var(--color-text-muted, #6b7280)', fontWeight: 400 }}>
                            {' '}· вы
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                        {user.email} · роль: {user.role}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.625rem',
                        borderRadius: 999,
                        color: blocked ? '#b91c1c' : '#15803d',
                        background: blocked ? '#fee2e2' : '#dcfce7',
                      }}
                    >
                      {blocked ? 'Заблокирован' : 'Активен'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
