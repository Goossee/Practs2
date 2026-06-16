import { createContext, useContext, useState, useCallback } from 'react'
import { storage } from '../utils/storage'
import { generateId } from '../utils/helpers'

const BlogContext = createContext(null)

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState(() => storage.getPosts())
  const [comments, setComments] = useState(() => storage.getComments())

  const reload = useCallback(() => {
    setPosts(storage.getPosts())
    setComments(storage.getComments())
  }, [])

  const mutatePosts = (fn) => {
    const next = fn(storage.getPosts())
    storage.setPosts(next)
    setPosts(next)
    return next
  }

  const mutateComments = (fn) => {
    const next = fn(storage.getComments())
    storage.setComments(next)
    setComments(next)
    return next
  }

  const createPost = useCallback((authorId, { title, content, tags, visibility }) => {
    const post = {
      id: generateId(),
      authorId,
      title: title.trim(),
      content: content.trim(),
      tags: (tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
      visibility,
      requestedBy: [],
      approvedFor: [],
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mutatePosts((prev) => [post, ...prev])
    return post
  }, [])

  const updatePost = useCallback((postId, authorId, changes) => {
    mutatePosts((prev) =>
      prev.map((p) =>
        p.id === postId && p.authorId === authorId
          ? {
              ...p,
              ...changes,
              tags: (changes.tags ?? p.tags)
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
  }, [])

  const deletePost = useCallback((postId, authorId) => {
    mutatePosts((prev) =>
      prev.filter((p) => !(p.id === postId && p.authorId === authorId)),
    )
    mutateComments((prev) => prev.filter((c) => c.postId !== postId))
  }, [])

  const requestAccess = useCallback((postId, userId) => {
    mutatePosts((prev) =>
      prev.map((p) =>
        p.id === postId && !p.requestedBy.includes(userId)
          ? { ...p, requestedBy: [...p.requestedBy, userId] }
          : p,
      ),
    )
  }, [])

  const approveAccess = useCallback((postId, authorId, userId) => {
    mutatePosts((prev) =>
      prev.map((p) =>
        p.id === postId && p.authorId === authorId
          ? {
              ...p,
              approvedFor: [...(p.approvedFor ?? []), userId],
              requestedBy: p.requestedBy.filter((id) => id !== userId),
            }
          : p,
      ),
    )
  }, [])

  const rejectAccess = useCallback((postId, authorId, userId) => {
    mutatePosts((prev) =>
      prev.map((p) =>
        p.id === postId && p.authorId === authorId
          ? { ...p, requestedBy: p.requestedBy.filter((id) => id !== userId) }
          : p,
      ),
    )
  }, [])

  const toggleLike = useCallback((postId, userId) => {
    mutatePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const liked = p.likes.includes(userId)
        return {
          ...p,
          likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId],
        }
      }),
    )
  }, [])

  const addComment = useCallback((postId, authorId, content) => {
    const comment = {
      id: generateId(),
      postId,
      authorId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    mutateComments((prev) => [...prev, comment])
    return comment
  }, [])

  const deleteComment = useCallback((commentId, userId) => {
    mutateComments((prev) =>
      prev.filter((c) => !(c.id === commentId && c.authorId === userId)),
    )
  }, [])

  const canRead = useCallback((post, userId) => {
    if (post.visibility === 'public') return true
    if (post.authorId === userId) return true
    if (post.visibility === 'request')
      return (post.approvedFor ?? []).includes(userId)
    return false
  }, [])

  const getAllTags = useCallback(() => {
    const tagSet = new Set()
    storage.getPosts().forEach((p) => p.tags?.forEach((t) => tagSet.add(t)))
    return [...tagSet].sort()
  }, [])

  return (
    <BlogContext.Provider
      value={{
        posts,
        comments,
        reload,
        createPost,
        updatePost,
        deletePost,
        requestAccess,
        approveAccess,
        rejectAccess,
        toggleLike,
        addComment,
        deleteComment,
        canRead,
        getAllTags,
      }}
    >
      {children}
    </BlogContext.Provider>
  )
}

export const useBlog = () => {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog must be used within BlogProvider')
  return ctx
}
