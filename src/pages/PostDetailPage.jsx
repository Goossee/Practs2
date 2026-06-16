import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import { formatDate } from '../utils/helpers'
import CommentSection from '../components/CommentSection'
import './PostDetailPage.css'

export default function PostDetailPage() {
  const { postId } = useParams()
  const { currentUser, getUserById, refreshCurrentUser } = useAuth()
  const { posts, toggleLike, requestAccess, approveAccess, rejectAccess, canRead, deletePost } = useBlog()
  const navigate = useNavigate()

  const post = posts.find((p) => p.id === postId)

  if (!post) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Пост не найден</h3>
          <p>Возможно, он был удалён</p>
        </div>
      </div>
    )
  }

  const author = getUserById(post.authorId)
  const isOwner = currentUser?.id === post.authorId
  const isReadable = canRead(post, currentUser?.id)
  const liked = post.likes.includes(currentUser?.id)
  const hasRequested = post.requestedBy?.includes(currentUser?.id)

  const handleLike = () => {
    if (!currentUser) return navigate('/login')
    toggleLike(post.id, currentUser.id)
  }

  const handleRequest = () => {
    if (!currentUser) return navigate('/login')
    requestAccess(post.id, currentUser.id)
  }

  const handleDelete = () => {
    if (!window.confirm('Удалить этот пост?')) return
    deletePost(post.id, currentUser.id)
    navigate('/')
  }

  return (
    <div className="page">
      <article className="post-detail card">
        <div className="post-detail-header">
          <div className="breadcrumb">
            <Link to="/">← Все посты</Link>
          </div>
          {isOwner && (
            <div className="post-detail-actions">
              <Link to={`/edit/${post.id}`} className="btn btn-outline btn-sm">Редактировать</Link>
              <button onClick={handleDelete} className="btn btn-danger-outline btn-sm">Удалить</button>
            </div>
          )}
        </div>

        <div className="post-meta">
          <Link to={`/profile/${post.authorId}`} className="post-author-row">
            {author && (
              <img
                src={author.avatar}
                alt={author.username}
                className="avatar"
                width="44"
                height="44"
              />
            )}
            <div>
              <div className="author-name-lg">{author?.username ?? 'Удалён'}</div>
              <div className="post-dates">
                <span>{formatDate(post.createdAt)}</span>
                {post.updatedAt !== post.createdAt && (
                  <span className="edited-badge">· изменено {formatDate(post.updatedAt)}</span>
                )}
              </div>
            </div>
          </Link>
          <span className={`visibility-badge ${post.visibility}`}>
            {post.visibility === 'public' ? 'Публичный' : 'По запросу'}
          </span>
        </div>

        <h1 className="post-detail-title">{post.title}</h1>

        {post.tags.length > 0 && (
          <div className="post-detail-tags">
            {post.tags.map((t) => (
              <Link key={t} to={`/?tag=${t}`} className="tag">#{t}</Link>
            ))}
          </div>
        )}

        {isReadable ? (
          <div className="post-content">
            {post.content.split('\n').map((line, i) =>
              line ? <p key={i}>{line}</p> : <br key={i} />,
            )}
          </div>
        ) : (
          <div className="post-locked-detail">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h3>Этот пост доступен только по запросу</h3>
            <p>Запросите доступ у автора, чтобы прочитать полный текст</p>
            {!isOwner && (
              <button
                onClick={handleRequest}
                disabled={hasRequested}
                className="btn btn-primary"
              >
                {hasRequested ? '✓ Запрос отправлен' : 'Запросить доступ'}
              </button>
            )}
          </div>
        )}

        <div className="post-detail-footer">
          <button
            onClick={handleLike}
            className={`like-btn ${liked ? 'liked' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {liked ? 'Нравится' : 'Лайк'} · {post.likes.length}
          </button>
        </div>

        {isOwner && post.visibility === 'request' && post.requestedBy?.length > 0 && (
          <div className="access-requests">
            <h3 className="access-title">Запросы на доступ ({post.requestedBy.length})</h3>
            <div className="access-list">
              {post.requestedBy.map((uid) => {
                const u = getUserById(uid)
                return (
                  <div key={uid} className="access-item">
                    <Link to={`/profile/${uid}`} className="access-user">
                      {u && (
                        <img src={u.avatar} alt={u.username} className="avatar" width="32" height="32" />
                      )}
                      <span>{u?.username ?? uid}</span>
                    </Link>
                    <div className="access-btns">
                      <button
                        onClick={() => approveAccess(post.id, currentUser.id, uid)}
                        className="btn btn-sm"
                        style={{ background: 'var(--success)', color: '#fff' }}
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => rejectAccess(post.id, currentUser.id, uid)}
                        className="btn btn-danger-outline btn-sm"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isReadable && <CommentSection postId={post.id} />}
      </article>
    </div>
  )
}
