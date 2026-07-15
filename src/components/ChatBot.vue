<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useLocalHub } from '../stores/localhub'

const { tourData, posts } = useLocalHub()
const botImage='https://i.namu.wiki/i/ddkilmQKKeHdFBaM-67JvtuAZ8_gyxRG1E4SvW7a6xBVLxeSemEUMcV7GfX_yI8z94wcg9N1TdXq8aRjqMwHqA.svg'
const open=ref(false),loading=ref(false),input=ref(''),box=ref(null)
const apiKey=import.meta.env.VITE_OPENAI_API_KEY
const hasApiKey=computed(()=>Boolean(apiKey))
const messages=ref([{role:'assistant',content:'안녕하세요! 부산 관광지, 축제, 숙박, 문화시설, 여행코스를 질문해주세요.'}])
const suggestions=['8월 부산 축제 알려줘','해운대 근처 숙박 추천','아이와 갈 문화시설','부산 여행코스 추천']

onMounted(()=>{const saved=localStorage.getItem('localhub-chat');if(saved)try{messages.value=JSON.parse(saved)}catch{}})
function persist(){localStorage.setItem('localhub-chat',JSON.stringify(messages.value.slice(-30)))}
function scroll(){nextTick(()=>{if(box.value)box.value.scrollTop=box.value.scrollHeight})}
function toggle(){open.value=!open.value;if(open.value)scroll()}
function clear(){if(confirm('대화를 초기화하시겠습니까?')){messages.value=[{role:'assistant',content:'대화가 초기화되었습니다.'}];persist()}}
function suggest(text){input.value=text;send()}
function context(question){
  const q=question.toLowerCase();const categories=[]
  const map={축제:'축제/공연/행사',공연:'축제/공연/행사',숙박:'숙박',호텔:'숙박',문화:'문화시설',쇼핑:'쇼핑',레포츠:'레포츠',코스:'여행코스',맛집:'음식점'}
  Object.entries(map).forEach(([word,category])=>{if(q.includes(word))categories.push(category)})
  const selected=categories.length?categories:['관광지','문화시설','축제/공연/행사','숙박','여행코스']
  const tokens=q.split(/\s+/).filter((word)=>word.length>1)
  return selected.flatMap((category)=>(tourData[category]||[]).map((item)=>({...item,score:tokens.reduce((sum,word)=>sum+(`${item.title} ${item.address} ${item.place}`.toLowerCase().includes(word)?2:0),0)}))).sort((a,b)=>b.score-a.score).slice(0,10)
}
function demoAnswer(question,items){
  if(!items.length)return '관련 정보를 찾지 못했습니다.'
  return ['첨부된 부산 관광 데이터에서 관련 정보를 찾았습니다.',...items.slice(0,5).map((item,index)=>`${index+1}. ${item.title} — ${item.address||item.place||'정보 없음'}`),'','OpenAI API 키를 설정하면 더 자연스러운 답변을 받을 수 있습니다.'].join('\n')
}
async function send(){
  const question=input.value.trim();if(!question||loading.value)return
  messages.value.push({role:'user',content:question});input.value='';loading.value=true;persist();scroll()
  const items=context(question)
  if(!hasApiKey.value){setTimeout(()=>{messages.value.push({role:'assistant',content:demoAnswer(question,items)});loading.value=false;persist();scroll()},300);return}
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model:'gpt-4.1-mini',instructions:'당신은 LocalHub 부산 지역정보 챗봇입니다. 제공된 JSON 문맥만 우선 활용하고 한국어 존댓말로 간결하게 답하세요.',input:`질문: ${question}\n\n관광 데이터: ${JSON.stringify(items)}\n\n커뮤니티 글: ${JSON.stringify(posts.slice(-5))}`,max_output_tokens:500})})
    const data=await response.json();if(!response.ok)throw new Error(data?.error?.message||'API 요청 실패')
    const answer=data.output_text||data.output?.flatMap((item)=>item.content||[]).find((item)=>item.type==='output_text')?.text||'답변을 생성하지 못했습니다.'
    messages.value.push({role:'assistant',content:answer})
  }catch(error){messages.value.push({role:'assistant',content:`API 오류: ${error.message}\n\n${demoAnswer(question,items)}`})}
  finally{loading.value=false;persist();scroll()}
}
</script>

<template>
<button class="launcher" @click="toggle"><img :src="botImage" alt="챗봇"></button>
<section class="chat" v-if="open"><header><div class="brand"><img :src="botImage" alt=""><div><strong>LocalHub 부산 챗봇</strong><span>{{ hasApiKey?'OpenAI API 연결됨':'JSON 데모 응답 모드' }}</span></div></div><div><button @click="clear">↻</button><button @click="open=false">✕</button></div></header>
  <div class="messages" ref="box"><div class="row" :class="message.role" v-for="message in messages"><div class="bubble">{{ message.content }}</div></div><div class="row assistant" v-if="loading"><div class="bubble">답변을 작성하고 있습니다...</div></div></div>
  <div class="suggestions"><button v-for="item in suggestions" @click="suggest(item)">{{ item }}</button></div>
  <form @submit.prevent="send"><textarea v-model="input" @keydown.enter.exact.prevent="send" placeholder="부산 정보를 질문하세요"></textarea><button :disabled="loading||!input.trim()">전송</button></form>
</section>
</template>

<style scoped>
.launcher{position:fixed;right:24px;bottom:24px;z-index:1800;width:68px;height:68px;border:0;border-radius:24px;background:#fff;box-shadow:0 16px 42px rgba(16,37,63,.24);padding:7px}.launcher img{width:100%;height:100%}.chat{position:fixed;right:24px;bottom:104px;z-index:1900;width:min(400px,calc(100vw - 32px));height:min(620px,calc(100vh - 130px));background:#fff;border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 80px rgba(16,37,63,.28);display:flex;flex-direction:column;overflow:hidden}.chat header{padding:14px 16px;background:var(--gradient);color:#fff;display:flex;justify-content:space-between}.brand{display:flex;align-items:center;gap:10px}.brand img{width:42px;height:42px;border-radius:14px;background:#fff;padding:4px}.brand strong,.brand span{display:block}.brand span{font-size:11px;margin-top:3px}.chat header button{border:0;background:rgba(255,255,255,.18);color:#fff;border-radius:9px;width:34px;height:34px;margin-left:4px}.messages{flex:1;overflow:auto;padding:16px;background:#f8fafc}.row{display:flex;margin-bottom:12px}.row.user{justify-content:flex-end}.bubble{max-width:84%;padding:11px 13px;border-radius:16px;white-space:pre-wrap;font-size:13px;line-height:1.55}.assistant .bubble{background:#fff;border:1px solid var(--line)}.user .bubble{background:var(--gradient);color:#fff}.suggestions{display:flex;gap:7px;overflow:auto;padding:10px;background:#fff}.suggestions button{white-space:nowrap;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px;font-size:11px}.chat form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}.chat textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:14px;padding:11px}.chat form button{border:0;border-radius:14px;background:var(--gradient);color:#fff;padding:0 14px}@media(max-width:760px){.chat{inset:0;width:100%;height:100%;border-radius:0}.launcher{right:16px;bottom:16px}}
</style>
