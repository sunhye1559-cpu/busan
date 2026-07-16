<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocalHub } from '../stores/localhub'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const props = defineProps({
  language: {
    type: String,
    default: 'KO',
  },
})

const { tourData, totals } = useLocalHub()

const categories = [
  '음식점',
  '축제/공연/행사',
  '문화시설',
  '레포츠',
  '숙박',
  '쇼핑',
  '여행코스',
]

const selectedCategory = ref('문화시설')
const mapElement = ref(null)

let map
let markers = []

const visibleItems = computed(() =>
  (tourData[selectedCategory.value] || [])
    .filter((item) => item.lat && item.lng)
    .slice(0, 9),
)

const categoryLabel = (category) =>
  props.language === 'KO'
    ? category
    : {
        음식점: 'Restaurants',
        '축제/공연/행사': 'Festivals & Events',
        문화시설: 'Cultural Facilities',
        레포츠: 'Leisure Sports',
        숙박: 'Accommodation',
        쇼핑: 'Shopping',
        여행코스: 'Travel Courses',
      }[category]

const icon = (category) =>
  ({
    음식점: '🍽️',
    '축제/공연/행사': '🎉',
    문화시설: '🏛️',
    레포츠: '🏄',
    숙박: '🏨',
    쇼핑: '🛍️',
    여행코스: '🧭',
  })[category]

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(
    props.language === 'KO' ? 'ko-KR' : 'en-US',
  )

function drawMarkers() {
  if (!map) return

  markers.forEach((marker) => marker.remove())
  markers = []

  const items = (tourData[selectedCategory.value] || [])
    .filter((item) => item.lat && item.lng)
    .slice(0, 180)

  items.forEach((item) => {
    const marker = L.marker([item.lat, item.lng])
      .addTo(map)
      .bindPopup(`
        <b>${item.title}</b><br>
        ${
          item.address ||
          (props.language === 'KO'
            ? '주소 정보 없음'
            : 'No address information')
        }
      `)

    markers.push(marker)
  })

  if (items.length) {
    map.fitBounds(
      L.latLngBounds(
        items.map((item) => [item.lat, item.lng]),
      ),
      {
        padding: [25, 25],
        maxZoom: 13,
      },
    )
  }
}

function focus(item) {
  map?.setView([item.lat, item.lng], 15)
}

watch(selectedCategory, () => nextTick(drawMarkers))

onMounted(() => {
  map = L.map(mapElement.value).setView(
    [35.1796, 129.0756],
    11,
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors',
    },
  ).addTo(map)

  drawMarkers()
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <section class="page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">TOUR MAP</div>

          <h1>
            {{
              props.language === 'KO'
                ? '부산 관광 지도'
                : 'Busan Tourism Map'
            }}
          </h1>

          <p>
            {{
              props.language === 'KO'
                ? 'TourAPI JSON 좌표를 이용해 카테고리별 POI를 표시합니다.'
                : 'Displays POIs by category using TourAPI JSON coordinates.'
            }}
          </p>
        </div>
      </div>

      <div class="map-layout">
        <aside class="panel category-list">
          <button
            v-for="category in categories"
            :key="category"
            class="category-btn"
            :class="{ active: selectedCategory === category }"
            type="button"
            @click="selectedCategory = category"
          >
            <span>
              {{ icon(category) }} {{ categoryLabel(category) }}
            </span>

            <b>{{ formatNumber(totals[category]) }}</b>
          </button>
        </aside>

        <div>
          <div class="panel map-wrap">
            <div class="map-toolbar">
              <strong>
                {{ categoryLabel(selectedCategory) }} POI
              </strong>

              <span>
                {{
                  props.language === 'KO'
                    ? '최대 180개 마커 표시'
                    : 'Up to 180 markers'
                }}
              </span>
            </div>

            <div
              ref="mapElement"
              class="map"
            ></div>
          </div>

          <div class="poi-list">
            <article
              v-for="item in visibleItems"
              :key="`${item.title}-${item.lat}-${item.lng}`"
              class="panel poi-card"
              @click="focus(item)"
            >
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                @error="$event.target.style.display = 'none'"
              />

              <h4>{{ item.title }}</h4>

              <p>
                {{
                  item.address ||
                  (props.language === 'KO'
                    ? '주소 정보 없음'
                    : 'No address information')
                }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.map-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
}

.category-list {
  padding: 14px;
}

.category-btn {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: transparent;
  color: var(--muted);
  font-weight: 800;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}

.category-btn.active {
  background: var(--gradient);
  color: #ffffff;
}

.map-wrap {
  overflow: hidden;
}

.map-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 13px 15px;
  border-bottom: 1px solid var(--line);
}

.map-toolbar span {
  color: var(--muted);
  font-size: 12px;
}

.map {
  height: 580px;
}

.poi-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.poi-card {
  padding: 16px;
  cursor: pointer;
}

.poi-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.poi-card h4 {
  margin: 12px 0 7px;
}

.poi-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 950px) {
  .map-layout {
    grid-template-columns: 1fr;
  }

  .category-list {
    display: flex;
    overflow-x: auto;
  }

  .category-btn {
    width: auto;
    white-space: nowrap;
  }

  .poi-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .poi-list {
    grid-template-columns: 1fr;
  }

  .map {
    height: 480px;
  }
}
</style>