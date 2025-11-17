/**
 * Real Database Service using IndexedDB
 * Replaces all mock/sample data with persistent client-side storage
 */

import { User, UserProfile } from '@/types/user'
import { Template } from '@/types/templates'
import { Project } from '@/types/projects'
import { Team, TeamInvitation, TeamApplication } from '@/types/team'

const DB_NAME = 'CyberConnectDB'
const DB_VERSION = 1

// Store names
const STORES = {
  USERS: 'users',
  PROFILES: 'profiles',
  TEMPLATES: 'templates',
  REPOSITORIES: 'repositories',
  TEAMS: 'teams',
  TEAM_INVITATIONS: 'teamInvitations',
  TEAM_APPLICATIONS: 'teamApplications',
  PROJECTS: 'projects',
  EARNINGS: 'earnings',
  GOALS: 'goals',
  MARKETPLACE: 'marketplace',
  THREAT_FEEDS: 'threatFeeds',
  VULNERABILITY_REPORTS: 'vulnerabilityReports',
  MESSAGES: 'messages',
  POSTS: 'posts',
  VIRTUAL_LABS: 'virtualLabs',
  PARTNER_REQUESTS: 'partnerRequests',
  CODE_SNIPPETS: 'codeSnippets',
  RED_TEAM_OPERATIONS: 'redTeamOperations'
}

class DatabaseService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Database failed to open:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('Database opened successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create all object stores
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' })

            // Create indexes based on store type
            switch (storeName) {
              case STORES.USERS:
                store.createIndex('email', 'email', { unique: true })
                store.createIndex('username', 'username', { unique: true })
                break
              case STORES.POSTS:
                store.createIndex('userId', 'userId', { unique: false })
                store.createIndex('createdAt', 'createdAt', { unique: false })
                break
              case STORES.MESSAGES:
                store.createIndex('conversationId', 'conversationId', { unique: false })
                store.createIndex('timestamp', 'timestamp', { unique: false })
                break
              case STORES.TEAMS:
                store.createIndex('createdBy', 'createdBy', { unique: false })
                break
              case STORES.PROJECTS:
                store.createIndex('teamId', 'teamId', { unique: false })
                store.createIndex('ownerId', 'ownerId', { unique: false })
                break
            }
          }
        })

        console.log('Database schema created')
      }
    })

    return this.initPromise
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<string> {
    const store = await this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(data)
      request.onsuccess = () => resolve(request.result as string)
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async query<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const store = await this.getStore(storeName)
    const index = store.index(indexName)
    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // User-specific operations
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.query<User>(STORES.USERS, 'email', email)
    return users[0] || null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.query<User>(STORES.USERS, 'username', username)
    return users[0] || null
  }

  async getPostsByUser(userId: string): Promise<any[]> {
    return this.query(STORES.POSTS, 'userId', userId)
  }

  async getTeamsByUser(userId: string): Promise<Team[]> {
    const allTeams = await this.getAll<Team>(STORES.TEAMS)
    return allTeams.filter(team =>
      team.members?.some(m => m.id === userId) || team.createdBy === userId
    )
  }

  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    return this.query(STORES.PROJECTS, 'teamId', teamId)
  }

  async getMessagesByConversation(conversationId: string): Promise<any[]> {
    return this.query(STORES.MESSAGES, 'conversationId', conversationId)
  }

  // Batch operations
  async batchAdd<T>(storeName: string, items: T[]): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const transaction = store.transaction
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      items.forEach(item => store.add(item))
    })
  }

  // Database reset (for testing)
  async resetDatabase(): Promise<void> {
    await this.init()
    for (const storeName of Object.values(STORES)) {
      await this.clear(storeName)
    }
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// Export singleton instance
export const db = new DatabaseService()
export { STORES }
export default DatabaseService
