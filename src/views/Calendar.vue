<script setup>
import { computed, ref } from 'vue'
import { useLocalHub } from '../stores/localhub'

const { tourData } = useLocalHub()
const year = ref(2026)
const month = ref(7)
const selected = ref(null)

const festivals = computed(() => [...tourData['축제/공연/행사']].sort((a,b)=>(b.modified||'').localeCompare(a.modified||'')))
const cells = computed(() => {
  const first = new Date(year.value,month.value,1)
  const last = new Date(year.value,month.value+1,0)
  const previousLast = new Date(year.value,month.value,0).getDate()
  const result=[]
  for(let i=first.getDay()-1;i>=0;i--) result.push({day:previousLast-i,current:false,events:[]})
  for(let day=1;day<=last.getDate();day++){
    const key = `${year.value}${String(month.value+1).padStart(2,'0')}${String(day).padStart(2,'0')}`
    result.push({day,current:true,events:festivals.value.filter((event)=>event.start===key)})
  }
  let next=1
  while(result.length%7) result.push({day:next++,current:false,events:[]})
  return result
})
function move(amount){ month.value += amount;if(month.value<0){month.value=11;year.value--}if(month.value>11){month.value=0;year.value++} }
const formatDate=(value)=>value?.length===8?`${value.slice(0,4)}.${value.slice(4,6)}.${value.slice(6,8)}`:'미정'
</script>

<template>
<section class="page"><div class="container">
  <div class="page-head"><div><div class="eyebrow">FESTIVAL CALENDAR</div><h1>축제 캘린더</h1><p>행사 날짜, 장소, 갱신일 정보를 확인합니다.</p></div></div>
  <div class="panel calendar-shell"><div class="calendar-top"><button class="btn ghost small" @click="move(-1)">‹ 이전</button><h3>{{ year }}년 {{ month+1 }}월</h3><button class="btn ghost small" @click="move(1)">다음 ›</button></div>
    <div class="calendar-grid"><div class="day-name" v-for="day in ['일','월','화','수','목','금','토']">{{ day }}</div><div class="cell" :class="{muted:!cell.current}" v-for="cell in cells"><b>{{ cell.day }}</b><button class="event" v-for="event in cell.events.slice(0,3)" @click="selected=event">{{ event.title }}</button></div></div>
  </div>
  <div class="panel festival-list"><div class="festival-row" v-for="event in festivals.slice(0,30)" @click="selected=event"><span class="badge">{{ formatDate(event.start) }}</span><div><strong>{{ event.title }}</strong><div class="meta">{{ event.address }}</div></div><div class="meta">{{ event.place||'장소 정보 없음' }}</div><div class="meta">갱신 {{ formatDate(event.modified?.slice(0,8)) }}</div></div></div>
</div></section>
<div class="modal" v-if="selected" @click.self="selected=null"><div class="modal-card"><span class="badge">{{ formatDate(selected.start) }} ~ {{ formatDate(selected.end) }}</span><h2>{{ selected.title }}</h2><p><b>장소</b> {{ selected.place||selected.address||'정보 없음' }}</p><p><b>시간</b> {{ selected.playtime||'정보 없음' }}</p><p><b>주소</b> {{ selected.address||'정보 없음' }}</p><button class="btn primary" @click="selected=null">확인</button></div></div>
</template>

<style scoped>
.calendar-shell{padding:20px}.calendar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);border-top:1px solid var(--line);border-left:1px solid var(--line)}.day-name,.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.day-name{padding:10px;text-align:center;background:#fafbfc;color:var(--muted)}.cell{min-height:126px;padding:8px}.cell.muted{background:#fafafa;color:#aaa}.event{display:block;width:100%;border:0;text-align:left;padding:6px;border-radius:8px;background:linear-gradient(135deg,var(--magenta-soft),var(--cyan-soft));font-size:10px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.festival-list{margin-top:16px}.festival-row{padding:16px 18px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:130px 1fr 180px 140px;gap:14px;cursor:pointer}.meta{font-size:13px;color:var(--muted)}.modal{position:fixed;inset:0;background:rgba(15,27,46,.58);z-index:2000;display:grid;place-items:center}.modal-card{width:min(620px,calc(100% - 32px));background:#fff;border-radius:22px;padding:26px}.modal-card h2{margin:14px 0}@media(max-width:760px){.cell{min-height:90px}.festival-row{grid-template-columns:1fr}}
</style>
