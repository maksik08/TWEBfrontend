import { FaStar } from 'react-icons/fa'
import styles from './star-rating.module.css'

type StarRatingSize = 'sm' | 'md' | 'lg'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: StarRatingSize
  showValue?: boolean
}

const TOTAL_STARS = 5

const clampValue = (value: number) => Math.max(0, Math.min(TOTAL_STARS, value))

export const StarRating = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) => {
  const safeValue = clampValue(value)

  return (
    <div className={`${styles.rating} ${styles[size]}`}>
      <div className={styles.stars} aria-label={`Рейтинг ${safeValue} из 5`}>
        {Array.from({ length: TOTAL_STARS }, (_, index) => {
          const starValue = index + 1
          const isActive = safeValue >= starValue

          if (readOnly) {
            return (
              <span
                key={starValue}
                className={`${styles.starDisplay} ${isActive ? styles.active : ''}`}
                aria-hidden="true"
              >
                <FaStar />
              </span>
            )
          }

          return (
            <button
              key={starValue}
              type="button"
              className={`${styles.starButton} ${isActive ? styles.active : ''}`}
              onClick={() => onChange?.(starValue)}
              aria-label={`Поставить ${starValue} из 5`}
              title={`${starValue} из 5`}
            >
              <FaStar />
            </button>
          )
        })}
      </div>

      {!readOnly && (
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => onChange?.(0)}
          title="Сбросить оценку"
        >
          0
        </button>
      )}

      {showValue && <span className={styles.value}>{safeValue.toFixed(1)} / 5</span>}
    </div>
  )
}
