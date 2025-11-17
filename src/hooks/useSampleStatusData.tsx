import { useState } from 'react'

export function useRealStatusData() {
  const [userStatus, setUserStatus] = useState<any>(null)
  return { userStatus, setUserStatus, isLoading: false }
}

export { useRealStatusData as useSampleStatusData }
export default useRealStatusData
