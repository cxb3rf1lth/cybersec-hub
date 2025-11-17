import { useState, useEffect } from 'react'
import { db, STORES } from '@/lib/database'
import { Project } from '@/types/projects'

export function useRealProjectData() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setIsLoading(true)
    try {
      const dbProjects = await db.getAll<Project>(STORES.PROJECTS)
      setProjects(dbProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { projects, isLoading, refreshProjects: loadProjects }
}

export { useRealProjectData as useSampleProjectData }
export default useRealProjectData
