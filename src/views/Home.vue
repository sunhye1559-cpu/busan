<script setup>
import { computed } from 'vue'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({ language: { type: String, default: 'KO' } })
const { posts, totals, bookmarkedPosts } = useLocalHub()
const totalTourCount = computed(() => Object.values(totals).reduce((sum, value) => sum + Number(value || 0), 0))

const menus = computed(() => props.language === 'KO' ? [
  { to:'/board', icon:'📝', label:'부산 게시판', desc:'부산 이야기를 작성하고 검색하세요.' },
  { to:'/map', icon:'🗺️', label:'지도', desc:'카테고리별 관광 POI를 확인하세요.' },
  { to:'/dashboard', icon:'📊', label:'대시보드', desc:'관광 데이터와 커뮤니티 통계를 확인하세요.' },
  { to:'/calendar', icon:'📅', label:'축제 캘린더', desc:'부산 축제와 공연을 날짜별로 확인하세요.' },
  { to:'/bookmarks', icon:'🔖', label:'북마크', desc:'저장한 게시글을 한곳에서 관리하세요.' },
] : [
  { to:'/board', icon:'📝', label:'Busan Board', desc:'Write and search stories about Busan.' },
  { to:'/map', icon:'🗺️', label:'Map', desc:'Explore tourist POIs by category.' },
  { to:'/dashboard', icon:'📊', label:'Dashboard', desc:'View tourism and community statistics.' },
  { to:'/calendar', icon:'📅', label:'Festival Calendar', desc:'Browse Busan festivals and performances by date.' },
  { to:'/bookmarks', icon:'🔖', label:'Bookmarks', desc:'Manage saved posts in one place.' },
])
const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-box">
        <div>
          <span class="badge">{{ props.language === 'KO' ? '부산 지역 정보 공유 커뮤니티' : 'Busan Local Information Community' }}</span>
          <h1 v-if="props.language === 'KO'">부산의 오늘을<br>가볍게 발견하세요.</h1><h1 v-else>Discover Busan<br>with ease today.</h1>
          <p v-if="props.language === 'KO'">관광지, 축제, 맛집 정보를 확인하고<br>익명으로 나만의 부산 이야기를 공유해보세요.</p><p v-else>Explore attractions, festivals, and restaurants,<br>then share your own Busan story anonymously.</p>
          <div class="hero-actions">
            <RouterLink class="btn primary" to="/board">{{ props.language === 'KO' ? '커뮤니티 둘러보기' : 'Explore Community' }}</RouterLink>
            <RouterLink class="btn ghost" to="/map">{{ props.language === 'KO' ? '부산 지도 보기' : 'View Busan Map' }}</RouterLink>
          </div>
        </div>

        <div class="busan-art">
          <div class="floating-icon icon-1"><img src="https://www.visitbusan.net/uploadImgs/files/cntnts/20191229160530047_oen" alt=""></div>
          <div class="floating-icon icon-2"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0PUKWqrERu2u3fHeE0edsuUo_JMq1o8UwhnfTims-uhSwGRC_FnFXJzc&s=10" alt=""></div>
          <div class="floating-icon icon-3"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW1gM_Fd5tZsItOEtlXKTbBKGoBkC6LflClKQY0D6zOQGFb8y8qb38duvZ&s=10" alt=""></div>
          <div class="floating-icon icon-4"><img src="https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/1e83a47661b8c45093359a24b3efa9bb552993582959eab9c527ed8314accd9e.jpg" alt=""></div>
          <div class="floating-icon icon-5"><img src="https://mblogthumb-phinf.pstatic.net/MjAyNjAzMjNfMTI4/MDAxNzc0MjQ2NzkyNDMx.MliHA6ccL4lgHqnSD1MhypaOoBmyNNyhii5fzX13T2kg.bXq0rtkoyZBeeUqJZldh6IsT97rjxzUilQL2n0SKxBkg.JPEG/SE-0a9ffe20-c15b-45be-beee-7fbb9a308e72.jpg?type=w800" alt=""></div>
          <div class="hero-wave-bg" aria-hidden>
            <svg class="wave wave1" viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="homeG1" x1="0" x2="1">
                  <stop offset="0" stop-color="#bfefff"/>
                  <stop offset="1" stop-color="#57b6ff"/>
                </linearGradient>
              </defs>
              <path d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100 L1200,200 L0,200 Z" fill="url(#homeG1)" />
            </svg>
            <svg class="wave wave2" viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,120 C200,20 400,220 600,120 C800,20 1000,220 1200,120 L1200,200 L0,200 Z" fill="rgba(59,176,255,0.14)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="page home-page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">LOCALHUB OVERVIEW</div>
          <h2>{{ props.language === 'KO' ? 'LocalHub 주요 기능' : 'LocalHub Features' }}</h2>
          <p>{{ props.language === 'KO' ? '각 카드를 누르면 새로고침 없이 해당 화면으로 이동합니다.' : 'Select a card to move without refreshing the page.' }}</p>
        </div>
      </div>

      <div class="menu-grid">
        <RouterLink class="menu-card" v-for="menu in menus" :key="menu.to" :to="menu.to">
          <div class="menu-icon">{{ menu.icon }}</div>
          <h3>{{ menu.label }}</h3>
          <p>{{ menu.desc }}</p>
        </RouterLink>
      </div>

      <div class="stats-grid">
        <div class="panel stat-card"><span>{{ props.language === 'KO' ? '관광 데이터' : 'Tourism Data' }}</span><strong>{{ formatNumber(totalTourCount) }}{{ props.language === 'KO' ? '건' : '' }}</strong></div>
        <div class="panel stat-card"><span>{{ props.language === 'KO' ? '커뮤니티 글' : 'Community Posts' }}</span><strong>{{ posts.length }}{{ props.language === 'KO' ? '건' : '' }}</strong></div>
        <div class="panel stat-card"><span>{{ props.language === 'KO' ? '축제·행사' : 'Festivals & Events' }}</span><strong>{{ totals['축제/공연/행사'] }}{{ props.language === 'KO' ? '건' : '' }}</strong></div>
        <div class="panel stat-card"><span>{{ props.language === 'KO' ? '내 북마크' : 'My Bookmarks' }}</span><strong>{{ bookmarkedPosts.length }}{{ props.language === 'KO' ? '건' : '' }}</strong></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero{padding:46px 0 28px}.hero-box{min-height:300px;border-radius:28px;padding:46px;display:grid;grid-template-columns:1.25fr .75fr;gap:32px;align-items:center;background:radial-gradient(circle at 12% 20%,rgba(212,20,106,.14),transparent 28%),radial-gradient(circle at 88% 22%,rgba(0,169,206,.18),transparent 26%),linear-gradient(135deg,#fff4f9,#effcff);border:1px solid #efcadc;overflow:hidden;position:relative}.hero-box:after{content:"";position:absolute;right:-70px;bottom:-90px;width:260px;height:260px;border-radius:50%;background:linear-gradient(135deg,rgba(212,20,106,.12),rgba(0,169,206,.18))}.hero h1{font-size:clamp(34px,5vw,58px);line-height:1.08;margin:18px 0;letter-spacing:-2.3px}.hero p{color:var(--muted);font-size:17px;line-height:1.8;margin:0 0 28px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap}.busan-art{position:relative;width:100%;min-height:290px;z-index:2}.floating-icon{position:absolute;aspect-ratio:1/1;border-radius:24px;overflow:hidden;background:#fff;border:3px solid rgba(255,255,255,.92);box-shadow:0 18px 38px rgba(16,37,63,.18);opacity:0;animation:appear .8s cubic-bezier(.22,1.3,.36,1) forwards,bounce 3.7s ease-in-out infinite}.floating-icon img{width:100%;height:100%;object-fit:cover}.icon-1{left:2%;top:7%;width:106px;animation-delay:.1s,.9s}.icon-2{left:38%;top:0;width:112px;animation-delay:.28s,1.08s}.icon-3{right:0;top:11%;width:102px;animation-delay:.46s,1.26s}.icon-4{left:17%;bottom:0;width:108px;animation-delay:.64s,1.44s}.icon-5{right:15%;bottom:2%;width:110px;animation-delay:.82s,1.62s}@keyframes appear{from{opacity:0;transform:translateY(30px) scale(.7)}to{opacity:1;transform:none}}@keyframes bounce{0%,100%{translate:0 0}50%{translate:5px -14px;rotate:2deg}}.home-page{padding-top:10px}.menu-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.menu-card{padding:22px;border-radius:20px;background:#fff;border:1px solid var(--line);transition:.2s}.menu-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(16,37,63,.09)}.menu-icon{width:48px;height:48px;border-radius:15px;background:linear-gradient(135deg,var(--magenta-soft),var(--cyan-soft));display:grid;place-items:center;font-size:23px}.menu-card h3{margin:15px 0 8px}.menu-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}.stat-card{padding:22px}.stat-card span{color:var(--muted);font-size:13px}.stat-card strong{display:block;font-size:28px;margin-top:8px}@media(max-width:950px){.menu-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.hero-box{grid-template-columns:1fr;padding:28px}.menu-grid,.stats-grid{grid-template-columns:1fr}}
</style>

<style scoped>
/* Final overrides: increase contrast, adjust hero spacing and stat card distinction */
.hero-box{padding:52px;grid-template-columns:1.12fr .88fr}
.hero h1{margin:12px 0 12px}
.hero p{color:rgba(6,18,39,0.86);font-size:17px;line-height:1.95;margin-bottom:16px}
.busan-art{min-height:340px;padding:18px}
.busan-art .floating-icon{transform-origin:center}

/* menu card text contrast */
.menu-card h3{color:#052738;font-weight:800;font-size:16px;margin:0 0 8px}
.menu-card p{color:rgba(6,18,39,0.7);font-size:14px;margin:0}

/* stat card stronger visual separation */
.stat-card{border-left:6px solid rgba(6,120,200,0.12);background:linear-gradient(180deg,#ffffff,#fbfdff)}
.stat-card span{color:rgba(6,18,39,0.6);font-size:13px}
.stat-card strong{color:#022033}

/* smoother hover and reduced lift */
.menu-card:hover{transform:translateY(-6px);box-shadow:0 14px 36px rgba(6,18,39,0.08)}

@media(max-width:760px){
  .hero-box{padding:28px;grid-template-columns:1fr}
  .busan-art{min-height:200px;padding:8px}
}
</style>

<style scoped>
/* Ensure floating photos sit above wave background */
.busan-art .floating-icon{z-index:5!important}
.hero-wave-bg{z-index:0!important}
</style>

<style scoped>
/* hero wave background overrides */
.hero-box{overflow:visible}
.hero-box > *{position:relative;z-index:1}
.hero-wave-bg{position:absolute;left:0;right:0;bottom:-18px;height:180px;pointer-events:none;z-index:0;overflow:hidden}
.hero-wave-bg .wave{position:absolute;left:50%;transform:translateX(-50%);width:220%;height:180px}
.hero-wave-bg .wave1{opacity:0.95;animation:homeWave1 16s ease-in-out infinite}
.hero-wave-bg .wave2{opacity:0.6;bottom:8px;animation:homeWave2 22s linear infinite reverse}
@keyframes homeWave1{0%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-48%) translateY(10px)}100%{transform:translateX(-50%) translateY(0)}}
@keyframes homeWave2{0%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-52%) translateY(6px)}100%{transform:translateX(-50%) translateY(0)}}
</style>

<style scoped>
/* Soft, blended card styles to match sea background */
.menu-card{
  padding:22px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,250,250,0.8));border:1px solid rgba(255,255,255,0.5);box-shadow:0 10px 24px rgba(16,37,63,0.06);backdrop-filter:blur(6px);transition:transform .22s ease,box-shadow .22s ease}
.menu-card:hover{transform:translateY(-6px);box-shadow:0 18px 36px rgba(16,37,63,0.10)}
.menu-grid .menu-card:nth-child(1){background:linear-gradient(180deg,rgba(255,235,242,0.62),rgba(255,255,255,0.92))}
.menu-grid .menu-card:nth-child(2){background:linear-gradient(180deg,rgba(226,249,255,0.62),rgba(255,255,255,0.92))}
.menu-grid .menu-card:nth-child(3){background:linear-gradient(180deg,rgba(240,255,236,0.62),rgba(255,255,255,0.92))}
.menu-grid .menu-card:nth-child(4){background:linear-gradient(180deg,rgba(244,240,255,0.62),rgba(255,255,255,0.92))}
.menu-grid .menu-card:nth-child(5){background:linear-gradient(180deg,rgba(255,250,235,0.62),rgba(255,255,255,0.92))}

.stat-card{padding:20px;border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.92));border:1px solid rgba(255,255,255,0.55);backdrop-filter:blur(8px);box-shadow:0 8px 20px rgba(16,37,63,0.05)}
.stats-grid .stat-card strong{font-size:28px}

/* subtle blending on festival rows */
.festival-row{background:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,250,250,0.85));backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.45)}

@media(max-width:760px){
  .menu-card{backdrop-filter:none;background:#fff}
  .stat-card{backdrop-filter:none;background:#fff}
}
</style>

<style scoped>
/* noise overlays for menu cards and subtle adjustments */
.menu-card{position:relative;overflow:hidden}
.menu-card:before{content:"";position:absolute;inset:0;border-radius:18px;pointer-events:none;opacity:0.06;background-repeat:repeat;background-size:48px 48px;mix-blend-mode:overlay;background-image:url('https://www.transparenttextures.com/patterns/asfalt-light.png')}
.menu-card:nth-child(1):before{background-image:url('https://www.transparenttextures.com/patterns/asfalt-light.png')}
.menu-card:nth-child(2):before{background-image:url('https://www.transparenttextures.com/patterns/diagmonds.png')}
.menu-card:nth-child(3):before{background-image:url('https://www.transparenttextures.com/patterns/pw_maze_white.png')}
.menu-card:nth-child(4):before{background-image:url('https://www.transparenttextures.com/patterns/vertical-linen.png')}
.menu-card:nth-child(5):before{background-image:url('https://www.transparenttextures.com/patterns/az_subtle.png')}

/* smoother hover for menu cards */
.menu-card{transition:transform .36s cubic-bezier(.22,.9,.35,1),box-shadow .36s cubic-bezier(.22,.9,.35,1)}

@media(max-width:760px){.menu-card:before{display:none}}
</style>

