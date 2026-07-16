<script setup>
import { computed, ref } from 'vue'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({ language: { type: String, default: 'KO' } })
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
const formatDate=(value)=>value?.length===8?`${value.slice(0,4)}.${value.slice(4,6)}.${value.slice(6,8)}`:(props.language === 'KO' ? '미정' : 'TBD')
</script>

<template>
<section class="page"><div class="container">
  <div class="page-head"><div><div class="eyebrow">FESTIVAL CALENDAR</div><h1>{{ props.language === 'KO' ? '축제 캘린더' : 'Festival Calendar' }}</h1><p>{{ props.language === 'KO' ? '행사 날짜, 장소, 갱신일 정보를 확인합니다.' : 'Check event dates, locations, and update information.' }}</p></div></div>
  <div class="panel calendar-shell"><div class="calendar-top"><button class="btn ghost small" @click="move(-1)">‹ {{ props.language === 'KO' ? '이전' : 'Previous' }}</button><h3>{{ props.language === 'KO' ? `${year}년 ${month+1}월` : `${month+1}/${year}` }}</h3><button class="btn ghost small" @click="move(1)">{{ props.language === 'KO' ? '다음' : 'Next' }} ›</button></div>
    <div class="wave-bg" aria-hidden>
      <svg class="wave wave1" viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stop-color="#a7e9ff"/>
            <stop offset="1" stop-color="#3bb0ff"/>
          </linearGradient>
        </defs>
        <path d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100 L1200,200 L0,200 Z" fill="url(#g1)" />
      </svg>
      <svg class="wave wave2" viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,120 C200,20 400,220 600,120 C800,20 1000,220 1200,120 L1200,200 L0,200 Z" fill="rgba(59,176,255,0.12)" />
      </svg>
    </div>
    <div class="calendar-grid"><div class="day-name" v-for="day in (props.language === 'KO' ? ['일','월','화','수','목','금','토'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])">{{ day }}</div><div class="cell" :class="{muted:!cell.current}" v-for="cell in cells"><b>{{ cell.day }}</b><button class="event" v-for="event in cell.events.slice(0,3)" @click="selected=event">{{ event.title }}</button></div></div>
  </div>
  <div class="panel festival-list"><div class="festival-row" v-for="event in festivals.slice(0,30)" @click="selected=event"><span class="badge">{{ formatDate(event.start) }}</span><div><strong>{{ event.title }}</strong><div class="meta">{{ event.address }}</div></div><div class="meta">{{ event.place || (props.language === 'KO' ? '장소 정보 없음' : 'No venue information') }}</div><div class="meta">{{ props.language === 'KO' ? '갱신' : 'Updated' }} {{ formatDate(event.modified?.slice(0,8)) }}</div></div></div>
</div></section>
<div class="modal" v-if="selected" @click.self="selected=null"><div class="modal-card"><span class="badge">{{ formatDate(selected.start) }} ~ {{ formatDate(selected.end) }}</span><h2>{{ selected.title }}</h2><p><b>{{ props.language === 'KO' ? '장소' : 'Venue' }}</b> {{ selected.place||selected.address||(props.language === 'KO' ? '정보 없음' : 'No information') }}</p><p><b>{{ props.language === 'KO' ? '시간' : 'Time' }}</b> {{ selected.playtime||(props.language === 'KO' ? '정보 없음' : 'No information') }}</p><p><b>{{ props.language === 'KO' ? '주소' : 'Address' }}</b> {{ selected.address||(props.language === 'KO' ? '정보 없음' : 'No information') }}</p><button class="btn primary" @click="selected=null">{{ props.language === 'KO' ? '확인' : 'Close' }}</button></div></div>
</template>

<style scoped>
.calendar-shell{
  padding:24px;
  background:linear-gradient(180deg,#eef9ff,#fbfdff);
  border-radius:14px;
  box-shadow:0 8px 20px rgba(20,30,60,0.06);
}
.calendar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.calendar-top h3{margin:0;font-size:18px;font-weight:700}
.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;background:transparent}
.calendar-shell{position:relative;overflow:visible}
.calendar-top,.calendar-grid,.festival-list{position:relative;z-index:1}
.wave-bg{position:absolute;left:0;right:0;bottom:-10px;height:160px;pointer-events:none;overflow:hidden;z-index:0}
.wave{position:absolute;left:50%;transform:translateX(-50%);width:220%;height:160px}
.wave1{opacity:0.95;animation:wave1 14s ease-in-out infinite}
.wave2{opacity:0.6;bottom:8px;animation:wave2 20s linear infinite reverse}
@keyframes wave1{0%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-48%) translateY(8px)}100%{transform:translateX(-50%) translateY(0)}}
@keyframes wave2{0%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-52%) translateY(6px)}100%{transform:translateX(-50%) translateY(0)}}
.day-name{padding:10px 6px;text-align:center;background:linear-gradient(90deg,#fbfbff,#f5f8ff);color:var(--muted);font-weight:700;border-radius:10px;font-size:13px}
.cell{min-height:120px;padding:10px;background:linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.94));border-radius:10px;position:relative;overflow:hidden;border:1px solid rgba(6,18,39,0.04)}
.cell.muted{background:rgba(245,247,250,0.92);color:var(--muted)}
.cell b{display:inline-block;padding:6px 8px;border-radius:8px;color:var(--muted);font-weight:700}
.cell .today{background:var(--accent);color:#fff}
.cell:hover{transform:translateY(-4px);transition:all .18s ease;box-shadow:0 10px 30px rgba(20,30,60,0.06)}
.event{display:-webkit-box;margin-top:8px;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg,#e8f7ff,#dff6ff);color:#022033;font-weight:700;font-size:13px;border:1px solid rgba(3,60,90,0.08);box-shadow:0 6px 18px rgba(3,60,90,0.06);overflow:hidden;text-overflow:ellipsis;white-space:normal;-webkit-line-clamp:2;-webkit-box-orient:vertical;position:relative}
.event:before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;background-image:url('https://www.transparenttextures.com/patterns/asfalt-light.png');opacity:0.08;mix-blend-mode:overlay}
.event:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(20,40,80,0.10)}
.festival-list{margin-top:18px}
.festival-row{padding:14px;border-radius:12px;display:grid;grid-template-columns:120px 1fr 160px 140px;gap:12px;align-items:center;cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,250,0.96));border:1px solid rgba(6,18,39,0.06);backdrop-filter:blur(6px);box-shadow:0 10px 26px rgba(6,18,39,0.05)}
.festival-row strong{display:-webkit-box;font-size:15px;margin-bottom:6px;line-height:1.25;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;color:#062230;font-weight:700}
.festival-row .meta{min-width:0;overflow:hidden;text-overflow:ellipsis}
.festival-row + .festival-row{margin-top:10px}
.festival-row:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(20,30,60,0.08)}

/* subtle tint variations */
.festival-list .festival-row:nth-child(5n+1){background:linear-gradient(180deg,rgba(255,235,242,0.6),rgba(255,255,255,0.94))}
.festival-list .festival-row:nth-child(5n+2){background:linear-gradient(180deg,rgba(226,249,255,0.6),rgba(255,255,255,0.94))}
.festival-list .festival-row:nth-child(5n+3){background:linear-gradient(180deg,rgba(240,255,236,0.6),rgba(255,255,255,0.94))}
.festival-list .festival-row:nth-child(5n+4){background:linear-gradient(180deg,rgba(244,240,255,0.6),rgba(255,255,255,0.94))}
.festival-list .festival-row:nth-child(5n+5){background:linear-gradient(180deg,rgba(255,250,235,0.6),rgba(255,255,255,0.94))}

@media(max-width:760px){.event{backdrop-filter:none;background:#fff}.festival-row{backdrop-filter:none;background:#fff}}

/* festival-row subtle patterned overlays */
.festival-list .festival-row{position:relative;overflow:hidden}
.festival-list .festival-row:before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;opacity:0.10;background-repeat:repeat;background-size:64px 64px}
.festival-list .festival-row:nth-child(5n+1):before{background-image:url('https://www.transparenttextures.com/patterns/asfalt-light.png')}
.festival-list .festival-row:nth-child(5n+2):before{background-image:url('https://www.transparenttextures.com/patterns/diagmonds.png')}
.festival-list .festival-row:nth-child(5n+3):before{background-image:url('https://www.transparenttextures.com/patterns/pw_maze_white.png')}
.festival-list .festival-row:nth-child(5n+4):before{background-image:url('https://www.transparenttextures.com/patterns/vertical-linen.png')}
.festival-list .festival-row:nth-child(5n+5):before{background-image:url('https://www.transparenttextures.com/patterns/az_subtle.png')}

/* smoother hover transitions */
.festival-row,.event,.menu-card{transition:transform .36s cubic-bezier(.22,.9,.35,1),box-shadow .36s cubic-bezier(.22,.9,.35,1),opacity .36s}
.badge{background:linear-gradient(90deg,#eef6ff,#f0fff7);padding:6px 10px;border-radius:10px;font-weight:700;color:var(--muted);display:inline-block}
.meta{font-size:13px;color:var(--muted)}
.modal{position:fixed;inset:0;background:linear-gradient(rgba(6,18,39,0.48),rgba(6,18,39,0.48));z-index:2000;display:grid;place-items:center;padding:20px}
.modal-card{width:min(660px,calc(100% - 32px));background:#fff;border-radius:18px;padding:28px;box-shadow:0 20px 60px rgba(6,18,39,0.16)}
.modal-card h2{margin:14px 0}
@media(max-width:760px){.cell{min-height:90px}.festival-row{grid-template-columns:1fr;gap:8px}}
</style>

<style scoped>
/* Calendar overrides: boost contrast for readability */
.page-head p{color:rgba(6,18,39,0.8);font-size:15px}
.day-name{color:rgba(6,18,39,0.65)}
.cell b{color:rgba(3,60,90,0.9);background:transparent;padding:4px 6px}
.event{color:#022033}
.festival-row strong{color:#022033}

@media(max-width:760px){
  .cell b{font-size:14px}
}
</style>
