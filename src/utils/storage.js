const K = {
  USERS: 'blog_users',
  POSTS: 'blog_posts',
  COMMENTS: 'blog_comments',
  CURRENT: 'blog_current_user',
}

const parse = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export const storage = {
  getUsers: () => parse(K.USERS, []),
  setUsers: (v) => localStorage.setItem(K.USERS, JSON.stringify(v)),

  getPosts: () => parse(K.POSTS, []),
  setPosts: (v) => localStorage.setItem(K.POSTS, JSON.stringify(v)),

  getComments: () => parse(K.COMMENTS, []),
  setComments: (v) => localStorage.setItem(K.COMMENTS, JSON.stringify(v)),

  getCurrentUser: () => parse(K.CURRENT, null),
  setCurrentUser: (v) => localStorage.setItem(K.CURRENT, JSON.stringify(v)),
  clearCurrentUser: () => localStorage.removeItem(K.CURRENT),
}
