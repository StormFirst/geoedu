import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Trophy, Medal, Award, TrendingUp, Star, RefreshCw } from 'lucide-react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'
import clsx from 'clsx'

export default function RatingPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overall')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('totalScore', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      const users = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setLeaderboard(users)
    } catch (err) {
      console.error('Leaderboard fetch error:', err)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const myRank = leaderboard.findIndex((u) => u.uid === currentUser?.uid)
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumHeights = ['h-20', 'h-28', 'h-16']
  const podiumColors = ['bg-gray-300 dark:bg-gray-600', 'bg-yellow-400', 'bg-orange-300']
  const medalColors = ['text-gray-400', 'text-yellow-500', 'text-orange-400']
  const medalIcons = [Medal, Trophy, Award]

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="section-title">{t('rating.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Eng yuqori ochko to'plagan foydalanuvchilar
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Yangilash
        </button>
      </div>

      {/* My rank card */}
      {myRank >= 0 && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              #{myRank + 1}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Sizning o'rningiz</p>
              <p className="text-xs text-gray-500">
                {leaderboard.length > 0
                  ? `Top ${Math.round(((myRank + 1) / leaderboard.length) * 100)}% ichida`
                  : ''}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold">
              <Star size={16} fill="currentColor" />
              {leaderboard[myRank]?.totalScore || 0} ochko
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-primary-500" />
            <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card p-10 text-center">
          <Trophy size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Hali hech kim test topshirmagan</p>
          <p className="text-xs text-gray-400 mt-1">Test topshiring va birinchi bo'ling!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 1 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
                <Trophy size={18} className="text-yellow-500" /> Top 3
              </h2>
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((user, podiumIdx) => {
                  if (!user) return <div key={podiumIdx} className="w-24" />
                  const rank = leaderboard.indexOf(user) + 1
                  const MedalIcon = medalIcons[rank - 1]
                  const isMe = user.uid === currentUser?.uid
                  return (
                    <div key={user.id || user.uid} className="flex flex-col items-center gap-2">
                      <MedalIcon size={22} className={medalColors[rank - 1]} />
                      <div
                        className={clsx(
                          'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2',
                          isMe
                            ? 'bg-primary-600 border-primary-400'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600 border-transparent'
                        )}
                      >
                        {getInitials(user.name)}
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-20 leading-tight">
                        {user.name?.split(' ')[0] || 'Foydalanuvchi'}
                        {isMe && <span className="block text-primary-500">(Siz)</span>}
                      </p>
                      <p className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                        <Star size={11} fill="currentColor" /> {user.totalScore || 0}
                      </p>
                      <div
                        className={clsx(
                          'w-20 rounded-t-lg flex items-start justify-center pt-2',
                          podiumHeights[podiumIdx],
                          podiumColors[rank - 1]
                        )}
                      >
                        <span className="text-white font-bold text-lg drop-shadow">#{rank}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Full leaderboard table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-12">{t('rating.rank')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{t('rating.name')}</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Testlar</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                    <span className="flex items-center justify-end gap-1">
                      <Star size={13} className="text-yellow-500" fill="currentColor" /> Ochko
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {leaderboard.map((user, idx) => {
                  const isMe = user.uid === currentUser?.uid
                  const testsCount = user.testResults?.length || 0
                  return (
                    <tr
                      key={user.id || user.uid}
                      className={clsx(
                        'transition-colors',
                        isMe
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold',
                            idx === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : idx === 1
                              ? 'bg-gray-100 text-gray-600'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-600'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white',
                              isMe ? 'bg-primary-600' : 'bg-gray-400 dark:bg-gray-600'
                            )}
                          >
                            {getInitials(user.name)}
                          </div>
                          <span
                            className={clsx(
                              'font-medium',
                              isMe
                                ? 'text-primary-700 dark:text-primary-400'
                                : 'text-gray-900 dark:text-white'
                            )}
                          >
                            {user.name || 'Foydalanuvchi'}
                            {isMe && (
                              <span className="ml-1 text-xs text-primary-500">(Siz)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {testsCount} ta
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-end gap-1 font-bold text-primary-600 dark:text-primary-400">
                          <Star size={13} fill="currentColor" />
                          {user.totalScore || 0}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
