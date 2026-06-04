import { createContext, useContext, useState, useEffect } from 'react'
import { DEMO_USERS } from '../data/mockData'

const AuthContext = createContext(null)

const STORAGE_KEY = 'geoedu-user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const user = Object.values(DEMO_USERS).find(
      (u) => u.email === email && u.password === password
    )
    if (!user) throw new Error('Email yoki parol noto\'g\'ri')
    const { password: _pw, ...safeUser } = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
    setCurrentUser(safeUser)
    return safeUser
  }

  const register = async (userData) => {
    const existing = Object.values(DEMO_USERS).find((u) => u.email === userData.email)
    if (existing) throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan')
    const newUser = {
      id: 'user-' + Date.now(),
      ...userData,
      role: userData.role || 'student',
      joinDate: new Date().toISOString().split('T')[0],
      completedTopics: [],
      testResults: [],
      certificates: [],
      avatar: null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setCurrentUser(newUser)
    return newUser
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...currentUser, ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setCurrentUser(updated)
  }

  const completeTopicDemo = (topicId) => {
    if (!currentUser) return
    const completedTopics = currentUser.completedTopics || []
    if (!completedTopics.includes(topicId)) {
      updateUser({ completedTopics: [...completedTopics, topicId] })
    }
  }

  const saveTestResult = (result) => {
    if (!currentUser) return
    const results = currentUser.testResults || []
    const existingIdx = results.findIndex((r) => r.testId === result.testId)
    let updated
    if (existingIdx >= 0) {
      updated = [...results]
      updated[existingIdx] = result
    } else {
      updated = [...results, result]
    }
    updateUser({ testResults: updated })
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateUser,
        completeTopicDemo,
        saveTestResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
