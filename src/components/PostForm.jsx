import { useState } from 'react'
import './PostForm.css'

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Публичный', desc: 'Виден всем посетителям' },
  { value: 'request', label: 'По запросу', desc: 'Скрыт — доступ по одобрению' },
]

export default function PostForm({ initial = {}, onSubmit, loading }) {
  const [title, setTitle] = useState(initial.title ?? '')
  const [content, setContent] = useState(initial.content ?? '')
  const [tagInput, setTagInput] = useState(initial.tags?.join(', ') ?? '')
  const [visibility, setVisibility] = useState(initial.visibility ?? 'public')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('Введите заголовок')
    if (!content.trim()) return setError('Введите текст поста')
    setError('')

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    onSubmit({ title, content, tags, visibility })
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {error && <div className="error-msg">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Заголовок</label>
        <input
          id="title"
          className="form-control"
          placeholder="Введите заголовок поста"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Содержание</label>
        <textarea
          id="content"
          className="form-control post-textarea"
          placeholder="Напишите что-нибудь интересное…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Теги (через запятую)</label>
        <input
          id="tags"
          className="form-control"
          placeholder="javascript, react, веб-разработка"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        {tagInput && (
          <div className="tag-preview">
            {tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Видимость</label>
        <div className="visibility-options">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`visibility-option ${visibility === opt.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
              />
              <div>
                <div className="opt-label">{opt.label}</div>
                <div className="opt-desc">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Сохранение…' : 'Опубликовать'}
      </button>
    </form>
  )
}
