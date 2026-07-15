<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useLocalHub } from '../stores/localhub'

const { posts, totals, totalViews, totalLikes } = useLocalHub()
const categories = ['음식점','축제/공연/행사','문화시설','레포츠','숙박','쇼핑','여행코스']
const boardCategories = ['여행질문','맛집후기','축제정보','자유게시판']
const totalTourCount = computed(() => Object.values(totals).reduce((sum,value) => sum + Number(value||0),0))
let categoryChart
let boardChart
const formatNumber = (value) => Number(value||0).toLocaleString('ko-KR')

onMounted(() => nextTick(() => {
  categoryChart = new Chart(document.getElementById('categoryChart'),{
    type:'bar',
    data:{ labels:categories,datasets:[{data:categories.map((category)=>totals[category]||0),backgroundColor:['#d4146a','#00a9ce','#7c3aed','#0ea5e9','#f59e0b','#ec4899','#10b981']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}
  })
  boardChart = new Chart(document.getElementById('boardChart'),{
    type:'doughnut',
    data:{labels:boardCategories,datasets:[{data:boardCategories.map((category)=>posts.filter((post)=>post.category===category).length),backgroundColor:['#d4146a','#00a9ce','#8b5cf6','#f59e0b']}]},
    options:{responsive:true,maintainAspectRatio:false}
  })
}))
onBeforeUnmount(() => { categoryChart?.destroy(); boardChart?.destroy() })
</script>

<template>
<section class="page"><div class="container">
  <div class="page-head"><div><div class="eyebrow">DASHBOARD</div><h1>관광 데이터 · 커뮤니티 대시보드</h1><p>실제 JSON 건수와 현재 브라우저의 커뮤니티 통계를 확인합니다.</p></div></div>
  <div class="stats-grid"><div class="panel stat"><span>전체 관광 데이터</span><strong>{{ formatNumber(totalTourCount) }}</strong></div><div class="panel stat"><span>게시글</span><strong>{{ posts.length }}</strong></div><div class="panel stat"><span>누적 조회</span><strong>{{ totalViews }}</strong></div><div class="panel stat"><span>누적 좋아요</span><strong>{{ totalLikes }}</strong></div></div>
  <div class="charts"><div class="panel chart"><h3>콘텐츠 유형별 데이터 수</h3><canvas id="categoryChart"></canvas></div><div class="panel chart"><h3>커뮤니티 카테고리 비율</h3><canvas id="boardChart"></canvas></div></div>
  <div class="panel table-wrap"><table><thead><tr><th>데이터 유형</th><th>건수</th><th>표시 방식</th></tr></thead><tbody><tr v-for="category in categories"><td>{{ category }}</td><td>{{ formatNumber(totals[category]) }}</td><td>{{ category==='축제/공연/행사'?'지도 · 캘린더':'지도 · 목록' }}</td></tr></tbody></table></div>
</div></section>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat{padding:22px}.stat span{color:var(--muted);font-size:13px}.stat strong{display:block;font-size:28px;margin-top:8px}.charts{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:16px}.chart{padding:20px;height:360px}.chart h3{margin:0 0 18px}.table-wrap{margin-top:16px;overflow:hidden}table{width:100%;border-collapse:collapse}th,td{padding:13px 14px;border-bottom:1px solid var(--line);text-align:left;font-size:13px}th{background:#fafbfc;color:var(--muted)}@media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)}.charts{grid-template-columns:1fr}}@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
