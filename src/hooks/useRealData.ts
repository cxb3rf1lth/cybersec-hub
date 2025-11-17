/**
 * Real Data Hook - Replaces useSampleData
 * Fetches all data from IndexedDB with no mock/sample data
 */

import { useEffect, useState } from 'react'
import { db, STORES } from '@/lib/database'
import { User } from '@/types/user'
import { Template, ToolRepository, TeamInfo, TeamProject } from '@/types/templates'

export function useRealData() {
  const [users, setUsers] = useState<User[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [repositories, setRepositories] = useState<ToolRepository[]>([])
  const [teams, setTeams] = useState<TeamInfo[]>([])
  const [teamProjects, setTeamProjects] = useState<TeamProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    setError(null)

    try {
      // Load all data from database
      const [
        dbUsers,
        dbTemplates,
        dbRepositories,
        dbTeams,
        dbProjects
      ] = await Promise.all([
        db.getAll<User>(STORES.USERS),
        db.getAll<Template>(STORES.TEMPLATES),
        db.getAll<ToolRepository>(STORES.REPOSITORIES),
        db.getAll<TeamInfo>(STORES.TEAMS),
        db.getAll<TeamProject>(STORES.PROJECTS)
      ])

      setUsers(dbUsers)
      setTemplates(dbTemplates)
      setRepositories(dbRepositories)
      setTeams(dbTeams)
      setTeamProjects(dbProjects)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data
  const refreshData = () => {
    loadData()
  }

  // Add new user
  const addUser = async (user: User) => {
    try {
      await db.add(STORES.USERS, user)
      await loadData()
    } catch (err) {
      console.error('Failed to add user:', err)
      throw err
    }
  }

  // Add new template
  const addTemplate = async (template: Template) => {
    try {
      await db.add(STORES.TEMPLATES, template)
      await loadData()
    } catch (err) {
      console.error('Failed to add template:', err)
      throw err
    }
  }

  // Add new repository
  const addRepository = async (repository: ToolRepository) => {
    try {
      await db.add(STORES.REPOSITORIES, repository)
      await loadData()
    } catch (err) {
      console.error('Failed to add repository:', err)
      throw err
    }
  }

  // Add new team
  const addTeam = async (team: TeamInfo) => {
    try {
      await db.add(STORES.TEAMS, team)
      await loadData()
    } catch (err) {
      console.error('Failed to add team:', err)
      throw err
    }
  }

  // Add new team project
  const addTeamProject = async (project: TeamProject) => {
    try {
      await db.add(STORES.PROJECTS, project)
      await loadData()
    } catch (err) {
      console.error('Failed to add team project:', err)
      throw err
    }
  }

  // Update user
  const updateUser = async (user: User) => {
    try {
      await db.update(STORES.USERS, user)
      await loadData()
    } catch (err) {
      console.error('Failed to update user:', err)
      throw err
    }
  }

  return {
    users,
    templates,
    repositories,
    teams,
    teamProjects,
    isLoading,
    error,
    refreshData,
    addUser,
    addTemplate,
    addRepository,
    addTeam,
    addTeamProject,
    updateUser
  }
}

export default useRealData
