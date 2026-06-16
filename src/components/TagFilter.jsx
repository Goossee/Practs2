import './TagFilter.css'

export default function TagFilter({ tags, activeTag, onSelect }) {
  if (!tags.length) return null

  return (
    <div className="tag-filter">
      <span className="tag-filter-label">Теги:</span>
      <div className="tag-filter-list">
        <button
          className={`tag ${!activeTag ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          Все
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className={`tag ${activeTag === t ? 'active' : ''}`}
            onClick={() => onSelect(activeTag === t ? null : t)}
          >
            #{t}
          </button>
        ))}
      </div>
    </div>
  )
}
