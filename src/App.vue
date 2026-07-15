<script setup>
import ChatBot from './components/ChatBot.vue'
</script>

<template>
  <div class="layout">
    <header class="site-header">
      <RouterLink class="logo" to="/">
        Local<span>Hub</span><small>BUSAN</small>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/">홈</RouterLink>
        <RouterLink to="/board">부산 게시판</RouterLink>
        <RouterLink to="/map">지도</RouterLink>
        <RouterLink to="/dashboard">대시보드</RouterLink>
        <RouterLink to="/calendar">축제 캘린더</RouterLink>
        <RouterLink to="/bookmarks">북마크</RouterLink>
      </nav>

      <RouterLink class="btn primary small" to="/board?write=1">글쓰기</RouterLink>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      이 서비스는 한국관광공사 TourAPI 4.0 데이터를 활용했습니다.<br />
      출처: 한국관광공사 · 공공누리 제3유형
    </footer>

    <ChatBot />
  </div>
</template>
