import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'

export function useRealPartnerRequests() {
  const [partnerRequests, setPartnerRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPartnerRequests()
  }, [])

  async function loadPartnerRequests() {
    setIsLoading(true)
    try {
      const requests = await db.getAll(STORES.PARTNER_REQUESTS)
      setPartnerRequests(requests)
    } catch (error) {
      console.error('Failed to load partner requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { partnerRequests, isLoading, refreshPartnerRequests: loadPartnerRequests }
}

export { useRealPartnerRequests as useSamplePartnerRequests }
export default useRealPartnerRequests
