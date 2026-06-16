import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BlogProvider } from './context/BlogContext'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import FeedPage from './pages/FeedPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BlogProvider>
        <div className="app">
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="/edit/:postId" element={<EditPostPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BlogProvider>
    </AuthProvider>
  )
}
