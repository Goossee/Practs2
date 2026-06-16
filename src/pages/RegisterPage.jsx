import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function RegisterPage() {
  const { register, currentUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (currentUser) {
    navigate('/')
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Пароли не совпадают')
    if (password.length < 6) return setError('Пароль должен содержать минимум 6 символов')
    if (username.length < 3) return setError('Имя пользователя должно содержать минимум 3 символа')
    setLoading(true)
    try {
      register(username, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1>Создать аккаунт</h1>
          <p>Присоединяйтесь к нашему сообществу блогеров</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              className="form-control"
              placeholder="coolblogger"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Подтвердите пароль</label>
            <input
              id="confirm"
              type="password"
              className="form-control"
              placeholder="Повторите пароль"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Регистрация…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
