import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import PostForm from '../components/PostForm'
import './FormPage.css'

export default function EditPostPage() {
  const { postId } = useParams()
  const { currentUser } = useAuth()
  const { posts, updatePost } = useBlog()
  const navigate = useNavigate()

  const post = posts.find((p) => p.id === postId)

  if (!currentUser) {
    navigate('/login')
    return null
  }

  if (!post) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Пост не найден</h3>
        </div>
      </div>
    )
  }

  if (post.authorId !== currentUser.id) {
    navigate('/')
    return null
  }

  const handleSubmit = (data) => {
    updatePost(postId, currentUser.id, data)
    navigate(`/post/${postId}`)
  }

  return (
    <div className="page">
      <div className="form-page-header">
        <h1>Редактировать пост</h1>
        <p>Внесите изменения в свой пост</p>
      </div>
      <div className="card">
        <PostForm initial={post} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
