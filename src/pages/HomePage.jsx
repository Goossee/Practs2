import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBlog } from '../context/BlogContext'
import PostCard from '../components/PostCard'
import TagFilter from '../components/TagFilter'
import './HomePage.css'

export default function HomePage() {
  const { posts, getAllTags } = useBlog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

  const tagFromUrl = searchParams.get('tag')
  const [activeTag, setActiveTag] = useState(tagFromUrl ?? null)

  const handleTagSelect = (tag) => {
    setActiveTag(tag)
    if (tag) setSearchParams({ tag })
    else setSearchParams({})
  }

  const allTags = useMemo(() => getAllTags(), [posts])

  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        if (p.visibility !== 'public' && p.visibility !== 'request') return false
        if (activeTag && !p.tags.includes(activeTag)) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          return (
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.tags.some((t) => t.includes(q))
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
        if (sortOrder === 'popular') return b.likes.length - a.likes.length
        return 0
      })
  }, [posts, activeTag, search, sortOrder])

  return (
    <div className="page-wide">
      <div className="home-header">
        <div>
          <h1 className="home-title">Публичные посты</h1>
          <p className="home-subtitle">Читайте интересные истории от авторов со всего сообщества</p>
        </div>
      </div>

      <div className="home-controls">
        <input
          type="search"
          className="form-control search-input"
          placeholder="Поиск по заголовку, тексту или тегу…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <TagFilter tags={allTags} activeTag={activeTag} onSelect={handleTagSelect} />
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3>{search || activeTag ? 'Ничего не найдено' : 'Постов пока нет'}</h3>
          <p>
            {search || activeTag
              ? 'Попробуйте изменить параметры поиска'
              : 'Зарегистрируйтесь и напишите первый пост!'}
          </p>
        </div>
      ) : (
        <div className="posts-grid">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} onTagClick={handleTagSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
