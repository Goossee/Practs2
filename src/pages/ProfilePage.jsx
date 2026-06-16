import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import PostCard from '../components/PostCard'
import TagFilter from '../components/TagFilter'
import './ProfilePage.css'

export default function ProfilePage() {
  const { userId } = useParams()
  const { currentUser, getUserById, toggleSubscription, updateProfile, getAllUsers } = useAuth()
  const { posts, canRead } = useBlog()
  const [activeTag, setActiveTag] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

  const user = getUserById(userId)

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Пользователь не найден</h3>
        </div>
      </div>
    )
  }

  const isOwn = currentUser?.id === userId
  const isSubscribed = currentUser?.subscriptions?.includes(userId)
  const allUsers = getAllUsers()
  const subscribersCount = allUsers.filter((u) => u.subscriptions?.includes(userId)).length

  const userPosts = posts
    .filter((p) => {
      if (p.authorId !== userId) return false
      if (!isOwn && !canRead(p, currentUser?.id)) return false
      if (activeTag && !p.tags.includes(activeTag)) return false
      return true
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortOrder === 'popular') return b.likes.length - a.likes.length
      return 0
    })

  const allTags = [...new Set(
    posts.filter((p) => p.authorId === userId).flatMap((p) => p.tags)
  )].sort()

  const handleSubscribe = () => {
    if (!currentUser) return
    toggleSubscription(userId)
  }

  const handleSaveBio = () => {
    updateProfile({ bio: bioText })
    setEditingBio(false)
  }

  const startEditBio = () => {
    setBioText(user.bio || '')
    setEditingBio(true)
  }

  return (
    <div className="page-wide">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-card card">
            <div className="profile-avatar-wrap">
              <img
                src={user.avatar}
                alt={user.username}
                className="profile-avatar"
                width="80"
                height="80"
              />
            </div>
            <h1 className="profile-username">@{user.username}</h1>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-num">{userPosts.length}</span>
                <span className="stat-label">постов</span>
              </div>
              <div className="stat">
                <span className="stat-num">{subscribersCount}</span>
                <span className="stat-label">подписчиков</span>
              </div>
              <div className="stat">
                <span className="stat-num">{user.subscriptions?.length ?? 0}</span>
                <span className="stat-label">подписок</span>
              </div>
            </div>

            {editingBio ? (
              <div className="bio-edit">
                <textarea
                  className="form-control"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Расскажите о себе…"
                  rows={3}
                  maxLength={200}
                />
                <div className="bio-actions">
                  <button onClick={handleSaveBio} className="btn btn-primary btn-sm">Сохранить</button>
                  <button onClick={() => setEditingBio(false)} className="btn btn-ghost btn-sm">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="bio-section">
                <p className="bio-text">{user.bio || 'Биография не добавлена'}</p>
                {isOwn && (
                  <button onClick={startEditBio} className="btn btn-ghost btn-sm bio-edit-btn">
                    Редактировать биографию
                  </button>
                )}
              </div>
            )}

            {!isOwn && currentUser && (
              <button
                onClick={handleSubscribe}
                className={`btn ${isSubscribed ? 'btn-outline' : 'btn-primary'} subscribe-btn`}
              >
                {isSubscribed ? '✓ Вы подписаны' : 'Подписаться'}
              </button>
            )}
          </div>
        </aside>

        <div className="profile-posts">
          <div className="profile-posts-header">
            <h2>Посты</h2>
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

          {allTags.length > 0 && (
            <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
          )}

          {userPosts.length === 0 ? (
            <div className="empty-state">
              <h3>{activeTag ? 'Постов с таким тегом нет' : 'Постов пока нет'}</h3>
              {isOwn && !activeTag && (
                <p>Напишите свой первый пост!</p>
              )}
            </div>
          ) : (
            <div className="posts-list">
              {userPosts.map((p) => (
                <PostCard key={p.id} post={p} onTagClick={setActiveTag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
