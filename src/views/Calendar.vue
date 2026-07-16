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

const today = new Date()
const year = ref(2026)
const month = ref(7)
const selected = ref(null)
const selectedDateKey = ref('')
const imageFailed = ref(false)

const festivals = computed(() =>
  [...(tourData['축제/공연/행사'] || [])].sort((a, b) =>
    (a.start || '').localeCompare(b.start || ''),
  ),
)

const monthKey = computed(
  () => `${year.value}${String(month.value + 1).padStart(2, '0')}`,
)

const monthEvents = computed(() =>
  festivals.value.filter((event) => {
    const start = event.start || ''
    const end = event.end || start

    return start.slice(0, 6) <= monthKey.value &&
      end.slice(0, 6) >= monthKey.value
  }),
)

const dayNames = computed(() =>
  props.language === 'KO'
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
)

const monthTitle = computed(() =>
  props.language === 'KO'
    ? `${year.value}년 ${month.value + 1}월`
    : new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(year.value, month.value, 1)),
)

const formatDate = (value) =>
  value?.length === 8
    ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
    : props.language === 'KO'
      ? '미정'
      : 'TBD'

const formatShortDate = (value) =>
  value?.length === 8
    ? props.language === 'KO'
      ? `${Number(value.slice(4, 6))}월 ${Number(value.slice(6, 8))}일`
      : new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(
          new Date(
            Number(value.slice(0, 4)),
            Number(value.slice(4, 6)) - 1,
            Number(value.slice(6, 8)),
          ),
        )
    : props.language === 'KO'
      ? '날짜 미정'
      : 'Date TBD'

const eventOccursOn = (event, key) => {
  const start = event.start || ''
  const end = event.end || start

  // 행사 기간 밖이면 표시하지 않음
  if (!(start <= key && key <= end)) {
    return false
  }

  // YYYYMMDD를 날짜 객체로 변환
  const eventDate = new Date(
    Number(key.slice(0, 4)),
    Number(key.slice(4, 6)) - 1,
    Number(key.slice(6, 8)),
  )

  const day = eventDate.getDay()
  // 일요일: 0, 토요일: 6
  const isWeekend = day === 6

  // 광안리 드론쇼는 토·일요일에만 표시
  if (
    event.title?.includes('광안리') &&
    event.title?.includes('드론')
  ) {
    return isWeekend
  }

  // 다른 행사는 기존처럼 기간 전체에 표시
  return true
}

const cells = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const last = new Date(year.value, month.value + 1, 0)
  const previousLast = new Date(year.value, month.value, 0).getDate()
  const result = []

  for (let i = first.getDay() - 1; i >= 0; i -= 1) {
    result.push({
      day: previousLast - i,
      current: false,
      key: '',
      events: [],
      isToday: false,
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
      key,
      events: monthEvents.value.filter((event) =>
        eventOccursOn(event, key),
      ),
      isToday:
        today.getFullYear() === year.value &&
        today.getMonth() === month.value &&
        today.getDate() === day,
    })
  }

  let next = 1

  while (result.length % 7) {
    result.push({
      day: next,
      current: false,
      key: '',
      events: [],
      isToday: false,
    })

    next += 1
  }

  return result
})

const selectedDayEvents = computed(() => {
  if (!selectedDateKey.value) return []

  return monthEvents.value.filter((event) =>
    eventOccursOn(event, selectedDateKey.value),
  )
})

const monthStats = computed(() => {
  const venues = new Set(
    monthEvents.value
      .map((event) => event.place || event.address)
      .filter(Boolean),
  )

  const activeDays = new Set()

  monthEvents.value.forEach((event) => {
    if (event.start?.startsWith(monthKey.value)) {
      activeDays.add(event.start)
    }
  })

  return {
    events: monthEvents.value.length,
    venues: venues.size,
    days: activeDays.size,
  }
})

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

  selectedDateKey.value = ''
}

function goToday() {
  year.value = today.getFullYear()
  month.value = today.getMonth()
  selectedDateKey.value =
    `${today.getFullYear()}` +
    `${String(today.getMonth() + 1).padStart(2, '0')}` +
    `${String(today.getDate()).padStart(2, '0')}`
}

function selectDay(cell) {
  if (!cell.current) return
  selectedDateKey.value = cell.key
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
      <div class="page-head calendar-page-head">
        <div>
          <div class="eyebrow">FESTIVAL CALENDAR</div>

          <h1>
            {{
              props.language === 'KO'
                ? '월별 축제 캘린더'
                : 'Monthly Festival Calendar'
            }}
          </h1>

          <p>
            {{
              props.language === 'KO'
                ? '달력에서 원하는 날짜를 누르면 그날의 행사를 바로 확인할 수 있습니다.'
                : 'Select a date to view events happening that day.'
            }}
          </p>
        </div>

        <button class="today-btn" type="button" @click="goToday">
          {{ props.language === 'KO' ? '오늘로 이동' : 'Go to Today' }}
        </button>
      </div>

      <div class="calendar-summary">
        <article class="summary-card summary-main">
          <span>
            {{ props.language === 'KO' ? '현재 보고 있는 달' : 'Viewing Month' }}
          </span>
          <strong>{{ monthTitle }}</strong>
          <p>
            {{
              props.language === 'KO'
                ? `${monthStats.events}개의 축제·행사가 등록되어 있습니다.`
                : `${monthStats.events} festivals and events are listed.`
            }}
          </p>
        </article>

        <article class="summary-card">
          <span>{{ props.language === 'KO' ? '행사 수' : 'Events' }}</span>
          <strong>{{ monthStats.events }}</strong>
        </article>

        <article class="summary-card">
          <span>{{ props.language === 'KO' ? '행사 장소' : 'Venues' }}</span>
          <strong>{{ monthStats.venues }}</strong>
        </article>

        <article class="summary-card">
          <span>{{ props.language === 'KO' ? '시작 날짜' : 'Start Dates' }}</span>
          <strong>{{ monthStats.days }}</strong>
        </article>
      </div>

      <div class="calendar-layout">
        <section class="calendar-panel">
          <div class="calendar-toolbar">
            <button
              class="month-button"
              type="button"
              @click="move(-1)"
            >
              ‹
              <span>
                {{ props.language === 'KO' ? '이전 달' : 'Previous' }}
              </span>
            </button>

            <div class="month-title">
              <small>
                {{ props.language === 'KO' ? 'BUSAN EVENTS' : 'BUSAN EVENTS' }}
              </small>
              <h2>{{ monthTitle }}</h2>
            </div>

            <button
              class="month-button"
              type="button"
              @click="move(1)"
            >
              <span>
                {{ props.language === 'KO' ? '다음 달' : 'Next' }}
              </span>
              ›
            </button>
          </div>

          <div class="calendar-grid">
            <div
              v-for="day in dayNames"
              :key="day"
              class="day-name"
            >
              {{ day }}
            </div>

            <button
              v-for="(cell, index) in cells"
              :key="`${cell.day}-${index}`"
              class="calendar-cell"
              :class="{
                muted: !cell.current,
                today: cell.isToday,
                selected: selectedDateKey === cell.key,
                'has-events': cell.events.length,
              }"
              type="button"
              :disabled="!cell.current"
              @click="selectDay(cell)"
            >
              <span class="day-number">{{ cell.day }}</span>

              <div
                v-if="cell.events.length"
                class="event-preview"
              >
                <span class="event-count">
                  {{
                    props.language === 'KO'
                      ? `${cell.events.length}개`
                      : `${cell.events.length}`
                  }}
                </span>

                <strong>{{ cell.events[0].title }}</strong>

                <small v-if="cell.events.length > 1">
                  {{
                    props.language === 'KO'
                      ? `외 ${cell.events.length - 1}개`
                      : `+${cell.events.length - 1} more`
                  }}
                </small>
              </div>
            </button>
          </div>
        </section>

        <aside class="day-panel">
          <div class="day-panel-head">
            <div>
              <span>
                {{
                  selectedDateKey
                    ? formatShortDate(selectedDateKey)
                    : props.language === 'KO'
                      ? '날짜를 선택하세요'
                      : 'Select a Date'
                }}
              </span>

              <h3>
                {{
                  selectedDateKey
                    ? props.language === 'KO'
                      ? '이날의 행사'
                      : 'Events This Day'
                    : props.language === 'KO'
                      ? '월간 행사 미리보기'
                      : 'Monthly Event Preview'
                }}
              </h3>
            </div>

            <strong>
              {{
                selectedDateKey
                  ? selectedDayEvents.length
                  : monthEvents.length
              }}
            </strong>
          </div>

          <div
            v-if="
              (selectedDateKey && selectedDayEvents.length) ||
              (!selectedDateKey && monthEvents.length)
            "
            class="event-card-list"
          >
            <button
              v-for="event in (
                selectedDateKey
                  ? selectedDayEvents
                  : monthEvents.slice(0, 8)
              )"
              :key="`${event.title}-${event.start}`"
              class="compact-event-card"
              type="button"
              @click="openEvent(event)"
            >
              <div class="compact-date">
                <span>{{ formatShortDate(event.start) }}</span>
                <small v-if="event.end && event.end !== event.start">
                  ~ {{ formatShortDate(event.end) }}
                </small>
              </div>

              <div class="compact-event-copy">
                <strong>{{ event.title }}</strong>
                <p>
                  {{
                    event.place ||
                    event.address ||
                    (props.language === 'KO'
                      ? '장소 정보 없음'
                      : 'No venue information')
                  }}
                </p>
              </div>

              <span class="compact-arrow">→</span>
            </button>
          </div>

          <div v-else class="empty-day">
            <span>🗓️</span>
            <strong>
              {{
                props.language === 'KO'
                  ? '등록된 행사가 없습니다.'
                  : 'No events are listed.'
              }}
            </strong>
            <p>
              {{
                props.language === 'KO'
                  ? '다른 날짜나 달을 선택해보세요.'
                  : 'Try another date or month.'
              }}
            </p>
          </div>
        </aside>
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

        <div v-else class="modal-image-empty">
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
              <strong>{{ props.language === 'KO' ? '장소' : 'Venue' }}</strong>
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
              <strong>{{ props.language === 'KO' ? '시간' : 'Time' }}</strong>
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
              <strong>{{ props.language === 'KO' ? '주소' : 'Address' }}</strong>
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

          <button class="btn ghost" type="button" @click="closeModal">
            {{ props.language === 'KO' ? '닫기' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.calendar-page-head p {
  color: rgba(6, 18, 39, 0.76);
}

.today-btn {
  flex-shrink: 0;
  padding: 11px 17px;
  background: rgba(255, 255, 255, 0.86);
  color: #052738;
  font-weight: 800;
  border: 1px solid rgba(6, 18, 39, 0.08);
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(16, 37, 63, 0.06);
  cursor: pointer;
}

.calendar-summary {
  display: grid;
  grid-template-columns: 1.7fr repeat(3, 0.7fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(16, 37, 63, 0.06);
  backdrop-filter: blur(8px);
}

.summary-card span {
  display: block;
  color: rgba(6, 18, 39, 0.56);
  font-size: 12px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  color: #052738;
  font-size: 27px;
}

.summary-card p {
  margin: 7px 0 0;
  color: rgba(6, 18, 39, 0.65);
  font-size: 13px;
}

.summary-main {
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(0, 169, 206, 0.17),
      transparent 32%
    ),
    linear-gradient(135deg, #fff4f9, #eefbff);
}

.calendar-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.65fr);
  gap: 16px;
  align-items: start;
}

.calendar-panel,
.day-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 22px;
  box-shadow: 0 16px 40px rgba(16, 37, 63, 0.08);
  backdrop-filter: blur(10px);
}

.calendar-panel {
  padding: 22px;
}

.calendar-toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 18px;
}

.month-button {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  width: fit-content;
  padding: 9px 13px;
  background: #ffffff;
  color: #052738;
  font-weight: 800;
  border: 1px solid rgba(6, 18, 39, 0.08);
  border-radius: 999px;
  cursor: pointer;
}

.month-button:last-child {
  justify-self: end;
}

.month-title {
  text-align: center;
}

.month-title small {
  color: #d4146a;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.4px;
}

.month-title h2 {
  margin: 3px 0 0;
  color: #052738;
  font-size: 22px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 7px;
}

.day-name {
  padding: 8px 4px;
  text-align: center;
  color: rgba(6, 18, 39, 0.56);
  font-size: 12px;
  font-weight: 800;
}

.calendar-cell {
  position: relative;
  min-height: 106px;
  overflow: hidden;
  padding: 10px;
  text-align: left;
  background: rgba(248, 251, 253, 0.94);
  color: #052738;
  border: 1px solid rgba(6, 18, 39, 0.05);
  border-radius: 13px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.calendar-cell:hover:not(:disabled) {
  z-index: 2;
  border-color: rgba(0, 169, 206, 0.24);
  box-shadow: 0 10px 22px rgba(16, 37, 63, 0.08);
  transform: translateY(-3px);
}

.calendar-cell.muted {
  opacity: 0.3;
  cursor: default;
}

.calendar-cell.today {
  box-shadow: inset 0 0 0 2px rgba(212, 20, 106, 0.45);
}

.calendar-cell.selected {
  background: linear-gradient(150deg, #e7f8ff, #fff0f6);
  border-color: rgba(0, 169, 206, 0.34);
  box-shadow: 0 12px 26px rgba(16, 37, 63, 0.1);
}

.calendar-cell.has-events {
  background: linear-gradient(
    150deg,
    rgba(237, 251, 255, 0.98),
    rgba(255, 248, 252, 0.98)
  );
}

.day-number {
  display: inline-grid;
  place-items: center;
  width: 27px;
  height: 27px;
  font-size: 13px;
  font-weight: 900;
  border-radius: 9px;
}

.calendar-cell.today .day-number {
  background: linear-gradient(135deg, #d4146a, #00a9ce);
  color: #ffffff;
}

.event-preview {
  margin-top: 7px;
}

.event-count {
  display: inline-block;
  padding: 3px 7px;
  background: rgba(0, 169, 206, 0.1);
  color: #087a9e;
  font-size: 10px;
  font-weight: 900;
  border-radius: 999px;
}

.event-preview strong {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: #052738;
  font-size: 12px;
  line-height: 1.35;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-preview small {
  display: block;
  margin-top: 4px;
  color: rgba(6, 18, 39, 0.48);
  font-size: 10px;
}

.day-panel {
  position: sticky;
  top: 78px;
  overflow: hidden;
}

.day-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background:
    radial-gradient(
      circle at 100% 0,
      rgba(0, 169, 206, 0.16),
      transparent 38%
    ),
    linear-gradient(135deg, #fff7fb, #effaff);
  border-bottom: 1px solid rgba(6, 18, 39, 0.06);
}

.day-panel-head span {
  color: #d4146a;
  font-size: 11px;
  font-weight: 900;
}

.day-panel-head h3 {
  margin: 4px 0 0;
  color: #052738;
  font-size: 18px;
}

.day-panel-head > strong {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: #ffffff;
  color: #087a9e;
  font-size: 19px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(16, 37, 63, 0.07);
}

.event-card-list {
  display: grid;
  gap: 9px;
  max-height: 650px;
  overflow-y: auto;
  padding: 14px;
}

.compact-event-card {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) auto;
  gap: 11px;
  align-items: center;
  padding: 13px;
  text-align: left;
  background: #ffffff;
  color: inherit;
  border: 1px solid rgba(6, 18, 39, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.compact-event-card:hover {
  box-shadow: 0 10px 22px rgba(16, 37, 63, 0.08);
  transform: translateY(-2px);
}

.compact-date span,
.compact-date small {
  display: block;
}

.compact-date span {
  color: #087a9e;
  font-size: 11px;
  font-weight: 900;
}

.compact-date small {
  margin-top: 3px;
  color: rgba(6, 18, 39, 0.46);
  font-size: 9px;
}

.compact-event-copy {
  min-width: 0;
}

.compact-event-copy strong {
  display: block;
  overflow: hidden;
  color: #052738;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-event-copy p {
  margin: 5px 0 0;
  overflow: hidden;
  color: rgba(6, 18, 39, 0.58);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-arrow {
  color: rgba(6, 18, 39, 0.34);
}

.empty-day {
  padding: 54px 24px;
  text-align: center;
}

.empty-day span {
  display: block;
  font-size: 42px;
}

.empty-day strong {
  display: block;
  margin-top: 13px;
  color: #052738;
}

.empty-day p {
  margin: 7px 0 0;
  color: rgba(6, 18, 39, 0.58);
  font-size: 13px;
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
  background: linear-gradient(135deg, #eef9ff, #fff4f8);
  border-radius: 22px 22px 0 0;
  box-sizing: border-box;
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

.badge {
  display: inline-block;
  padding: 6px 10px;
  background: linear-gradient(90deg, #eef6ff, #f0fff7);
  color: rgba(6, 18, 39, 0.58);
  font-weight: 700;
  border-radius: 10px;
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

@media (max-width: 1100px) {
  .calendar-summary {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-main {
    grid-column: 1 / -1;
  }

  .calendar-layout {
    grid-template-columns: 1fr;
  }

  .day-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .calendar-page-head {
    align-items: stretch;
    flex-direction: column;
  }

  .today-btn {
    width: fit-content;
  }

  .calendar-summary {
    grid-template-columns: 1fr;
  }

  .summary-main {
    grid-column: auto;
  }

  .calendar-panel {
    padding: 13px;
  }

  .calendar-toolbar {
    grid-template-columns: auto 1fr auto;
    gap: 6px;
  }

  .month-button {
    padding: 8px 10px;
  }

  .month-button span {
    display: none;
  }

  .month-title h2 {
    font-size: 17px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .day-name {
    font-size: 10px;
  }

  .calendar-cell {
    min-height: 76px;
    padding: 6px;
  }

  .day-number {
    width: 23px;
    height: 23px;
    font-size: 11px;
  }

  .event-count {
    padding: 2px 5px;
    font-size: 9px;
  }

  .event-preview strong {
    font-size: 10px;
    -webkit-line-clamp: 2;
  }

  .event-preview small {
    display: none;
  }

  .compact-event-card {
    grid-template-columns: 70px minmax(0, 1fr) auto;
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
