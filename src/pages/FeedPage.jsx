import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import PostCard from '../components/PostCard'
import TagFilter from '../components/TagFilter'
import './FeedPage.css'

export default function FeedPage() {
  const { currentUser, getUserById, getAllUsers, toggleSubscription } = useAuth()
  const { posts, canRead } = useBlog()
  const navigate = useNavigate()
  const [activeTag, setActiveTag] = useState(null)
  const [sortOrder, setSortOrder] = useState('newest')
  const [showSuggestions, setShowSuggestions] = useState(false)

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const subs = currentUser.subscriptions ?? []

  const feedPosts = useMemo(() => {
    return posts
      .filter((p) => {
        if (!subs.includes(p.authorId)) return false
        if (!canRead(p, currentUser.id)) return false
        if (activeTag && !p.tags.includes(activeTag)) return false
        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
        if (sortOrder === 'popular') return b.likes.length - a.likes.length
        return 0
      })
  }, [posts, subs, activeTag, sortOrder, currentUser])

  const feedTags = [...new Set(feedPosts.flatMap((p) => p.tags))].sort()

  const allUsers = getAllUsers()
  const suggestions = allUsers.filter(
    (u) => u.id !== currentUser.id && !subs.includes(u.id),
  )

  const subscribedUsers = subs.map((id) => getUserById(id)).filter(Boolean)

  return (
    <div className="page-wide">
      <div className="feed-layout">
        <div className="feed-main">
          <div className="feed-header">
            <h1>Лента подписок</h1>
            <select
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="popular">По популярности</option>
            </select>
          </div>

          {feedTags.length > 0 && (
            <TagFilter tags={feedTags} activeTag={activeTag} onSelect={setActiveTag} />
          )}

          {subs.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>Нет подписок</h3>
              <p>Подпишитесь на авторов, чтобы видеть их посты здесь</p>
              <button
                onClick={() => setShowSuggestions(true)}
                className="btn btn-primary"
                style={{ marginTop: 8 }}
              >
                Найти авторов
              </button>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="empty-state">
              <h3>{activeTag ? 'Постов с таким тегом нет' : 'В ленте пока пусто'}</h3>
              <p>Авторы, на которых вы подписаны, ещё не публиковали {activeTag ? 'постов с этим тегом' : 'посты'}</p>
            </div>
          ) : (
            <div className="posts-list">
              {feedPosts.map((p) => (
                <PostCard key={p.id} post={p} onTagClick={setActiveTag} />
              ))}
            </div>
          )}
        </div>

        <aside className="feed-sidebar">
          {subscribedUsers.length > 0 && (
            <div className="card sidebar-section">
              <h3 className="sidebar-title">Ваши подписки</h3>
              <div className="subs-list">
                {subscribedUsers.map((u) => (
                  <div key={u.id} className="sub-item">
                    <Link to={`/profile/${u.id}`} className="sub-user">
                      <img src={u.avatar} alt={u.username} className="avatar" width="32" height="32" />
                      <span>{u.username}</span>
                    </Link>
                    <button
                      onClick={() => toggleSubscription(u.id)}
                      className="btn btn-ghost btn-sm"
                      title="Отписаться"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="card sidebar-section">
              <h3 className="sidebar-title">Рекомендуем</h3>
              <div className="suggestions-list">
                {suggestions.slice(0, 5).map((u) => (
                  <div key={u.id} className="suggestion-item">
                    <Link to={`/profile/${u.id}`} className="sub-user">
                      <img src={u.avatar} alt={u.username} className="avatar" width="32" height="32" />
                      <div>
                        <div className="sug-name">{u.username}</div>
                        <div className="sug-bio">{u.bio || 'Нет биографии'}</div>
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleSubscription(u.id)}
                      className="btn btn-outline btn-sm"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
