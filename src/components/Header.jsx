import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="8" fill="#6366f1" />
            <path d="M7 8h10M7 12h7M7 16h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>BlogApp</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
            Публичные
          </NavLink>
          {currentUser && (
            <NavLink to="/feed" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Лента
            </NavLink>
          )}
          {currentUser && (
            <NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Подписки
              {(currentUser.subscriptions?.length ?? 0) > 0 && (
                <span className="nav-badge">{currentUser.subscriptions.length}</span>
              )}
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Написать
              </Link>
              <Link to={`/profile/${currentUser.id}`} className="user-link">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="avatar"
                  width="32"
                  height="32"
                />
                <span>{currentUser.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Войти</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
