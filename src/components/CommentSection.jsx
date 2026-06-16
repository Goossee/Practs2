import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import { formatDate } from '../utils/helpers'
import './CommentSection.css'

export default function CommentSection({ postId }) {
  const { currentUser, getUserById } = useAuth()
  const { comments, addComment, deleteComment } = useBlog()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const postComments = comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentUser) return navigate('/login')
    if (!text.trim()) return setError('Комментарий не может быть пустым')
    setError('')
    addComment(postId, currentUser.id, text)
    setText('')
  }

  const handleDelete = (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return
    deleteComment(commentId, currentUser.id)
  }

  return (
    <section className="comments">
      <h3 className="comments-title">
        Комментарии
        <span className="comment-count">{postComments.length}</span>
      </h3>

      <div className="comments-list">
        {postComments.length === 0 && (
          <p className="no-comments">Комментариев пока нет. Будьте первым!</p>
        )}
        {postComments.map((c) => {
          const author = getUserById(c.authorId)
          const isOwner = currentUser?.id === c.authorId
          return (
            <div key={c.id} className="comment">
              <Link to={`/profile/${c.authorId}`} className="comment-author">
                {author && (
                  <img
                    src={author.avatar}
                    alt={author.username}
                    className="avatar"
                    width="32"
                    height="32"
                  />
                )}
                <div>
                  <span className="comment-username">{author?.username ?? 'Удалён'}</span>
                  <span className="comment-date">{formatDate(c.createdAt)}</span>
                </div>
              </Link>
              <p className="comment-body">{c.content}</p>
              {isOwner && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="btn btn-ghost btn-sm comment-del"
                >
                  Удалить
                </button>
              )}
            </div>
          )
        })}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        {error && <div className="error-msg">{error}</div>}
        {currentUser ? (
          <>
            <div className="comment-input-row">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="avatar"
                width="36"
                height="36"
              />
              <textarea
                className="form-control"
                placeholder="Напишите комментарий…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
              Отправить
            </button>
          </>
        ) : (
          <p className="login-prompt">
            <Link to="/login" className="btn btn-outline btn-sm">Войдите</Link>
            &nbsp;чтобы оставить комментарий
          </p>
        )}
      </form>
    </section>
  )
}
