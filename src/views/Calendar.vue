<script setup>
import { computed, ref } from 'vue'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({
  language: {
    type: String,
    default: 'KO',
  },
})

const { tourData } = useLocalHub()

const year = ref(2026)
const month = ref(7)
const selected = ref(null)
const imageFailed = ref(false)

const festivals = computed(() =>
  [...tourData['축제/공연/행사']].sort((a, b) =>
    (b.modified || '').localeCompare(a.modified || ''),
  ),
)

const cells = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const last = new Date(year.value, month.value + 1, 0)
  const previousLast = new Date(year.value, month.value, 0).getDate()
  const result = []

  for (let i = first.getDay() - 1; i >= 0; i -= 1) {
    result.push({
      day: previousLast - i,
      current: false,
      events: [],
    })
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const key =
      `${year.value}` +
      `${String(month.value + 1).padStart(2, '0')}` +
      `${String(day).padStart(2, '0')}`

    result.push({
      day,
      current: true,
      events: festivals.value.filter((event) => event.start === key),
    })
  }

  let next = 1

  while (result.length % 7) {
    result.push({
      day: next,
      current: false,
      events: [],
    })

    next += 1
  }

  return result
})

const dayNames = computed(() =>
  props.language === 'KO'
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
)

function move(amount) {
  month.value += amount

  if (month.value < 0) {
    month.value = 11
    year.value -= 1
  }

  if (month.value > 11) {
    month.value = 0
    year.value += 1
  }
}

function openEvent(event) {
  selected.value = event
  imageFailed.value = false
}

function closeModal() {
  selected.value = null
  imageFailed.value = false
}

function handleImageError() {
  imageFailed.value = true
}

const formatDate = (value) =>
  value?.length === 8
    ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
    : props.language === 'KO'
      ? '미정'
      : 'TBD'

const getEventImage = (event) =>
  event?.image ||
  event?.firstimage ||
  event?.firstImage ||
  event?.thumbnail ||
  event?.img ||
  ''

const getDescription = (event) => {
  const original =
    event?.overview ||
    event?.description ||
    event?.content ||
    event?.summary ||
    ''

  if (original) return original

  const place =
    event?.place ||
    event?.address ||
    (props.language === 'KO' ? '부산' : 'Busan')

  return props.language === 'KO'
    ? `${event?.title || '해당 행사'}은(는) ${place}에서 진행되는 부산 지역 축제·공연·행사입니다. 행사 기간과 운영 시간을 확인한 뒤 방문해 주세요.`
    : `${event?.title || 'This event'} is a local festival, performance, or event held in ${place}. Please check the event dates and operating hours before visiting.`
}

const getHomepage = (event) =>
  event?.homepage ||
  event?.homePage ||
  event?.url ||
  event?.website ||
  ''
</script>

<template>
  <section class="page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">FESTIVAL CALENDAR</div>

          <h1>
            {{
              props.language === 'KO'
                ? '축제 캘린더'
                : 'Festival Calendar'
            }}
          </h1>

          <p>
            {{
              props.language === 'KO'
                ? '행사 날짜, 장소, 갱신일 정보를 확인합니다.'
                : 'Check event dates, locations, and update information.'
            }}
          </p>
        </div>
      </div>

      <div class="panel calendar-shell">
        <div class="calendar-top">
          <button
            class="btn ghost small"
            type="button"
            @click="move(-1)"
          >
            ‹ {{ props.language === 'KO' ? '이전' : 'Previous' }}
          </button>

          <h3>
            {{
              props.language === 'KO'
                ? `${year}년 ${month + 1}월`
                : `${month + 1}/${year}`
            }}
          </h3>

          <button
            class="btn ghost small"
            type="button"
            @click="move(1)"
          >
            {{ props.language === 'KO' ? '다음' : 'Next' }} ›
          </button>
        </div>

        <div class="wave-bg" aria-hidden="true">
          <svg
            class="wave wave1"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stop-color="#a7e9ff" />
                <stop offset="1" stop-color="#3bb0ff" />
              </linearGradient>
            </defs>

            <path
              d="M0,100 C150,200 350,0 600,100 C850,200 1050,0 1200,100 L1200,200 L0,200 Z"
              fill="url(#g1)"
            />
          </svg>

          <svg
            class="wave wave2"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,120 C200,20 400,220 600,120 C800,20 1000,220 1200,120 L1200,200 L0,200 Z"
              fill="rgba(59,176,255,0.12)"
            />
          </svg>
        </div>

        <div class="calendar-grid">
          <div
            v-for="day in dayNames"
            :key="day"
            class="day-name"
          >
            {{ day }}
          </div>

          <div
            v-for="(cell, cellIndex) in cells"
            :key="`${cell.day}-${cellIndex}`"
            class="cell"
            :class="{ muted: !cell.current }"
          >
            <b>{{ cell.day }}</b>

            <button
              v-for="event in cell.events.slice(0, 3)"
              :key="`${event.title}-${event.start}`"
              class="event"
              type="button"
              @click="openEvent(event)"
            >
              {{ event.title }}
            </button>
          </div>
        </div>
      </div>

      <div class="panel festival-list">
        <div
          v-for="event in festivals.slice(0, 30)"
          :key="`${event.title}-${event.start}-${event.address}`"
          class="festival-row"
          role="button"
          tabindex="0"
          @click="openEvent(event)"
          @keydown.enter="openEvent(event)"
        >
          <span class="badge">
            {{ formatDate(event.start) }}
          </span>

          <div>
            <strong>{{ event.title }}</strong>
            <div class="meta">
              {{ event.address }}
            </div>
          </div>

          <div class="meta">
            {{
              event.place ||
              (props.language === 'KO'
                ? '장소 정보 없음'
                : 'No venue information')
            }}
          </div>

          <div class="meta">
            {{ props.language === 'KO' ? '갱신' : 'Updated' }}
            {{ formatDate(event.modified?.slice(0, 8)) }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <div
    v-if="selected"
    class="modal"
    role="dialog"
    aria-modal="true"
    @click.self="closeModal"
  >
    <div class="modal-card">
      <button
        class="modal-close"
        type="button"
        :aria-label="props.language === 'KO' ? '닫기' : 'Close'"
        @click="closeModal"
      >
        ×
      </button>

      <div class="modal-image-wrap">
        <img
          v-if="getEventImage(selected) && !imageFailed"
          class="modal-image"
          :src="getEventImage(selected)"
          :alt="selected.title"
          @error="handleImageError"
        />

        <div
          v-else
          class="modal-image-empty"
        >
          <span>🎪</span>

          <p>
            {{
              props.language === 'KO'
                ? '등록된 행사 사진이 없습니다.'
                : 'No event image available.'
            }}
          </p>
        </div>
      </div>

      <div class="modal-content">
        <span class="badge">
          {{ formatDate(selected.start) }}
          ~
          {{ formatDate(selected.end) }}
        </span>

        <h2>{{ selected.title }}</h2>

        <p class="modal-description">
          {{ getDescription(selected) }}
        </p>

        <div class="detail-list">
          <div class="detail-item">
            <span class="detail-icon">📍</span>

            <div>
              <strong>
                {{ props.language === 'KO' ? '장소' : 'Venue' }}
              </strong>

              <p>
                {{
                  selected.place ||
                  selected.address ||
                  (props.language === 'KO'
                    ? '정보 없음'
                    : 'No information')
                }}
              </p>
            </div>
          </div>

          <div class="detail-item">
            <span class="detail-icon">🕐</span>

            <div>
              <strong>
                {{ props.language === 'KO' ? '시간' : 'Time' }}
              </strong>

              <p>
                {{
                  selected.playtime ||
                  (props.language === 'KO'
                    ? '정보 없음'
                    : 'No information')
                }}
              </p>
            </div>
          </div>

          <div class="detail-item">
            <span class="detail-icon">🗺️</span>

            <div>
              <strong>
                {{ props.language === 'KO' ? '주소' : 'Address' }}
              </strong>

              <p>
                {{
                  selected.address ||
                  (props.language === 'KO'
                    ? '정보 없음'
                    : 'No information')
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <a
            v-if="getHomepage(selected)"
            class="btn primary"
            :href="getHomepage(selected)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{
              props.language === 'KO'
                ? '공식 홈페이지'
                : 'Official Website'
            }}
          </a>

          <button
            class="btn ghost"
            type="button"
            @click="closeModal"
          >
            {{ props.language === 'KO' ? '닫기' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-shell {
  position: relative;
  overflow: visible;
  padding: 24px;
  background: linear-gradient(180deg, #eef9ff, #fbfdff);
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(20, 30, 60, 0.06);
}

.calendar-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.calendar-top h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.calendar-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  background: transparent;
}

.wave-bg {
  position: absolute;
  right: 0;
  bottom: -10px;
  left: 0;
  z-index: 0;
  height: 160px;
  overflow: hidden;
  pointer-events: none;
}

.wave {
  position: absolute;
  left: 50%;
  width: 220%;
  height: 160px;
  transform: translateX(-50%);
}

.wave1 {
  opacity: 0.95;
  animation: wave1 14s ease-in-out infinite;
}

.wave2 {
  bottom: 8px;
  opacity: 0.6;
  animation: wave2 20s linear infinite reverse;
}

@keyframes wave1 {
  0% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-48%) translateY(8px);
  }

  100% {
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes wave2 {
  0% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-52%) translateY(6px);
  }

  100% {
    transform: translateX(-50%) translateY(0);
  }
}

.day-name {
  padding: 10px 6px;
  text-align: center;
  background: linear-gradient(90deg, #fbfbff, #f5f8ff);
  color: rgba(6, 18, 39, 0.65);
  font-weight: 700;
  border-radius: 10px;
  font-size: 13px;
}

.cell {
  position: relative;
  min-height: 120px;
  overflow: hidden;
  padding: 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(250, 250, 250, 0.94)
  );
  border: 1px solid rgba(6, 18, 39, 0.04);
  border-radius: 10px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.cell.muted {
  background: rgba(245, 247, 250, 0.92);
  color: var(--muted);
}

.cell b {
  display: inline-block;
  padding: 4px 6px;
  color: rgba(3, 60, 90, 0.9);
  font-weight: 700;
  border-radius: 8px;
}

.cell:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(20, 30, 60, 0.06);
}

.event {
  position: relative;
  display: -webkit-box;
  width: 100%;
  margin-top: 8px;
  overflow: hidden;
  padding: 10px 12px;
  text-align: left;
  background: linear-gradient(135deg, #e8f7ff, #dff6ff);
  color: #022033;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(3, 60, 90, 0.08);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(3, 60, 90, 0.06);
  cursor: pointer;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition:
    transform 0.36s cubic-bezier(0.22, 0.9, 0.35, 1),
    box-shadow 0.36s cubic-bezier(0.22, 0.9, 0.35, 1);
}

.event::before {
  position: absolute;
  inset: 0;
  content: '';
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
  opacity: 0.08;
  border-radius: 12px;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.event:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(20, 40, 80, 0.1);
}

.festival-list {
  position: relative;
  z-index: 1;
  margin-top: 18px;
}

.festival-row {
  position: relative;
  display: grid;
  grid-template-columns: 120px 1fr 160px 140px;
  gap: 12px;
  align-items: center;
  overflow: hidden;
  padding: 14px;
  cursor: pointer;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(250, 250, 250, 0.96)
  );
  border: 1px solid rgba(6, 18, 39, 0.06);
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(6, 18, 39, 0.05);
  backdrop-filter: blur(6px);
  transition:
    transform 0.36s cubic-bezier(0.22, 0.9, 0.35, 1),
    box-shadow 0.36s cubic-bezier(0.22, 0.9, 0.35, 1);
}

.festival-row::before {
  position: absolute;
  inset: 0;
  content: '';
  background-repeat: repeat;
  background-size: 64px 64px;
  opacity: 0.1;
  border-radius: 12px;
  pointer-events: none;
}

.festival-row:nth-child(5n + 1) {
  background: linear-gradient(
    180deg,
    rgba(255, 235, 242, 0.6),
    rgba(255, 255, 255, 0.94)
  );
}

.festival-row:nth-child(5n + 1)::before {
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
}

.festival-row:nth-child(5n + 2) {
  background: linear-gradient(
    180deg,
    rgba(226, 249, 255, 0.6),
    rgba(255, 255, 255, 0.94)
  );
}

.festival-row:nth-child(5n + 2)::before {
  background-image: url('https://www.transparenttextures.com/patterns/diagmonds.png');
}

.festival-row:nth-child(5n + 3) {
  background: linear-gradient(
    180deg,
    rgba(240, 255, 236, 0.6),
    rgba(255, 255, 255, 0.94)
  );
}

.festival-row:nth-child(5n + 3)::before {
  background-image: url('https://www.transparenttextures.com/patterns/pw_maze_white.png');
}

.festival-row:nth-child(5n + 4) {
  background: linear-gradient(
    180deg,
    rgba(244, 240, 255, 0.6),
    rgba(255, 255, 255, 0.94)
  );
}

.festival-row:nth-child(5n + 4)::before {
  background-image: url('https://www.transparenttextures.com/patterns/vertical-linen.png');
}

.festival-row:nth-child(5n + 5) {
  background: linear-gradient(
    180deg,
    rgba(255, 250, 235, 0.6),
    rgba(255, 255, 255, 0.94)
  );
}

.festival-row:nth-child(5n + 5)::before {
  background-image: url('https://www.transparenttextures.com/patterns/az_subtle.png');
}

.festival-row + .festival-row {
  margin-top: 10px;
}

.festival-row:hover,
.festival-row:focus {
  outline: none;
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(20, 30, 60, 0.08);
}

.festival-row strong {
  display: -webkit-box;
  margin-bottom: 6px;
  overflow: hidden;
  color: #022033;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.festival-row .meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 6px 10px;
  background: linear-gradient(90deg, #eef6ff, #f0fff7);
  color: var(--muted);
  font-weight: 700;
  border-radius: 10px;
}

.meta {
  color: var(--muted);
  font-size: 13px;
}

.page-head p {
  color: rgba(6, 18, 39, 0.8);
  font-size: 15px;
}

/* 상세 모달 */
.modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(6, 18, 39, 0.58);
  backdrop-filter: blur(6px);
}

.modal-card {
  position: relative;
  width: min(760px, calc(100% - 32px));
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 24px 80px rgba(6, 18, 39, 0.28);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255, 255, 255, 0.94);
  color: #172033;
  font-size: 27px;
  line-height: 1;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(6, 18, 39, 0.15);
  cursor: pointer;
}

.modal-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 320px;
  overflow: hidden;

  padding: 18px;
  box-sizing: border-box;

  background: linear-gradient(135deg, #eef9ff, #fff4f8);
  border-radius: 22px 22px 0 0;
}

.modal-image {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: contain;
  object-position: center;

  background: #ffffff;
  border-radius: 12px;
}

.modal-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #64748b;
}

.modal-image-empty span {
  font-size: 56px;
}

.modal-image-empty p {
  margin: 12px 0 0;
}

.modal-content {
  padding: 30px;
}

.modal-content h2 {
  margin: 14px 0 12px;
  color: #172033;
  font-size: 28px;
  line-height: 1.35;
}

.modal-description {
  margin: 0 0 22px;
  color: #475569;
  line-height: 1.75;
  white-space: pre-line;
}

.detail-list {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 16px;
  background: #f8fafc;
  border: 1px solid #e8edf3;
  border-radius: 14px;
}

.detail-icon {
  flex-shrink: 0;
  font-size: 21px;
}

.detail-item strong {
  display: block;
  margin-bottom: 4px;
  color: #172033;
  font-size: 14px;
}

.detail-item p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

@media (max-width: 760px) {
  .calendar-shell {
    padding: 16px;
  }

  .calendar-top {
    gap: 8px;
  }

  .calendar-top h3 {
    font-size: 16px;
  }

  .calendar-grid {
    gap: 5px;
  }

  .day-name {
    padding: 8px 2px;
    font-size: 11px;
  }

  .cell {
    min-height: 90px;
    padding: 6px;
  }

  .cell b {
    font-size: 14px;
  }

  .event {
    padding: 7px 6px;
    font-size: 11px;
    backdrop-filter: none;
  }

  .festival-row {
    grid-template-columns: 1fr;
    gap: 8px;
    background: #ffffff;
    backdrop-filter: none;
  }

  .modal {
    padding: 14px;
  }

  .modal-card {
    width: 100%;
  }

.modal-image-wrap {
  height: 240px;
  padding: 12px;
}

  .modal-content {
    padding: 22px 18px;
  }

  .modal-content h2 {
    font-size: 22px;
  }

  .modal-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .modal-actions .btn {
    width: 100%;
  }
}
</style>
