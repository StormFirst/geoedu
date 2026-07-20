import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, Edit3, Trash2, User, Shield, BookOpen, X, Mail, Key } from 'lucide-react'
import { DEMO_USERS } from '../../data/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { db, isDemoMode } from '../../firebase/config'
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const initialUsers = Object.values(DEMO_USERS).map(({ password, ...u }) => u)

const roleColors = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  teacher: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}
const roleIcons = { admin: Shield, teacher: BookOpen, student: User }

export default function ManageUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editUser, setEditUser] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', university: '' })
  const [savingAdd, setSavingAdd] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (isDemoMode || !db) {
      setUsers(initialUsers)
      setLoading(false)
      return
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'))
        const fetched = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetched.push({
            id: doc.id,
            ...data,
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Foydalanuvchi',
          })
        })
        setUsers(fetched)
      } catch (err) {
        console.error("Foydalanuvchilarni yuklashda xatolik:", err)
        toast.error("Ma'lumotlarni yuklab bo'lmadi")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const nameStr = u.name || ''
    const emailStr = u.email || ''
    const matchSearch = nameStr.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const deleteUser = async (id) => {
    if (!window.confirm("Haqiqatan ham bu foydalanuvchini o'chirmoqchisiz?")) return

    if (isDemoMode || !db) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success("Foydalanuvchi o'chirildi")
      return
    }

    try {
      await deleteDoc(doc(db, 'users', id))
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success("Foydalanuvchi o'chirildi")
    } catch (err) {
      console.error("O'chirishda xatolik:", err)
      toast.error("Foydalanuvchini o'chirib bo'lmadi")
    }
  }

  const saveEdit = async () => {
    if (!editUser.name.trim()) {
      toast.error("Ism bo'sh bo'lishi mumkin emas")
      return
    }

    setSavingEdit(true)
    try {
      if (isDemoMode || !db) {
        setUsers((prev) => prev.map((u) => u.id === editUser.id ? editUser : u))
        setEditUser(null)
        toast.success('Saqlandi')
        return
      }

      const userRef = doc(db, 'users', editUser.id)
      const nameParts = editUser.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      await updateDoc(userRef, {
        name: editUser.name,
        firstName,
        lastName,
        role: editUser.role,
        university: editUser.university || '',
      })

      setUsers((prev) => prev.map((u) => u.id === editUser.id ? editUser : u))
      setEditUser(null)
      toast.success('Saqlandi')
    } catch (err) {
      console.error("Tahrirlashda xatolik:", err)
      toast.error("O'zgarishlarni saqlab bo'lmadi")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Iltimos, ism va elektron pochtani kiriting")
      return
    }
    if (!isDemoMode && (!newUser.password || newUser.password.length < 6)) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }

    setSavingAdd(true)
    try {
      if (isDemoMode || !db) {
        const added = {
          id: `user-mock-${Date.now()}`,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          university: newUser.university || '',
          joinDate: new Date().toISOString().split('T')[0],
          completedTopics: [],
          testResults: [],
          totalScore: 0,
        }
        setUsers((prev) => [added, ...prev])
        setShowAddModal(false)
        setNewUser({ name: '', email: '', password: '', role: 'student', university: '' })
        toast.success("Yangi foydalanuvchi qo'shildi (Demo)")
        return
      }

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }
      const tempApp = initializeApp(firebaseConfig, `TempApp-${Date.now()}`)
      const tempAuth = getAuth(tempApp)
      const { user } = await createUserWithEmailAndPassword(tempAuth, newUser.email.trim(), newUser.password)

      const profile = {
        uid: user.uid,
        email: user.email,
        name: newUser.name.trim(),
        firstName: newUser.name.trim().split(' ')[0] || '',
        lastName: newUser.name.trim().split(' ').slice(1).join(' ') || '',
        role: newUser.role,
        university: newUser.university || '',
        joinDate: new Date().toISOString().split('T')[0],
        completedTopics: [],
        testResults: [],
        totalScore: 0,
        certificates: [],
      }

      await setDoc(doc(db, 'users', user.uid), profile)
      setUsers((prev) => [profile, ...prev])
      setShowAddModal(false)
      setNewUser({ name: '', email: '', password: '', role: 'student', university: '' })
      toast.success("Foydalanuvchi muvaffaqiyatli qo'shildi! 🎉")
      await tempApp.delete()
    } catch (err) {
      console.error("Foydalanuvchi qo'shishda xatolik:", err)
      toast.error(err.message || "Qo'shishda xatolik yuz berdi")
    } finally {
      setSavingAdd(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{t('admin.manageUsers')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} foydalanuvchi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <UserPlus size={16} />
          {t('admin.addNew')}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 py-2"
            placeholder={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'teacher', 'student'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {r === 'all' ? t('common.all') : r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Foydalanuvchi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Universitet</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Sana</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((user) => {
                const RoleIcon = roleIcons[user.role] || User
                return (
                  <tr key={user.id || user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-400">
                          {(user.name || '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                      {user.university || '—'}
                      {user.group && <span className="ml-1 text-gray-300">• {user.group}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-xs', roleColors[user.role])}>
                        <RoleIcon size={11} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{user.joinDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id || user.uid)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User size={32} className="mx-auto mb-2 opacity-40" />
              <p>{t('common.noData')}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">Foydalanuvchini Tahrirlash</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Ism</label>
                <input className="input" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </div>
              <div>
                <label className="label text-xs">Rol</label>
                <select className="input" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Universitet</label>
                <input className="input" value={editUser.university || ''} onChange={(e) => setEditUser({ ...editUser, university: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdit} disabled={savingEdit} className="btn-primary flex-1 justify-center disabled:opacity-50">
                {savingEdit ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1 justify-center">Bekor</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddUser} className="card p-6 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              <h2 className="font-semibold text-gray-900 dark:text-white text-base">Yangi Foydalanuvchi Qo'shish</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Ism Sharif</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Jasur Abdullayev"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label text-xs">Elektron Pochta (Email)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="input pl-9"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>

              {!isDemoMode && (
                <div>
                  <label className="label text-xs">Parol (Kamida 6 ta belgi)</label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      className="input pl-9"
                      placeholder="******"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label text-xs">Rol</label>
                <select
                  className="input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div>
                <label className="label text-xs">Universitet</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Toshkent Davlat Texnika Universiteti"
                  value={newUser.university}
                  onChange={(e) => setNewUser({ ...newUser, university: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={savingAdd} className="btn-primary flex-1 justify-center disabled:opacity-50">
                {savingAdd ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Bekor</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
