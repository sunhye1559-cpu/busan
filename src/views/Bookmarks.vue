<script setup>
import { useLocalHub } from '../stores/localhub'
const props = defineProps({ language: { type: String, default: 'KO' } })
const { bookmarkedPosts, toggleBookmark, incrementView } = useLocalHub()
</script>

<template>
<section class="page"><div class="container">
  <div class="page-head"><div><div class="eyebrow">BOOKMARKS</div><h1>{{ props.language === 'KO' ? '북마크' : 'Bookmarks' }}</h1><p>{{ props.language === 'KO' ? '저장한 게시글은 localStorage에 유지됩니다.' : 'Saved posts remain in localStorage.' }}</p></div></div>
  <div class="grid" v-if="bookmarkedPosts.length"><article class="panel card" v-for="post in bookmarkedPosts"><span class="badge">{{ post.category }}</span><h3>{{ post.title }}</h3><p>{{ post.content.slice(0,100) }}{{ post.content.length>100?'…':'' }}</p><div class="actions"><RouterLink class="btn ghost small" to="/board" @click="incrementView(post)">{{ props.language === 'KO' ? '게시판 이동' : 'Go to Board' }}</RouterLink><button class="btn danger small" @click="toggleBookmark(post)">{{ props.language === 'KO' ? '북마크 제거' : 'Remove Bookmark' }}</button></div></article></div>
  <div class="panel empty" v-else>{{ props.language === 'KO' ? '북마크한 게시글이 없습니다.' : 'No bookmarked posts.' }}<br><RouterLink class="btn primary small" to="/board">{{ props.language === 'KO' ? '게시판으로 이동' : 'Go to Board' }}</RouterLink></div>
</div></section>
</template>

<style scoped>
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{padding:20px}.card h3{margin:12px 0}.card p{color:var(--muted);font-size:13px;line-height:1.6;min-height:42px}.actions{display:flex;gap:8px}@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.grid{grid-template-columns:1fr}}
</style>
