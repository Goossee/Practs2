import { createContext, useContext, useState, useCallback } from 'react'
import { storage } from '../utils/storage'
import { generateId, hashPassword, avatarUrl } from '../utils/helpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = storage.getCurrentUser()
    if (!saved) return null
    // Re-fetch fresh copy from users list so subscriptions are up-to-date
    const fresh = storage.getUsers().find((u) => u.id === saved.id)
    return fresh ?? saved
  })

  const syncUser = (userId) => {
    const fresh = storage.getUsers().find((u) => u.id === userId)
    if (fresh) {
      storage.setCurrentUser(fresh)
      setCurrentUser(fresh)
      return fresh
    }
    return null
  }

  const register = useCallback((username, email, password) => {
    const users = storage.getUsers()
    if (users.find((u) => u.email === email))
      throw new Error('Пользователь с таким email уже существует')
    if (users.find((u) => u.username === username))
      throw new Error('Это имя пользователя уже занято')

    const newUser = {
      id: generateId(),
      username,
      email,
      password: hashPassword(password),
      bio: '',
      avatar: avatarUrl(username),
      subscriptions: [],
      createdAt: new Date().toISOString(),
    }
    storage.setUsers([...users, newUser])
    storage.setCurrentUser(newUser)
    setCurrentUser(newUser)
    return newUser
  }, [])

  const login = useCallback((email, password) => {
    const users = storage.getUsers()
    const user = users.find(
      (u) => u.email === email && u.password === hashPassword(password),
    )
    if (!user) throw new Error('Неверный email или пароль')
    storage.setCurrentUser(user)
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    storage.clearCurrentUser()
    setCurrentUser(null)
  }, [])

  const updateProfile = useCallback(
    (updates) => {
      const users = storage.getUsers()
      const updated = users.map((u) =>
        u.id === currentUser.id ? { ...u, ...updates } : u,
      )
      storage.setUsers(updated)
      syncUser(currentUser.id)
    },
    [currentUser],
  )

  const toggleSubscription = useCallback(
    (targetUserId) => {
      if (!currentUser) return
      const users = storage.getUsers()
      const updated = users.map((u) => {
        if (u.id !== currentUser.id) return u
        const subs = u.subscriptions ?? []
        return {
          ...u,
          subscriptions: subs.includes(targetUserId)
            ? subs.filter((id) => id !== targetUserId)
            : [...subs, targetUserId],
        }
      })
      storage.setUsers(updated)
      syncUser(currentUser.id)
    },
    [currentUser],
  )

  const getUserById = useCallback(
    (id) => storage.getUsers().find((u) => u.id === id) ?? null,
    [],
  )

  const getAllUsers = useCallback(() => storage.getUsers(), [])

  const refreshCurrentUser = useCallback(() => {
    if (currentUser) syncUser(currentUser.id)
  }, [currentUser])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        register,
        login,
        logout,
        updateProfile,
        toggleSubscription,
        getUserById,
        getAllUsers,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
