import { useState } from 'react'

// No sample threat sources - users should configure their own
export function useRealThreatSources() {
  const [sources, setSources] = useState<any[]>([])
  return { sources, setSources, testSource: async () => ({}), fetchFromSource: async () => ([]) }
}

export { useRealThreatSources as useSampleThreatSources }
export default useRealThreatSources
