<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({
  language: {
    type: String,
    default: 'KO',
  },
})

const { posts, totals, bookmarkedPosts, tourData } = useLocalHub()

const now = ref(new Date())
const recommendationIndex = ref(0)

const weather = ref(null)
const weatherLoading = ref(true)
const weatherError = ref(false)

let clockTimer

const totalTourCount = computed(() =>
  Object.values(totals).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  ),
)

const menus = computed(() => [
  {
    to: '/board',
    icon: '📝',
    label: props.language === 'KO' ? '부산 게시판' : 'Busan Board',
    desc:
      props.language === 'KO'
        ? '부산 이야기를 작성하고 검색하세요.'
        : 'Write and search for stories about Busan.',
  },
  {
    to: '/map',
    icon: '🗺️',
    label: props.language === 'KO' ? '지도' : 'Map',
    desc:
      props.language === 'KO'
        ? '카테고리별 관광 POI를 확인하세요.'
        : 'Explore tourist POIs by category.',
  },
  {
    to: '/dashboard',
    icon: '📊',
    label: props.language === 'KO' ? '대시보드' : 'Dashboard',
    desc:
      props.language === 'KO'
        ? '관광 데이터와 커뮤니티 통계를 확인하세요.'
        : 'View tourism and community statistics.',
  },
  {
    to: '/calendar',
    icon: '📅',
    label:
      props.language === 'KO'
        ? '축제 캘린더'
        : 'Festival Calendar',
    desc:
      props.language === 'KO'
        ? '부산 축제와 공연을 날짜별로 확인하세요.'
        : 'Browse Busan festivals and events by date.',
  },
  {
    to: '/bookmarks',
    icon: '🔖',
    label: props.language === 'KO' ? '북마크' : 'Bookmarks',
    desc:
      props.language === 'KO'
        ? '저장한 게시글을 한곳에서 관리하세요.'
        : 'Manage your saved posts in one place.',
  },
])

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(
    props.language === 'KO' ? 'ko-KR' : 'en-US',
  )

const dateKey = computed(() => {
  const year = now.value.getFullYear()
  const month = String(now.value.getMonth() + 1).padStart(2, '0')
  const day = String(now.value.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
})

const todayDate = computed(() =>
  new Intl.DateTimeFormat(
    props.language === 'KO' ? 'ko-KR' : 'en-US',
    {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
  ).format(now.value),
)

const currentTime = computed(() =>
  new Intl.DateTimeFormat(
    props.language === 'KO' ? 'ko-KR' : 'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: props.language !== 'KO',
    },
  ).format(now.value),
)

const festivalItems = computed(
  () => tourData['축제/공연/행사'] || [],
)

const todayFestivals = computed(() =>
  festivalItems.value.filter((event) => {
    const start = event.start || ''
    const end = event.end || start

    return start <= dateKey.value && dateKey.value <= end
  }),
)

const latestPost = computed(() => {
  if (!posts.length) return null

  return [...posts].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  )[0]
})

const attractionPool = computed(() => {
  const preferredCategories = [
    '관광지',
    '문화시설',
    '레포츠',
    '여행코스',
    '음식점',
  ]

  const collected = preferredCategories.flatMap(
    (category) => tourData[category] || [],
  )

  return collected.filter((item) => item?.title).slice(0, 40)
})

const recommendedPlace = computed(() => {
  if (!attractionPool.value.length) return null

  return attractionPool.value[
    recommendationIndex.value % attractionPool.value.length
  ]
})

const changeRecommendation = () => {
  if (attractionPool.value.length < 2) return

  recommendationIndex.value =
    (recommendationIndex.value + 1) % attractionPool.value.length
}

const translateCategory = (category) => {
  if (props.language === 'KO') return category

  const categoryMap = {
    자유게시판: 'Free Board',
    여행질문: 'Travel Questions',
    맛집후기: 'Restaurant Reviews',
    축제정보: 'Festival Information',
  }

  return categoryMap[category] || category
}

const translatePlace = (place) => {
  if (props.language === 'KO') return place

  const placeMap = {
    'KT&G 상상마당 부산': 'KT&G Sangsangmadang Busan',
    광안리해수욕장: 'Gwangalli Beach',
    해운대해수욕장: 'Haeundae Beach',
    감천문화마을: 'Gamcheon Culture Village',
    태종대: 'Taejongdae',
    자갈치시장: 'Jagalchi Market',
    송도해수욕장: 'Songdo Beach',
    흰여울문화마을: 'Huinnyeoul Culture Village',
    용두산공원: 'Yongdusan Park',
    부산타워: 'Busan Tower',
    국제시장: 'Gukje Market',
  }

  return placeMap[place] || place
}

const translateAddress = (address) => {
  if (props.language === 'KO') return address

  const addressMap = {
    '부산광역시 부산진구 서면로 39':
      '39 Seomyeon-ro, Busanjin-gu, Busan',
  }

  return addressMap[address] || address
}

const weatherText = computed(() => {
  const code = weather.value?.weatherCode

  if (code === undefined || code === null) {
    return props.language === 'KO' ? '날씨 확인 중' : 'Loading weather'
  }

  const labels = {
    0: ['맑음', 'Clear'],
    1: ['대체로 맑음', 'Mostly clear'],
    2: ['구름 조금', 'Partly cloudy'],
    3: ['흐림', 'Overcast'],
    45: ['안개', 'Fog'],
    48: ['서리 안개', 'Rime fog'],
    51: ['약한 이슬비', 'Light drizzle'],
    53: ['이슬비', 'Drizzle'],
    55: ['강한 이슬비', 'Heavy drizzle'],
    61: ['약한 비', 'Light rain'],
    63: ['비', 'Rain'],
    65: ['강한 비', 'Heavy rain'],
    71: ['약한 눈', 'Light snow'],
    73: ['눈', 'Snow'],
    75: ['강한 눈', 'Heavy snow'],
    80: ['약한 소나기', 'Light showers'],
    81: ['소나기', 'Showers'],
    82: ['강한 소나기', 'Heavy showers'],
    95: ['천둥번개', 'Thunderstorm'],
    96: ['우박 동반 뇌우', 'Thunderstorm with hail'],
    99: ['강한 우박 뇌우', 'Severe hailstorm'],
  }

  const label = labels[code] || ['날씨 정보', 'Weather']
  return props.language === 'KO' ? label[0] : label[1]
})

const weatherIcon = computed(() => {
  const code = weather.value?.weatherCode

  if (code === 0) return '☀️'
  if ([1, 2].includes(code)) return '🌤️'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
  if ([71, 73, 75].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'

  return '🌤️'
})

async function fetchBusanWeather() {
  weatherLoading.value = true
  weatherError.value = false

  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=35.1796' +
      '&longitude=129.0756' +
      '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&timezone=Asia%2FSeoul'

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    weather.value = {
      temperature: Math.round(data.current?.temperature_2m ?? 0),
      apparentTemperature: Math.round(
        data.current?.apparent_temperature ?? 0,
      ),
      weatherCode: data.current?.weather_code,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
    }
  } catch (error) {
    console.error(error)
    weatherError.value = true
  } finally {
    weatherLoading.value = false
  }
}

onMounted(() => {
  fetchBusanWeather()

  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 30000)
})

onBeforeUnmount(() => {
  window.clearInterval(clockTimer)
})
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-box">
        <div>
          <span class="badge">
            {{
              props.language === 'KO'
                ? '부산 지역 정보 공유 커뮤니티'
                : 'Busan Local Information Community'
            }}
          </span>

          <h1 v-if="props.language === 'KO'">
            부산의 오늘을<br />가볍게 발견하세요.
          </h1>

          <h1 v-else>
            Discover Busan<br />with ease today.
          </h1>

          <p v-if="props.language === 'KO'">
            관광지, 축제, 맛집 정보를 확인하고<br />
            익명으로 나만의 부산 이야기를 공유해보세요.
          </p>

          <p v-else>
            Find attractions, festivals, and local food,<br />
            then share your own Busan story anonymously.
          </p>

          <div class="hero-actions">
            <RouterLink class="btn primary" to="/board">
              {{
                props.language === 'KO'
                  ? '커뮤니티 둘러보기'
                  : 'Explore Community'
              }}
            </RouterLink>

            <RouterLink class="btn ghost" to="/map">
              {{
                props.language === 'KO'
                  ? '부산 지도 보기'
                  : 'View Busan Map'
              }}
            </RouterLink>
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


  <section class="today-section">
    <div class="container">
      <div class="today-card">
        <div class="today-heading">
          <div>
            <div class="eyebrow">
              {{ props.language === 'KO' ? 'TODAY IN BUSAN' : 'TODAY IN BUSAN' }}
            </div>

            <h2>
              {{ props.language === 'KO' ? '오늘의 부산' : 'Busan Today' }}
            </h2>

            <p>
              {{
                props.language === 'KO'
                  ? '지금 확인하면 좋은 부산 소식을 한눈에 모았어요.'
                  : 'A quick look at what is happening in Busan right now.'
              }}
            </p>
          </div>

          <div class="today-status">
            <button
              class="weather-card"
              type="button"
              :aria-label="
                props.language === 'KO'
                  ? '부산 날씨 새로고침'
                  : 'Refresh Busan weather'
              "
              @click="fetchBusanWeather"
            >
              <span class="weather-icon">{{ weatherIcon }}</span>

              <span class="weather-copy">
                <small>
                  {{ props.language === 'KO' ? '부산 날씨' : 'Busan Weather' }}
                </small>

                <strong v-if="!weatherLoading && !weatherError">
                  {{ weather.temperature }}℃
                </strong>

                <strong v-else-if="weatherLoading">--℃</strong>
                <strong v-else>!</strong>

                <span v-if="!weatherError">
                  {{
                    weatherLoading
                      ? (props.language === 'KO' ? '불러오는 중' : 'Loading')
                      : weatherText
                  }}
                </span>

                <span v-else>
                  {{
                    props.language === 'KO'
                      ? '다시 눌러 확인'
                      : 'Tap to retry'
                  }}
                </span>
              </span>

              <span class="weather-refresh">↻</span>
            </button>

            <div class="today-clock">
              <span>{{ todayDate }}</span>
              <strong>{{ currentTime }}</strong>
              <small>
                {{ props.language === 'KO' ? '부산 기준' : 'Busan time' }}
              </small>
            </div>
          </div>
        </div>

        <div class="today-grid">
          <RouterLink class="today-item festival" to="/calendar">
            <div class="today-icon">🎉</div>

            <div class="today-item-copy">
              <span>
                {{
                  props.language === 'KO'
                    ? '오늘 진행 중인 축제'
                    : 'Festivals Today'
                }}
              </span>

              <strong>
                {{
                  props.language === 'KO'
                    ? `${todayFestivals.length}개`
                    : `${todayFestivals.length}`
                }}
              </strong>

              <p v-if="todayFestivals.length">
                {{ todayFestivals[0].title }}
              </p>

              <p v-else>
                {{
                  props.language === 'KO'
                    ? '오늘 등록된 행사가 없습니다.'
                    : 'No registered event today.'
                }}
              </p>
            </div>

            <span class="today-arrow">→</span>
          </RouterLink>

          <RouterLink class="today-item post" to="/board">
            <div class="today-icon">💬</div>

            <div class="today-item-copy">
              <span>
                {{
                  props.language === 'KO'
                    ? '가장 최근 부산 이야기'
                    : 'Latest Busan Story'
                }}
              </span>

              <strong>
                {{
                  latestPost?.category
                    ? translateCategory(latestPost.category)
                    : props.language === 'KO'
                      ? '커뮤니티'
                      : 'Community'
                }}
              </strong>

              <p>
                {{
                  latestPost?.title ||
                  (props.language === 'KO'
                    ? '첫 번째 이야기를 작성해보세요.'
                    : 'Write the first story.')
                }}
              </p>
            </div>

            <span class="today-arrow">→</span>
          </RouterLink>

          <article class="today-item recommend">
            <div class="today-icon">📍</div>

            <div class="today-item-copy">
              <span>
                {{
                  props.language === 'KO'
                    ? '오늘의 추천 장소'
                    : 'Place of the Day'
                }}
              </span>

              <strong>
                {{
                  recommendedPlace?.title
                    ? translatePlace(recommendedPlace.title)
                    : props.language === 'KO'
                      ? '부산 여행지'
                      : 'Busan Spot'
                }}
              </strong>

              <p>
                {{
                  recommendedPlace?.address
                    ? translateAddress(recommendedPlace.address)
                    : recommendedPlace?.place
                      ? translatePlace(recommendedPlace.place)
                      : props.language === 'KO'
                        ? '지도를 열어 주변 명소를 확인하세요.'
                        : 'Open the map to find nearby attractions.'
                }}
              </p>
            </div>

            <button
              class="refresh-place"
              type="button"
              :aria-label="
                props.language === 'KO'
                  ? '다른 장소 추천'
                  : 'Recommend another place'
              "
              @click="changeRecommendation"
            >
              ↻
            </button>
          </article>
        </div>
      </div>
    </div>
  </section>

  <section class="page home-page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">LOCALHUB OVERVIEW</div>
          <h2>
            {{
              props.language === 'KO'
                ? 'LocalHub 주요 기능'
                : 'LocalHub Features'
            }}
          </h2>

          <p>
            {{
              props.language === 'KO'
                ? '각 카드를 누르면 새로고침 없이 해당 화면으로 이동합니다.'
                : 'Select a card to move to the page without reloading.'
            }}
          </p>
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
        <div class="panel stat-card">
          <span>
            {{ props.language === 'KO' ? '관광 데이터' : 'Tourism Data' }}
          </span>
          <strong>
            {{ formatNumber(totalTourCount) }}{{ props.language === 'KO' ? '건' : '' }}
          </strong>
        </div>

        <div class="panel stat-card">
          <span>
            {{ props.language === 'KO' ? '커뮤니티 글' : 'Community Posts' }}
          </span>
          <strong>
            {{ posts.length }}{{ props.language === 'KO' ? '건' : '' }}
          </strong>
        </div>

        <div class="panel stat-card">
          <span>
            {{ props.language === 'KO' ? '축제·행사' : 'Festivals & Events' }}
          </span>
          <strong>
            {{ totals['축제/공연/행사'] }}{{ props.language === 'KO' ? '건' : '' }}
          </strong>
        </div>

        <div class="panel stat-card">
          <span>
            {{ props.language === 'KO' ? '내 북마크' : 'My Bookmarks' }}
          </span>
          <strong>
            {{ bookmarkedPosts.length }}{{ props.language === 'KO' ? '건' : '' }}
          </strong>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero{padding:46px 0 28px}.hero-box{min-height:300px;border-radius:28px;padding:46px;display:grid;grid-template-columns:1.25fr .75fr;gap:32px;align-items:center;background:radial-gradient(circle at 12% 20%,rgba(212,20,106,.14),transparent 28%),radial-gradient(circle at 88% 22%,rgba(0,169,206,.18),transparent 26%),linear-gradient(135deg,#fff4f9,#effcff);border:1px solid #efcadc;overflow:hidden;position:relative}.hero-box:after{content:"";position:absolute;right:-70px;bottom:-90px;width:260px;height:260px;border-radius:50%;background:linear-gradient(135deg,rgba(212,20,106,.12),rgba(0,169,206,.18))}.hero h1{font-size:clamp(34px,5vw,58px);line-height:1.08;margin:18px 0;letter-spacing:-2.3px}.hero p{color:var(--muted);font-size:17px;line-height:1.8;margin:0 0 28px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap}.busan-art{position:relative;width:100%;min-height:290px;z-index:2}.floating-icon{position:absolute;aspect-ratio:1/1;border-radius:24px;overflow:hidden;background:#fff;border:3px solid rgba(255,255,255,.92);box-shadow:0 18px 38px rgba(16,37,63,.18);opacity:0;animation:appear .8s cubic-bezier(.22,1.3,.36,1) forwards,bounce 3.7s ease-in-out infinite}.floating-icon img{width:100%;height:100%;object-fit:cover}.icon-1{left:2%;top:7%;width:106px;animation-delay:.1s,.9s}.icon-2{left:38%;top:0;width:112px;animation-delay:.28s,1.08s}.icon-3{right:0;top:11%;width:102px;animation-delay:.46s,1.26s}.icon-4{left:17%;bottom:0;width:108px;animation-delay:.64s,1.44s}.icon-5{right:15%;bottom:2%;width:110px;animation-delay:.82s,1.62s}@keyframes appear{from{opacity:0;transform:translateY(30px) scale(.7)}to{opacity:1;transform:none}}@keyframes bounce{0%,100%{translate:0 0}50%{translate:5px -14px;rotate:2deg}}.home-page{padding-top:10px}.menu-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.menu-card{padding:22px;border-radius:20px;background:#fff;border:1px solid var(--line);transition:.2s}.menu-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(16,37,63,.09)}.menu-icon{width:48px;height:48px;border-radius:15px;background:linear-gradient(135deg,var(--magenta-soft),var(--cyan-soft));display:grid;place-items:center;font-size:23px}.menu-card h3{margin:15px 0 8px}.menu-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px}.stat-card{padding:22px}.stat-card span{color:var(--muted);font-size:13px}.stat-card strong{display:block;font-size:28px;margin-top:8px}@media(max-width:950px){.menu-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.hero-box{grid-template-columns:1fr;padding:28px}.menu-grid,.stats-grid{grid-template-columns:1fr}}

.today-section {
  padding: 2px 0 18px;
}

.today-card {
  position: relative;
  overflow: hidden;
  padding: 26px;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(0, 169, 206, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at 8% 90%,
      rgba(212, 20, 106, 0.12),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.94),
      rgba(244, 251, 255, 0.9)
    );
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  box-shadow: 0 18px 44px rgba(16, 37, 63, 0.09);
  backdrop-filter: blur(10px);
}

.today-card::after {
  position: absolute;
  right: -56px;
  bottom: -72px;
  width: 190px;
  height: 190px;
  content: '';
  background: linear-gradient(
    135deg,
    rgba(212, 20, 106, 0.12),
    rgba(0, 169, 206, 0.18)
  );
  border-radius: 50%;
  pointer-events: none;
}

.today-heading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 20px;
}

.today-heading h2 {
  margin: 5px 0 6px;
  color: #052738;
  font-size: 27px;
  letter-spacing: -0.7px;
}

.today-heading p {
  margin: 0;
  color: rgba(6, 18, 39, 0.68);
  line-height: 1.65;
}


.today-status {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: stretch;
}

.weather-card {
  display: grid;
  grid-template-columns: 42px minmax(82px, 1fr) 22px;
  gap: 10px;
  align-items: center;
  min-width: 214px;
  padding: 12px 13px;
  text-align: left;
  background: rgba(255, 255, 255, 0.76);
  color: #052738;
  border: 1px solid rgba(6, 18, 39, 0.06);
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.weather-card:hover {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 24px rgba(16, 37, 63, 0.08);
  transform: translateY(-2px);
}

.weather-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(
    135deg,
    rgba(255, 238, 184, 0.82),
    rgba(221, 246, 255, 0.9)
  );
  border-radius: 14px;
  font-size: 22px;
}

.weather-copy {
  min-width: 0;
}

.weather-copy small,
.weather-copy span {
  display: block;
}

.weather-copy small {
  color: rgba(6, 18, 39, 0.55);
  font-size: 11px;
}

.weather-copy strong {
  display: block;
  margin: 1px 0;
  font-size: 22px;
  line-height: 1.2;
}

.weather-copy span {
  overflow: hidden;
  color: rgba(6, 18, 39, 0.64);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-refresh {
  color: rgba(6, 18, 39, 0.38);
  font-size: 17px;
  transition: transform 0.25s ease;
}

.weather-card:hover .weather-refresh {
  transform: rotate(120deg);
}

.today-clock {
  flex-shrink: 0;
  min-width: 176px;
  padding: 14px 18px;
  text-align: right;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(6, 18, 39, 0.06);
  border-radius: 18px;
}

.today-clock span,
.today-clock small {
  display: block;
  color: rgba(6, 18, 39, 0.58);
  font-size: 12px;
}

.today-clock strong {
  display: block;
  margin: 3px 0;
  color: #052738;
  font-size: 25px;
}

.today-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.today-item {
  position: relative;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
  min-height: 132px;
  padding: 18px;
  overflow: hidden;
  color: inherit;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(6, 18, 39, 0.07);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(16, 37, 63, 0.05);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.today-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 34px rgba(16, 37, 63, 0.1);
}

.today-item.festival {
  background: linear-gradient(
    150deg,
    rgba(255, 239, 246, 0.94),
    rgba(255, 255, 255, 0.9)
  );
}

.today-item.post {
  background: linear-gradient(
    150deg,
    rgba(232, 249, 255, 0.94),
    rgba(255, 255, 255, 0.9)
  );
}

.today-item.recommend {
  background: linear-gradient(
    150deg,
    rgba(240, 255, 236, 0.94),
    rgba(255, 255, 255, 0.9)
  );
}

.today-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 15px;
  font-size: 22px;
}

.today-item-copy {
  min-width: 0;
}

.today-item-copy span {
  display: block;
  margin-bottom: 5px;
  color: rgba(6, 18, 39, 0.56);
  font-size: 12px;
  font-weight: 700;
}

.today-item-copy strong {
  display: block;
  overflow: hidden;
  color: #052738;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-item-copy p {
  display: -webkit-box;
  margin: 7px 0 0;
  overflow: hidden;
  color: rgba(6, 18, 39, 0.67);
  font-size: 13px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.today-arrow {
  color: rgba(6, 18, 39, 0.36);
  font-size: 21px;
}

.refresh-place {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(255, 255, 255, 0.86);
  color: #087a9e;
  font-size: 20px;
  border: 1px solid rgba(6, 18, 39, 0.08);
  border-radius: 50%;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.refresh-place:hover {
  background: #ffffff;
  transform: rotate(120deg);
}

@media (max-width: 950px) {
  .today-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .today-card {
    padding: 20px;
  }

  .today-heading {
    align-items: stretch;
    flex-direction: column;
  }

  
.today-status {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: stretch;
}

.weather-card {
  display: grid;
  grid-template-columns: 42px minmax(82px, 1fr) 22px;
  gap: 10px;
  align-items: center;
  min-width: 214px;
  padding: 12px 13px;
  text-align: left;
  background: rgba(255, 255, 255, 0.76);
  color: #052738;
  border: 1px solid rgba(6, 18, 39, 0.06);
  border-radius: 18px;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.weather-card:hover {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 24px rgba(16, 37, 63, 0.08);
  transform: translateY(-2px);
}

.weather-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(
    135deg,
    rgba(255, 238, 184, 0.82),
    rgba(221, 246, 255, 0.9)
  );
  border-radius: 14px;
  font-size: 22px;
}

.weather-copy {
  min-width: 0;
}

.weather-copy small,
.weather-copy span {
  display: block;
}

.weather-copy small {
  color: rgba(6, 18, 39, 0.55);
  font-size: 11px;
}

.weather-copy strong {
  display: block;
  margin: 1px 0;
  font-size: 22px;
  line-height: 1.2;
}

.weather-copy span {
  overflow: hidden;
  color: rgba(6, 18, 39, 0.64);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-refresh {
  color: rgba(6, 18, 39, 0.38);
  font-size: 17px;
  transition: transform 0.25s ease;
}

.weather-card:hover .weather-refresh {
  transform: rotate(120deg);
}

.today-clock {
    width: 100%;
    text-align: left;
  }

  .today-item {
    grid-template-columns: 44px minmax(0, 1fr) auto;
  }
}

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

