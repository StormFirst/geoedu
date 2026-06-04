import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, Edit3, Trash2, User, Shield, BookOpen } from 'lucide-react'
import { DEMO_USERS } from '../../data/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const initialUsers = Object.values(DEMO_USERS).map(({ password, ...u }) => u)

const roleColors = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  teacher: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}
const roleIcons = { admin: Shield, teacher: BookOpen, student: User }

export default function ManageUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editUser, setEditUser] = useState(null)

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success("Foydalanuvchi o'chirildi")
  }

  const saveEdit = () => {
    setUsers((prev) => prev.map((u) => u.id === editUser.id ? editUser : u))
    setEditUser(null)
    toast.success('Saqlandi')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{t('admin.manageUsers')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} foydalanuvchi</p>
        </div>
        <button
          onClick={() => toast('Yangi foydalanuvchi qo\'shish (demo)')}
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
              className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize', roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
            >
              {r === 'all' ? t('common.all') : r}
            </button>
          ))}
        </div>
      </div>

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
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-400">
                        {user.name.charAt(0)}
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
                        onClick={() => deleteUser(user.id)}
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

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tahrirlash</h2>
            <div className="space-y-3">
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
            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} className="btn-primary flex-1 justify-center">Saqlash</button>
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1 justify-center">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
