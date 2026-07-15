<script setup>
import ChatBot from './components/ChatBot.vue'
</script>

<template>
  <div class="layout">
    <div class="bg-layer bg-sea" aria-hidden></div>
    <div class="bg-layer bg-waves" aria-hidden></div>
    <div class="bg-layer bg-wind" aria-hidden></div>
    <!-- five seagulls: using simpler 'M' curve wings like initial design, with full-viewport paths -->
    <div class="seagull g1" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M10 40 C28 20 48 18 62 28 C78 18 98 20 116 40" />
        </g>
      </svg>
    </div>
    <div class="seagull g2" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M12 38 C30 18 52 16 66 28 C82 16 100 18 118 38" />
        </g>
      </svg>
    </div>
    <div class="seagull g3" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M8 36 C26 16 46 14 60 26 C76 14 96 16 114 36" />
        </g>
      </svg>
    </div>
    <div class="seagull g4" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M10 42 C28 24 50 22 64 34 C80 22 100 24 118 42" />
        </g>
      </svg>
    </div>
    <div class="seagull g5" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M12 40 C30 22 52 20 68 32 C84 20 104 22 120 40" />
        </g>
      </svg>
    </div>
    <div class="seagull g6" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M10 38 C28 20 50 18 66 30 C82 18 100 20 118 38" />
        </g>
      </svg>
    </div>
    <div class="seagull g7" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M12 36 C30 16 52 14 68 26 C84 14 104 16 120 36" />
        </g>
      </svg>
    </div>
    <div class="seagull g8" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M8 40 C26 22 46 20 62 32 C78 20 98 22 116 40" />
        </g>
      </svg>
    </div>
    <div class="seagull g9" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M10 42 C30 26 52 24 68 36 C84 24 104 26 120 42" />
        </g>
      </svg>
    </div>
    <div class="seagull g10" aria-hidden>
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path class="wing" d="M12 38 C32 20 54 18 70 30 C86 18 106 20 122 38" />
        </g>
      </svg>
    </div>
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

<style>
:root{--sea-1:#bfefff;--sea-2:#57b6ff;--pink:#ffd7e6}
.layout{position:relative;min-height:100vh;background-color:transparent}
.bg-layer{position:fixed;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:0}
/* Base soft gradient (sky blue + light pink) */
.bg-sea{background:linear-gradient(180deg,rgba(6,18,39,0.36),rgba(255,218,235,0.12),rgba(93,177,255,0.12)),url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');background-size:cover;background-position:center center;opacity:0.98;filter:blur(0.6px)}
/* Large, soft wave SVG overlay near bottom to suggest gentle sea */
.bg-waves{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 240'><defs><linearGradient id='wg' x1='0' x2='1'><stop offset='0' stop-color='%23ffffff' stop-opacity='0.06'/><stop offset='1' stop-color='%23ffffff' stop-opacity='0.03'/></linearGradient></defs><path d='M0,140 C180,80 360,200 600,140 C840,80 1020,200 1200,140 L1200,240 L0,240 Z' fill='url(%23wg)'/></svg>");background-position:center bottom;background-repeat:no-repeat;background-size:cover;opacity:0.45;filter:blur(6px);transform:translateZ(0);animation:slowFloat 28s ease-in-out infinite}
/* Subtle sky/pink wash moving slowly for depth */
.bg-wind{background:linear-gradient(120deg,rgba(255,210,230,0.04),rgba(160,220,255,0.04));opacity:0.8;mix-blend-mode:screen;filter:blur(2px);animation:windDrift 40s linear infinite}

@keyframes slowFloat{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
@keyframes windDrift{0%{background-position:0 0}100%{background-position:1000px 0}}

/* ensure main content stacks above bg layers */
header.site-header,main,footer.site-footer,.chatbot{position:relative;z-index:2}

/* seagull animation */
.seagull{position:fixed;left:-200px;width:120px;height:60px;z-index:3;pointer-events:none;opacity:0.98;transform:translateZ(0);filter:drop-shadow(0 8px 18px rgba(0,0,0,0.08))}
.seagull svg{width:100%;height:100%;display:block}
.seagull .wing{transform-origin:50% 50%;stroke:#ffffffcc}

/* individual variations with full-viewport natural paths */
.seagull.g1{animation:fly1 20s linear infinite;transform-origin:center}
.seagull.g2{animation:fly2 26s linear .9s infinite;transform-origin:center}
.seagull.g3{animation:fly3 18s linear 1.6s infinite;transform-origin:center}
.seagull.g4{animation:fly4 24s linear .4s infinite;transform-origin:center}
.seagull.g5{animation:fly5 22s linear 2.2s infinite;transform-origin:center}
.seagull.g6{animation:fly2 30s linear .2s infinite;transform-origin:center}
.seagull.g7{animation:fly3 19s linear .7s infinite;transform-origin:center}
.seagull.g8{animation:fly4 26s linear 1.1s infinite;transform-origin:center}
.seagull.g9{animation:fly5 21s linear .5s infinite;transform-origin:center}
.seagull.g10{animation:fly1 24s linear 1.9s infinite;transform-origin:center}

@keyframes flap{0%{transform:rotate(0deg)}45%{transform:rotate(16deg)}55%{transform:rotate(6deg)}100%{transform:rotate(0deg)}}

@keyframes fly1{0%{transform:translate(-20vw,10vh) scale(1) rotate(0deg)}25%{transform:translate(10vw,4vh) scale(.98) rotate(-6deg)}50%{transform:translate(48vw,0vh) scale(1) rotate(0deg)}75%{transform:translate(86vw,6vh) scale(.98) rotate(6deg)}100%{transform:translate(120vw,12vh) scale(1) rotate(0deg)}}
@keyframes fly2{0%{transform:translate(-24vw,20vh) scale(.9) rotate(0deg)}20%{transform:translate(8vw,14vh) scale(.92) rotate(-4deg)}50%{transform:translate(52vw,8vh) scale(.9) rotate(0deg)}80%{transform:translate(84vw,16vh) scale(.92) rotate(4deg)}100%{transform:translate(120vw,22vh) scale(.9) rotate(0deg)}}
@keyframes fly3{0%{transform:translate(-22vw,6vh) scale(.95) rotate(0deg)}30%{transform:translate(16vw,-4vh) scale(.97) rotate(-8deg)}55%{transform:translate(50vw,-8vh) scale(.95) rotate(0deg)}78%{transform:translate(78vw,2vh) scale(.97) rotate(8deg)}100%{transform:translate(120vw,8vh) scale(.95) rotate(0deg)}}
@keyframes fly4{0%{transform:translate(-18vw,30vh) scale(.8) rotate(0deg)}28%{transform:translate(14vw,22vh) scale(.82) rotate(-6deg)}56%{transform:translate(46vw,14vh) scale(.8) rotate(0deg)}82%{transform:translate(80vw,24vh) scale(.82) rotate(6deg)}100%{transform:translate(120vw,30vh) scale(.8) rotate(0deg)}}
@keyframes fly5{0%{transform:translate(-26vw,2vh) scale(.75) rotate(0deg)}26%{transform:translate(12vw,-2vh) scale(.78) rotate(-6deg)}54%{transform:translate(44vw,-6vh) scale(.75) rotate(0deg)}76%{transform:translate(76vw,-1vh) scale(.78) rotate(6deg)}100%{transform:translate(120vw,4vh) scale(.75) rotate(0deg)}}
</style>
