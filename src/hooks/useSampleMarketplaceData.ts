import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'

export function useRealMarketplaceData() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMarketplaceData()
  }, [])

  async function loadMarketplaceData() {
    setIsLoading(true)
    try {
      const dbListings = await db.getAll(STORES.MARKETPLACE)
      setListings(dbListings)
    } catch (error) {
      console.error('Failed to load marketplace data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { listings, proposals: [], reviews: [], isLoading, refreshMarketplace: loadMarketplaceData }
}

export { useRealMarketplaceData as useSampleMarketplaceData }
export default useRealMarketplaceData
