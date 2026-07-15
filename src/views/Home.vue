<script setup>
import { computed } from 'vue'
import { useLocalHub } from '../stores/localhub'

const { posts, totals, bookmarkedPosts } = useLocalHub()
const totalTourCount = computed(() => Object.values(totals).reduce((sum, value) => sum + Number(value || 0), 0))

const menus = [
  { to:'/board', icon:'📝', label:'부산 게시판', desc:'부산 이야기를 작성하고 검색하세요.' },
  { to:'/map', icon:'🗺️', label:'지도', desc:'카테고리별 관광 POI를 확인하세요.' },
  { to:'/dashboard', icon:'📊', label:'대시보드', desc:'관광 데이터와 커뮤니티 통계를 확인하세요.' },
  { to:'/calendar', icon:'📅', label:'축제 캘린더', desc:'부산 축제와 공연을 날짜별로 확인하세요.' },
  { to:'/bookmarks', icon:'🔖', label:'북마크', desc:'저장한 게시글을 한곳에서 관리하세요.' },
]
const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-box">
        <div>
          <span class="badge">부산 지역 정보 공유 커뮤니티</span>
          <h1>부산의 오늘을<br>가볍게 발견하세요.</h1>
          <p>관광지, 축제, 맛집 정보를 확인하고<br>익명으로 나만의 부산 이야기를 공유해보세요.</p>
          <div class="hero-actions">
            <RouterLink class="btn primary" to="/board">커뮤니티 둘러보기</RouterLink>
            <RouterLink class="btn ghost" to="/map">부산 지도 보기</RouterLink>
          </div>
        </div>

        <div class="busan-art">
          <div class="floating-icon icon-1"><img src="https://www.visitbusan.net/uploadImgs/files/cntnts/20191229160530047_oen" alt=""></div>
          <div class="floating-icon icon-2"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0PUKWqrERu2u3fHeE0edsuUo_JMq1o8UwhnfTims-uhSwGRC_FnFXJzc&s=10" alt=""></div>
          <div class="floating-icon icon-3"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW1gM_Fd5tZsItOEtlXKTbBKGoBkC6LflClKQY0D6zOQGFb8y8qb38duvZ&s=10" alt=""></div>
          <div class="floating-icon icon-4"><img src="https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/1e83a47661b8c45093359a24b3efa9bb552993582959eab9c527ed8314accd9e.jpg" alt=""></div>
          <div class="floating-icon icon-5"><img src="https://mblogthumb-phinf.pstatic.net/MjAyNjAzMjNfMTI4/MDAxNzc0MjQ2NzkyNDMx.MliHA6ccL4lgHqnSD1MhypaOoBmyNNyhii5fzX13T2kg.bXq0rtkoyZBeeUqJZldh6IsT97rjxzUilQL2n0SKxBkg.JPEG/SE-0a9ffe20-c15b-45be-beee-7fbb9a308e72.jpg?type=w800" alt=""></div>
        </div>
      </div>
    </div>
  </section>

  <section class="page home-page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">LOCALHUB OVERVIEW</div>
          <h2>LocalHub 주요 기능</h2>
          <p>각 카드를 누르면 새로고침 없이 해당 화면으로 이동합니다.</p>
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
        <div class="panel stat-card"><span>관광 데이터</span><strong>{{ formatNumber(totalTourCount) }}건</strong></div>
        <div class="panel stat-card"><span>커뮤니티 글</span><strong>{{ posts.length }}건</strong></div>
        <div class="panel stat-card"><span>축제·행사</span><strong>{{ totals['축제/공연/행사'] }}건</strong></div>
        <div class="panel stat-card"><span>내 북마크</span><strong>{{ bookmarkedPosts.length }}건</strong></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero{padding:46px 0 28px}.hero-box{min-height:300px;border-radius:28px;padding:46px;display:grid;grid-template-columns:1.25fr .75fr;gap:32px;align-items:center;background:radial-gradient(circle at 12% 20%,rgba(212,20,106,.14),transparent 28%),radial-gradient(circle at 88% 22%,rgba(0,169,206,.18),transparent 26%),linear-gradient(135deg,#fff4f9,#effcff);border:1px solid #efcadc;overflow:hidden;position:relative}.hero-box:after{content:"";position:absolute;right:-70px;bottom:-90px;width:260px;height:260px;border-radius:50%;background:linear-gradient(135deg,rgba(212,20,106,.12),rgba(0,169,206,.18))}.hero h1{font-size:clamp(34px,5vw,58px);line-height:1.08;margin:18px 0;letter-spacing:-2.3px}.hero p{color:var(--muted);font-size:17px;line-height:1.8;margin:0 0 28px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap}.busan-art{position:relative;width:100%;min-height:290px;z-index:2}.floating-icon{position:absolute;aspect-ratio:1/1;border-radius:24px;overflow:hidden;background:#fff;border:3px solid rgba(255,255,255,.92);box-shadow:0 18px 38px rgba(16,37,63,.18);opacity:0;animation:appear .8s cubic-bezier(.22,1.3,.36,1) forwards,bounce 3.7s ease-in-out infinite}.floating-icon img{width:100%;height:100%;object-fit:cover}.icon-1{left:2%;top:7%;width:106px;animation-delay:.1s,.9s}.icon-2{left:38%;top:0;width:112px;animation-delay:.28s,1.08s}.icon-3{right:0;top:11%;width:102px;animation-delay:.46s,1.26s}.icon-4{left:17%;bottom:0;width:108px;animation-delay:.64s,1.44s}.icon-5{right:15%;bottom:2%;width:110px;animation-delay:.82s,1.62s}@keyframes appear{from{opacity:0;transform:translateY(30px) scale(.7)}to{opacity:1;transform:none}}@keyframes bounce{0%,100%{translate:0 0}50%{translate:5px -14px;rotate:2deg}}.home-page{padding-top:10px}.menu-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.menu-card{padding:22px;border-radius:20px;background:#fff;border:1px solid var(--line);transition:.2s}.menu-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(16,37,63,.09)}.menu-icon{width:48px;height:48px;border-radius:15px;background:linear-gradient(135deg,var(--magenta-soft),var(--cyan-soft));display:grid;place-items:center;font-size:23px}.menu-card h3{margin:15px 0 8px}.menu-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}.stat-card{padding:22px}.stat-card span{color:var(--muted);font-size:13px}.stat-card strong{display:block;font-size:28px;margin-top:8px}@media(max-width:950px){.menu-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.hero-box{grid-template-columns:1fr;padding:28px}.menu-grid,.stats-grid{grid-template-columns:1fr}}
</style>
