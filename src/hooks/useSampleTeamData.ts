import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'
import { Team } from '@/types/team'

export function useRealTeamData() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeamData()
  }, [])

  async function loadTeamData() {
    setIsLoading(true)
    try {
      const dbTeams = await db.getAll<Team>(STORES.TEAMS)
      setTeams(dbTeams)
    } catch (error) {
      console.error('Failed to load teams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { teams, teamRoles: [], teamPermissions: [], isLoading, refreshTeams: loadTeamData }
}

export { useRealTeamData as useSampleTeamData }
export default useRealTeamData
