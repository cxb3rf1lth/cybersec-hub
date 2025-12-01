/**
 * Real Authentication Service
 * Handles user registration, login, JWT token management
 * No mock/demo tokens - all real authentication
 */

import { db, STORES } from './database'
import { User } from '@/types/user'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
  fullName?: string
}

class AuthService {
  private readonly TOKEN_KEY = 'cyberconnect_auth_tokens'
  private readonly USER_KEY = 'cyberconnect_current_user'
  private readonly JWT_SECRET = 'cyberconnect_jwt_secret_' + window.location.origin

  // Real password hashing using Web Crypto API
  private async hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string, salt: string }> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    // Generate or use existing salt
    const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16))

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: actualSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    )

    // Convert to base64
    const hashArray = Array.from(new Uint8Array(derivedBits))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const saltArray = Array.from(actualSalt)
    const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return {
      hash: hashHex,
      salt: saltHex
    }
  }

  private async verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
    // Convert hex salt back to Uint8Array
    const saltArray = storedSalt.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    const salt = new Uint8Array(saltArray)

    const { hash } = await this.hashPassword(password, salt)
    return hash === storedHash
  }

  // Generate real JWT token
  private async generateJWT(payload: any, expiresIn: number = 3600): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const claims = {
      ...payload,
      iat: now,
      exp: now + expiresIn
    }

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(claims))

    // Create signature
    const message = `${encodedHeader}.${encodedPayload}`
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const keyData = encoder.encode(this.JWT_SECRET)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, data)
    const signatureArray = Array.from(new Uint8Array(signature))
    const encodedSignature = btoa(String.fromCharCode(...signatureArray))

    return `${message}.${encodedSignature}`
  }

  // Verify JWT token
  private async verifyJWT(token: string): Promise<any | null> {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null

      const [encodedHeader, encodedPayload, encodedSignature] = parts
      const message = `${encodedHeader}.${encodedPayload}`

      // Verify signature
      const encoder = new TextEncoder()
      const data = encoder.encode(message)
      const keyData = encoder.encode(this.JWT_SECRET)

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )

      const signatureArray = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0))
      const isValid = await crypto.subtle.verify('HMAC', key, signatureArray, data)

      if (!isValid) return null

      // Decode payload
      const payload = JSON.parse(atob(encodedPayload))

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) return null

      return payload
    } catch (error) {
      console.error('JWT verification failed:', error)
      return null
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<{ success: boolean, user?: User, error?: string }> {
    try {
      // Check if email already exists
      const existingEmail = await db.getUserByEmail(data.email)
      if (existingEmail) {
        return { success: false, error: 'Email already registered' }
      }

      // Check if username already exists
      const existingUsername = await db.getUserByUsername(data.username)
      if (existingUsername) {
        return { success: false, error: 'Username already taken' }
      }

      // Hash password
      const { hash, salt } = await this.hashPassword(data.password)

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        email: data.email,
        username: data.username,
        name: data.fullName || data.username,
        bio: '',
        location: '',
        specializations: [],
        reputation: 0,
        following: [],
        followers: [],
        joinedAt: new Date(),
        passwordHash: hash,
        passwordSalt: salt,
        isOnline: true,
        lastSeen: new Date()
      }

      // Save to database
      await db.add(STORES.USERS, user)

      // Don't include password hash/salt in returned user
      const { passwordHash, passwordSalt, ...safeUser } = user

      return { success: true, user: safeUser as User }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean, tokens?: AuthTokens, user?: User, error?: string }> {
    try {
      // Get user by email
      const user = await db.getUserByEmail(credentials.email)

      if (!user || !user.passwordHash || !user.passwordSalt) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password
      const isValid = await this.verifyPassword(credentials.password, user.passwordHash, user.passwordSalt)

      if (!isValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Generate tokens
      const accessToken = await this.generateJWT({ userId: user.id, email: user.email }, 3600) // 1 hour
      const refreshToken = await this.generateJWT({ userId: user.id, type: 'refresh' }, 86400 * 7) // 7 days

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + 3600 * 1000
      }

      // Store tokens
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens))

      // Update user status
      user.isOnline = true
      user.lastSeen = new Date()
      await db.update(STORES.USERS, user)

      // Store current user (without password data)
      const { passwordHash, passwordSalt, ...safeUser } = user
      localStorage.setItem(this.USER_KEY, JSON.stringify(safeUser))

      return { success: true, tokens, user: safeUser as User }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // Get current auth token
  async getAuthToken(): Promise<string | null> {
    const tokensJson = localStorage.getItem(this.TOKEN_KEY)
    if (!tokensJson) return null

    try {
      const tokens: AuthTokens = JSON.parse(tokensJson)

      // Check if access token is expired
      if (Date.now() >= tokens.expiresAt) {
        // Try to refresh
        const refreshed = await this.refreshToken(tokens.refreshToken)
        if (refreshed) {
          return refreshed.accessToken
        }
        return null
      }

      return tokens.accessToken
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const payload = await this.verifyJWT(refreshToken)
      if (!payload || payload.type !== 'refresh') return null

      // Generate new tokens
      const user = await db.get<User>(STORES.USERS, payload.userId)
      if (!user) return null

      const newAccessToken = await this.generateJWT({ userId: user.id, email: user.email }, 3600)
      const newRefreshToken = await this.generateJWT({ userId: user.id, type: 'refresh' }, 86400 * 7)

      const tokens: AuthTokens = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: Date.now() + 3600 * 1000
      }

      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens))

      return tokens
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      return null
    }
  }

  // Logout
  async logout(): Promise<void> {
    const user = this.getCurrentUser()
    if (user) {
      // Update user status
      const fullUser = await db.get<User>(STORES.USERS, user.id)
      if (fullUser) {
        fullUser.isOnline = false
        fullUser.lastSeen = new Date()
        await db.update(STORES.USERS, fullUser)
      }
    }

    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    if (!token) return false

    const payload = await this.verifyJWT(token)
    return payload !== null
  }
}

export const authService = new AuthService()
export default AuthService
