import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import { formatDate } from '../utils/helpers'
import './PostCard.css'

export default function PostCard({ post, onTagClick }) {
  const { currentUser, getUserById } = useAuth()
  const { deletePost, toggleLike, requestAccess, canRead } = useBlog()
  const navigate = useNavigate()

  const author = getUserById(post.authorId)
  const isOwner = currentUser?.id === post.authorId
  const isReadable = canRead(post, currentUser?.id)
  const liked = post.likes.includes(currentUser?.id)
  const hasRequested = post.requestedBy?.includes(currentUser?.id)
  const approved = post.approvedFor?.includes(currentUser?.id)

  const handleDelete = () => {
    if (!window.confirm('Удалить этот пост?')) return
    deletePost(post.id, currentUser.id)
  }

  const handleLike = () => {
    if (!currentUser) return navigate('/login')
    toggleLike(post.id, currentUser.id)
  }

  const handleRequest = () => {
    if (!currentUser) return navigate('/login')
    requestAccess(post.id, currentUser.id)
  }

  const visibilityLabel =
    post.visibility === 'request' ? (
      <span className="visibility-badge request">По запросу</span>
    ) : (
      <span className="visibility-badge public">Публичный</span>
    )

  const preview = post.content.slice(0, 200) + (post.content.length > 200 ? '…' : '')

  return (
    <article className="post-card">
      <div className="post-card-header">
        <Link to={`/profile/${post.authorId}`} className="post-author">
          {author && (
            <img
              src={author.avatar}
              alt={author.username}
              className="avatar"
              width="36"
              height="36"
            />
          )}
          <div>
            <div className="author-name">{author?.username ?? 'Удалён'}</div>
            <div className="post-date">{formatDate(post.createdAt)}</div>
          </div>
        </Link>
        <div className="post-badges">
          {visibilityLabel}
          {isOwner && (
            <div className="post-owner-actions">
              <Link to={`/edit/${post.id}`} className="btn btn-ghost btn-sm">Изменить</Link>
              <button onClick={handleDelete} className="btn btn-danger-outline btn-sm">Удалить</button>
            </div>
          )}
        </div>
      </div>

      <Link to={`/post/${post.id}`} className="post-title-link">
        <h2 className="post-title">{post.title}</h2>
      </Link>

      {isReadable ? (
        <p className="post-preview">{preview}</p>
      ) : (
        <div className="post-locked">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Этот пост доступен только по запросу</span>
          {!isOwner && !approved && (
            <button
              onClick={handleRequest}
              disabled={hasRequested}
              className="btn btn-outline btn-sm"
            >
              {hasRequested ? 'Запрос отправлен' : 'Запросить доступ'}
            </button>
          )}
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="tag"
              onClick={(e) => { e.preventDefault(); onTagClick?.(tag) }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-card-footer">
        <button
          onClick={handleLike}
          className={`like-btn ${liked ? 'liked' : ''}`}
          title={liked ? 'Убрать лайк' : 'Лайкнуть'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes.length}
        </button>

        <Link to={`/post/${post.id}`} className="comment-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Комментарии
        </Link>
      </div>
    </article>
  )
}
