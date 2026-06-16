import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBlog } from '../context/BlogContext'
import PostForm from '../components/PostForm'
import './FormPage.css'

export default function CreatePostPage() {
  const { currentUser } = useAuth()
  const { createPost } = useBlog()
  const navigate = useNavigate()

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleSubmit = (data) => {
    const post = createPost(currentUser.id, data)
    navigate(`/post/${post.id}`)
  }

  return (
    <div className="page">
      <div className="form-page-header">
        <h1>Новый пост</h1>
        <p>Поделитесь своими мыслями с читателями</p>
      </div>
      <div className="card">
        <PostForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
