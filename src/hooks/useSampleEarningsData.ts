import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'
import { Earning, EarningsGoal } from '@/types/earnings'

/**
 * Real Earnings Data Hook - No Sample Data
 * Returns earnings from database only
 */
export function useRealEarningsData() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [goals, setGoals] = useState<EarningsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEarningsData()
  }, [])

  async function loadEarningsData() {
    setIsLoading(true)
    try {
      const [dbEarnings, dbGoals] = await Promise.all([
        db.getAll<Earning>(STORES.EARNINGS),
        db.getAll<EarningsGoal>(STORES.GOALS)
      ])
      setEarnings(dbEarnings)
      setGoals(dbGoals)
    } catch (error) {
      console.error('Failed to load earnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    earnings,
    goals,
    isLoading,
    refreshEarnings: loadEarningsData
  }
}

// Export for backwards compatibility
export { useRealEarningsData as useSampleEarningsData }
export default useRealEarningsData
