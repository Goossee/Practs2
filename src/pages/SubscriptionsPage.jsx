import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import './SubscriptionsPage.css'

export default function SubscriptionsPage() {
  const { currentUser, getUserById, getAllUsers, toggleSubscription } = useAuth()
  const { posts } = useBlog()
  const navigate = useNavigate()
  const [tab, setTab] = useState('following')
  const [search, setSearch] = useState('')

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const subs = currentUser.subscriptions ?? []
  const allUsers = getAllUsers().filter((u) => u.id !== currentUser.id)

  const following = useMemo(
    () => allUsers.filter((u) => subs.includes(u.id)),
    [allUsers, subs],
  )

  const suggestions = useMemo(
    () =>
      allUsers
        .filter((u) => !subs.includes(u.id))
        .filter((u) => {
          if (!search.trim()) return true
          const q = search.toLowerCase()
          return u.username.toLowerCase().includes(q) || u.bio?.toLowerCase().includes(q)
        }),
    [allUsers, subs, search],
  )

  const getPostCount = (userId) => posts.filter((p) => p.authorId === userId).length

  return (
    <div className="page">
      <div className="subs-page-header">
        <h1>Подписки</h1>
        <p>Управляйте своими подписками и находите новых авторов</p>
      </div>

      <div className="subs-tabs">
        <button
          className={`subs-tab ${tab === 'following' ? 'active' : ''}`}
          onClick={() => setTab('following')}
        >
          Вы подписаны
          <span className="tab-count">{following.length}</span>
        </button>
        <button
          className={`subs-tab ${tab === 'discover' ? 'active' : ''}`}
          onClick={() => setTab('discover')}
        >
          Найти авторов
          <span className="tab-count">{allUsers.filter((u) => !subs.includes(u.id)).length}</span>
        </button>
      </div>

      {tab === 'following' && (
        <div className="subs-section">
          {following.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>Вы ни на кого не подписаны</h3>
              <p>Перейдите на вкладку «Найти авторов», чтобы начать подписываться</p>
              <button className="btn btn-primary" onClick={() => setTab('discover')} style={{ marginTop: 8 }}>
                Найти авторов
              </button>
            </div>
          ) : (
            <div className="users-grid">
              {following.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  postCount={getPostCount(u.id)}
                  isFollowing={true}
                  onToggle={() => toggleSubscription(u.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'discover' && (
        <div className="subs-section">
          <div className="discover-search">
            <input
              type="search"
              className="form-control"
              placeholder="Поиск по имени или биографии…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {suggestions.length === 0 ? (
            <div className="empty-state">
              <h3>{search ? 'Никого не найдено' : 'Вы подписаны на всех!'}</h3>
            </div>
          ) : (
            <div className="users-grid">
              {suggestions.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  postCount={getPostCount(u.id)}
                  isFollowing={false}
                  onToggle={() => toggleSubscription(u.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UserCard({ user, postCount, isFollowing, onToggle }) {
  return (
    <div className="user-card card">
      <Link to={`/profile/${user.id}`} className="user-card-top">
        <img
          src={user.avatar}
          alt={user.username}
          className="avatar user-card-avatar"
          width="56"
          height="56"
        />
        <div className="user-card-info">
          <div className="user-card-name">@{user.username}</div>
          <div className="user-card-bio">{user.bio || 'Биография не добавлена'}</div>
        </div>
      </Link>
      <div className="user-card-footer">
        <div className="user-card-stat">
          <span className="stat-num">{postCount}</span>
          <span className="stat-label">{postCount === 1 ? 'пост' : postCount < 5 ? 'поста' : 'постов'}</span>
        </div>
        <button
          onClick={onToggle}
          className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
        >
          {isFollowing ? '✓ Подписан' : '+ Подписаться'}
        </button>
      </div>
    </div>
  )
}
