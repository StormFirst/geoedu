import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { LEADERBOARD } from '../../data/mockData'
import clsx from 'clsx'

export default function RatingPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const [tab, setTab] = useState('overall')

  const myRank = LEADERBOARD.findIndex((u) => u.name === currentUser?.name)

  const top3 = LEADERBOARD.slice(0, 3)
  const rest = LEADERBOARD.slice(3)

  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumHeights = ['h-20', 'h-28', 'h-16']
  const podiumColors = ['bg-gray-200 dark:bg-gray-600', 'bg-yellow-400', 'bg-orange-300']
  const medalColors = ['text-gray-500', 'text-yellow-500', 'text-orange-400']
  const medalIcons = [Medal, Trophy, Award]

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('rating.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Eng faol va yuqori ball to'plagan talabalar
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'overall', label: t('rating.overall') },
          { id: 'monthly', label: t('rating.monthly') },
        ].map((tab_) => (
          <button
            key={tab_.id}
            onClick={() => setTab(tab_.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === tab_.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab_.label}
          </button>
        ))}
      </div>

      {myRank >= 0 && (
        <div className="card p-4 mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              #{myRank + 1}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Sizning o'rningiz</p>
              <p className="text-xs text-gray-500">Top {Math.round(((myRank + 1) / LEADERBOARD.length) * 100)}% ichida</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-primary-600 font-bold">
              <TrendingUp size={16} />
              {LEADERBOARD[myRank]?.score || 0} ball
            </div>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6 text-center">Top 3</h2>
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((user, podiumIdx) => {
            if (!user) return <div key={podiumIdx} className="w-24" />
            const rank = LEADERBOARD.indexOf(user) + 1
            const MedalIcon = medalIcons[rank - 1]
            return (
              <div key={user.id} className="flex flex-col items-center gap-2">
                <MedalIcon size={22} className={medalColors[rank - 1]} />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-20 leading-tight">
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-xs font-bold text-primary-600">{user.score}</p>
                <div className={clsx('w-20 rounded-t-lg', podiumHeights[podiumIdx], podiumColors[rank - 1], 'flex items-start justify-center pt-2')}>
                  <span className="text-white font-bold text-lg">#{rank}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-12">{t('rating.rank')}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{t('rating.name')}</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">{t('rating.group')}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">{t('rating.tests')}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{t('rating.score')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {LEADERBOARD.map((user, idx) => {
              const isMe = user.name === currentUser?.name
              return (
                <tr
                  key={user.id}
                  className={clsx(
                    'transition-colors',
                    isMe ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold',
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' :
                      'text-gray-500 dark:text-gray-400'
                    )}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white', isMe ? 'bg-primary-600' : 'bg-gray-400 dark:bg-gray-600')}>
                        {user.name.charAt(0)}
                      </div>
                      <span className={clsx('font-medium', isMe ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white')}>
                        {user.name}
                        {isMe && <span className="ml-1 text-xs text-primary-500">(Siz)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{user.group}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">{user.tests}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-600 dark:text-primary-400">{user.score}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
