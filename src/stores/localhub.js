import { computed, reactive } from 'vue'
import { BOARD_SEED, TOTALS, TOUR_DATA } from '../data/tourData'

const savedPosts = localStorage.getItem('localhub-posts')
const posts = reactive(savedPosts ? JSON.parse(savedPosts) : structuredClone(BOARD_SEED))

function persistPosts() {
  localStorage.setItem('localhub-posts', JSON.stringify(posts))
}

function addPost(post) {
  posts.push({
    id: Date.now(),
    category: post.category,
    title: post.title,
    author: post.author || '익명',
    content: post.content,
    password: post.password,
    createdAt: new Date().toISOString(),
    views: 0,
    likes: 0,
    bookmarked: false,
  })
  persistPosts()
}

function updatePost(id, values) {
  const post = posts.find((item) => item.id === id)
  if (!post) return
  Object.assign(post, values)
  persistPosts()
}

function removePost(id) {
  const index = posts.findIndex((item) => item.id === id)
  if (index >= 0) posts.splice(index, 1)
  persistPosts()
}

function incrementView(post) {
  post.views = (post.views || 0) + 1
  persistPosts()
}

function likePost(post) {
  post.likes = (post.likes || 0) + 1
  persistPosts()
}

function toggleBookmark(post) {
  post.bookmarked = !post.bookmarked
  persistPosts()
}

export function useLocalHub() {
  return {
    posts,
    tourData: TOUR_DATA,
    totals: TOTALS,
    bookmarkedPosts: computed(() => posts.filter((post) => post.bookmarked)),
    totalViews: computed(() => posts.reduce((sum, post) => sum + (post.views || 0), 0)),
    totalLikes: computed(() => posts.reduce((sum, post) => sum + (post.likes || 0), 0)),
    persistPosts,
    addPost,
    updatePost,
    removePost,
    incrementView,
    likePost,
    toggleBookmark,
  }
}
