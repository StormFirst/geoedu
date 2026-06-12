import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

function buildUserProfile(uid, email, { name, role = 'student' } = {}) {
  return {
    uid,
    email,
    name: (name || '').trim(),
    role,
    joinDate: new Date().toISOString().split('T')[0],
    completedTopics: [],
    testResults: [],
    certificates: [],
    avatar: null,
    createdAt: serverTimestamp(),
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        const profile = docSnap.exists() ? docSnap.data() : {}
        setCurrentUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...profile })
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    const docSnap = await getDoc(doc(db, 'users', user.uid))
    const profile = docSnap.exists() ? docSnap.data() : {}
    const merged = { uid: user.uid, email: user.email, ...profile }
    setCurrentUser(merged)
    return merged
  }

  const register = async (userData) => {
    if (!auth || !db) {
      throw new Error('Firebase ulanishi mavjud emas. .env faylini tekshiring.')
    }

    const { email, password, name, role = 'student' } = userData
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const profile = buildUserProfile(user.uid, user.email, { name, role })
    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, profile)

    const merged = {
      uid: user.uid,
      email: user.email,
      name: profile.name,
      role: profile.role,
      joinDate: profile.joinDate,
      completedTopics: profile.completedTopics,
      testResults: profile.testResults,
      certificates: profile.certificates,
      avatar: profile.avatar,
    }
    setCurrentUser(merged)
    return merged
  }

  const logout = () => signOut(auth)

  const updateUser = async (updates) => {
    if (!currentUser) return
    await updateDoc(doc(db, 'users', currentUser.uid), updates)
    setCurrentUser((prev) => ({ ...prev, ...updates }))
  }

  const completeTopicDemo = async (topicId) => {
    if (!currentUser) return
    const completedTopics = currentUser.completedTopics || []
    if (!completedTopics.includes(topicId)) {
      await updateUser({ completedTopics: [...completedTopics, topicId] })
    }
  }

  const saveTestResult = async (result) => {
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
    await updateUser({ testResults: updated })
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
