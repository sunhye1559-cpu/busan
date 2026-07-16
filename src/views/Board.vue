<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({ language: { type: String, default: 'KO' } })
const route = useRoute()
const router = useRouter()
const { posts, addPost, updatePost, removePost, incrementView, likePost, toggleBookmark } = useLocalHub()

const query = ref('')
const category = ref('전체')
const categories = ['여행질문','맛집후기','축제정보','자유게시판']
const writeOpen = ref(false)
const editingId = ref(null)
const selectedPost = ref(null)
const form = reactive({ category:'자유게시판', title:'', author:'익명', content:'', password:'' })

const filteredPosts = computed(() => {
  const keyword = query.value.toLowerCase()
  return [...posts].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).filter((post) => {
    const categoryMatch = category.value === '전체' || post.category === category.value
    const keywordMatch = !keyword || `${post.title} ${post.content} ${post.author}`.toLowerCase().includes(keyword)
    return categoryMatch && keywordMatch
  })
})

watch(() => route.query.write, (value) => {
  if (value === '1') openWrite()
}, { immediate:true })

function resetForm(){
  Object.assign(form,{ category:'자유게시판', title:'', author:'익명', content:'', password:'' })
}
function openWrite(){
  editingId.value = null
  resetForm()
  writeOpen.value = true
  if(route.query.write) router.replace('/board')
}
function save(){
  if(!form.title || !form.content || !form.password) return alert(props.language === 'KO' ? '제목, 내용, 비밀번호를 입력해주세요.' : 'Please enter a title, content, and password.')
  if(editingId.value) updatePost(editingId.value,{ category:form.category,title:form.title,author:form.author||'익명',content:form.content })
  else addPost(form)
  writeOpen.value = false
  selectedPost.value = null
}
function openPost(post){ incrementView(post); selectedPost.value = post }
function edit(post){
  const password = prompt(props.language === 'KO' ? '수정 비밀번호를 입력하세요.' : 'Enter the edit password.')
  if(password !== post.password) return alert(props.language === 'KO' ? '비밀번호가 일치하지 않습니다.' : 'The password does not match.')
  editingId.value = post.id
  Object.assign(form,{ category:post.category,title:post.title,author:post.author,content:post.content,password:post.password })
  selectedPost.value = null
  writeOpen.value = true
}
function remove(post){
  const password = prompt(props.language === 'KO' ? '삭제 비밀번호를 입력하세요.' : 'Enter the delete password.')
  if(password !== post.password) return alert(props.language === 'KO' ? '비밀번호가 일치하지 않습니다.' : 'The password does not match.')
  if(confirm(props.language === 'KO' ? '삭제하시겠습니까?' : 'Delete this post?')){ removePost(post.id); selectedPost.value = null }
}
const formatDate = (value) => value ? new Date(value).toLocaleDateString(props.language === 'KO' ? 'ko-KR' : 'en-US') : ''
</script>

<template>
<section class="page"><div class="container">
  <div class="page-head"><div><div class="eyebrow">COMMUNITY</div><h1>{{ props.language === 'KO' ? '부산 게시판' : 'Busan Board' }}</h1><p>{{ props.language === 'KO' ? '게시글 작성·상세·수정·삭제와 북마크가 동작합니다.' : 'Create, view, edit, delete, and bookmark posts.' }}</p></div><button class="btn primary" @click="openWrite">+ {{ props.language === 'KO' ? '새 글 작성' : 'New Post' }}</button></div>
  <div class="panel">
    <div class="toolbar"><input class="input grow" v-model="query" :placeholder="props.language === 'KO' ? '제목, 내용, 작성자를 검색하세요' : 'Search title, content, or author'"><select class="input" v-model="category"><option value="전체">{{ props.language === 'KO' ? '전체' : 'All' }}</option><option v-for="item in categories">{{ item }}</option></select></div>
    <div class="board-head"><div>{{ props.language === 'KO' ? '번호' : 'No.' }}</div><div>{{ props.language === 'KO' ? '분류' : 'Category' }}</div><div>{{ props.language === 'KO' ? '제목' : 'Title' }}</div><div>{{ props.language === 'KO' ? '작성자' : 'Author' }}</div><div>{{ props.language === 'KO' ? '조회' : 'Views' }}</div><div>{{ props.language === 'KO' ? '좋아요' : 'Likes' }}</div></div>
    <div class="post-row" v-for="(post,index) in filteredPosts" :key="post.id">
      <div class="meta">{{ filteredPosts.length-index }}</div><div class="post-category">{{ post.category }}</div>
      <div><div class="post-title" @click="openPost(post)">{{ post.title }}</div><div class="meta">{{ formatDate(post.createdAt) }}</div></div>
      <div class="meta">{{ post.author }}</div><div class="meta">{{ post.views||0 }}</div><div class="meta">♥ {{ post.likes||0 }}</div>
    </div>
    <div class="empty" v-if="!filteredPosts.length">{{ props.language === 'KO' ? '검색 결과가 없습니다.' : 'No results found.' }}</div>
  </div>
</div></section>

<div class="modal" v-if="writeOpen" @click.self="writeOpen=false">
  <div class="modal-card"><h2>{{ editingId ? (props.language === 'KO' ? '게시글 수정' : 'Edit Post') : (props.language === 'KO' ? '새 게시글 작성' : 'New Post') }}</h2>
    <div class="form-grid"><select class="input" v-model="form.category"><option v-for="item in categories">{{ item }}</option></select><input class="input" v-model.trim="form.title" :placeholder="props.language === 'KO' ? '제목' : 'Title'"><input class="input" v-model.trim="form.author" :placeholder="props.language === 'KO' ? '작성자' : 'Author'"><textarea class="input" v-model.trim="form.content" :placeholder="props.language === 'KO' ? '내용' : 'Content'"></textarea><input class="input" type="password" v-model="form.password" :placeholder="props.language === 'KO' ? '수정·삭제 비밀번호' : 'Edit/Delete password'"></div>
    <div class="modal-actions"><button class="btn ghost" @click="writeOpen=false">{{ props.language === 'KO' ? '취소' : 'Cancel' }}</button><button class="btn primary" @click="save">{{ props.language === 'KO' ? '저장' : 'Save' }}</button></div>
  </div>
</div>

<div class="modal" v-if="selectedPost" @click.self="selectedPost=null">
  <div class="modal-card"><span class="post-category">{{ selectedPost.category }}</span><h2>{{ selectedPost.title }}</h2><div class="meta">{{ selectedPost.author }} · {{ formatDate(selectedPost.createdAt) }} · {{ props.language === 'KO' ? '조회' : 'Views' }} {{ selectedPost.views }}</div><div class="detail-body">{{ selectedPost.content }}</div>
    <div class="modal-actions between"><div><button class="btn ghost small" @click="likePost(selectedPost)">♥ {{ props.language === 'KO' ? '좋아요' : 'Like' }} {{ selectedPost.likes }}</button><button class="btn ghost small" @click="toggleBookmark(selectedPost)">{{ selectedPost.bookmarked ? (props.language === 'KO' ? '★ 북마크 해제' : '★ Remove Bookmark') : (props.language === 'KO' ? '☆ 북마크' : '☆ Bookmark') }}</button></div><div><button class="btn ghost small" @click="edit(selectedPost)">{{ props.language === 'KO' ? '수정' : 'Edit' }}</button><button class="btn danger small" @click="remove(selectedPost)">{{ props.language === 'KO' ? '삭제' : 'Delete' }}</button></div></div>
  </div>
</div>
</template>

<style scoped>
.toolbar{padding:17px;display:flex;gap:10px;border-bottom:1px solid var(--line)}.grow{flex:1}.board-head,.post-row{display:grid;grid-template-columns:64px 110px 1fr 110px 75px 75px;gap:12px;align-items:center;padding:15px 18px}.board-head{background:#fafbfc;color:var(--muted);font-size:12px;font-weight:900}.post-row{border-top:1px solid var(--line)}.post-title{font-weight:850;cursor:pointer}.post-title:hover{color:var(--magenta)}.meta{font-size:13px;color:var(--muted)}.post-category{padding:6px 8px;border-radius:999px;background:var(--cyan-soft);color:var(--cyan-deep);font-size:11px;font-weight:900;text-align:center}.modal{position:fixed;inset:0;background:rgba(15,27,46,.58);z-index:2000;display:grid;place-items:center;padding:20px}.modal-card{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:22px;padding:26px}.modal-card h2{margin:14px 0}.form-grid{display:grid;gap:13px}textarea{min-height:170px;resize:vertical}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.between{justify-content:space-between}.detail-body{white-space:pre-wrap;line-height:1.8;padding:18px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:16px 0}@media(max-width:760px){.board-head{display:none}.post-row{grid-template-columns:1fr}.post-row>*:first-child{display:none}}
</style>
