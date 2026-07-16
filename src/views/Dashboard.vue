<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useLocalHub } from '../stores/localhub'

const props = defineProps({ language: { type: String, default: 'KO' } })
const { posts, totals, totalViews, totalLikes } = useLocalHub()

const categoryLabels = {'음식점':'Restaurants','축제/공연/행사':'Festivals & Events','문화시설':'Cultural Facilities','레포츠':'Leisure Sports','숙박':'Accommodation','쇼핑':'Shopping','여행코스':'Travel Courses'}
const boardCategoryLabels = {'여행질문':'Travel Questions','맛집후기':'Restaurant Reviews','축제정보':'Festival Information','자유게시판':'Free Board'}
const categoryLabel = (value) => props.language === 'KO' ? value : categoryLabels[value]
const boardCategoryLabel = (value) => props.language === 'KO' ? value : boardCategoryLabels[value]

const categories = [
  '음식점',
  '축제/공연/행사',
  '문화시설',
  '레포츠',
  '숙박',
  '쇼핑',
  '여행코스'
]

const boardCategories = [
  '여행질문',
  '맛집후기',
  '축제정보',
  '자유게시판'
]

const totalTourCount = computed(() =>
  Object.values(totals).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  )
)

let categoryChart
let boardChart

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(props.language === 'KO' ? 'ko-KR' : 'en-US')

onMounted(() =>
  nextTick(() => {
    categoryChart = new Chart(
      document.getElementById('categoryChart'),
      {
        type: 'bar',

        data: {
          labels: categories.map(categoryLabel),

          datasets: [
            {
              data: categories.map(
                (category) => totals[category] || 0
              ),

              backgroundColor: [
                '#d4146a',
                '#00a9ce',
                '#7c3aed',
                '#0ea5e9',
                '#f59e0b',
                '#ec4899',
                '#10b981'
              ],

              borderRadius: 5,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          layout: {
            padding: {
              top: 5,
              right: 10,
              bottom: 0,
              left: 5
            }
          },

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              titleFont: {
                size: 13,
                weight: 'bold'
              },

              bodyFont: {
                size: 13
              },

              callbacks: {
                label: (context) =>
                  `${Number(context.raw || 0).toLocaleString(props.language === 'KO' ? 'ko-KR' : 'en-US')}${props.language === 'KO' ? '건' : ''}`
              }
            }
          },

          scales: {
            x: {
              grid: {
                display: false
              },

              ticks: {
                color: '#334155',
                autoSkip: false,
                maxRotation: 30,
                minRotation: 0,

                font: {
                  size: 13,
                  weight: '600'
                }
              }
            },

            y: {
              beginAtZero: true,

              grid: {
                color: 'rgba(148, 163, 184, 0.25)'
              },

              ticks: {
                color: '#475569',

                font: {
                  size: 12,
                  weight: '500'
                },

                callback: (value) =>
                  Number(value).toLocaleString(props.language === 'KO' ? 'ko-KR' : 'en-US')
              }
            }
          }
        }
      }
    )

    boardChart = new Chart(
      document.getElementById('boardChart'),
      {
        type: 'doughnut',

        data: {
          labels: boardCategories.map(boardCategoryLabel),

          datasets: [
            {
              data: boardCategories.map(
                (category) =>
                  posts.filter(
                    (post) => post.category === category
                  ).length
              ),

              backgroundColor: [
                '#d4146a',
                '#00a9ce',
                '#8b5cf6',
                '#f59e0b'
              ],

              borderColor: '#ffffff',
              borderWidth: 3,
              hoverOffset: 6
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',

          layout: {
            padding: {
              top: 0,
              right: 10,
              bottom: 5,
              left: 10
            }
          },

          plugins: {
            legend: {
              position: 'top',

              labels: {
                color: '#334155',
                padding: 16,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                boxWidth: 12,
                boxHeight: 12,

                font: {
                  size: 13,
                  weight: '600'
                }
              }
            },

            tooltip: {
              titleFont: {
                size: 13,
                weight: 'bold'
              },

              bodyFont: {
                size: 13
              },

              callbacks: {
                label: (context) =>
                  `${context.label}: ${context.raw}${props.language === 'KO' ? '개' : ''}`
              }
            }
          }
        }
      }
    )
  })
)

onBeforeUnmount(() => {
  categoryChart?.destroy()
  boardChart?.destroy()
})
</script>

<template>
  <section class="page">
    <div class="container">
      <div class="page-head">
        <div>
          <div class="eyebrow">DASHBOARD</div>

          <h1>{{ props.language === 'KO' ? '관광 데이터 · 커뮤니티 대시보드' : 'Tourism Data & Community Dashboard' }}</h1>

          <p>{{ props.language === 'KO' ? '실제 JSON 건수와 현재 브라우저의 커뮤니티 통계를 확인합니다.' : 'View actual JSON counts and community statistics in this browser.' }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="panel stat">
          <span>{{ props.language === 'KO' ? '전체 관광 데이터' : 'Total Tourism Data' }}</span>
          <strong>{{ formatNumber(totalTourCount) }}</strong>
        </div>

        <div class="panel stat">
          <span>{{ props.language === 'KO' ? '게시글' : 'Posts' }}</span>
          <strong>{{ posts.length }}</strong>
        </div>

        <div class="panel stat">
          <span>{{ props.language === 'KO' ? '누적 조회' : 'Total Views' }}</span>
          <strong>{{ totalViews }}</strong>
        </div>

        <div class="panel stat">
          <span>{{ props.language === 'KO' ? '누적 좋아요' : 'Total Likes' }}</span>
          <strong>{{ totalLikes }}</strong>
        </div>
      </div>

      <div class="charts">
        <div class="panel chart">
          <h3>{{ props.language === 'KO' ? '콘텐츠 유형별 데이터 수' : 'Data Count by Content Type' }}</h3>

          <div class="chart-canvas">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>

        <div class="panel chart">
          <h3>{{ props.language === 'KO' ? '커뮤니티 카테고리 비율' : 'Community Category Distribution' }}</h3>

          <div class="chart-canvas">
            <canvas id="boardChart"></canvas>
          </div>
        </div>
      </div>

      <div class="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ props.language === 'KO' ? '데이터 유형' : 'Data Type' }}</th>
              <th>{{ props.language === 'KO' ? '건수' : 'Count' }}</th>
              <th>{{ props.language === 'KO' ? '표시 방식' : 'Display' }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="category in categories"
              :key="category"
            >
              <td>{{ categoryLabel(category) }}</td>

              <td>
                {{ formatNumber(totals[category]) }}
              </td>

              <td>
                {{
                  category === '축제/공연/행사'
                    ? (props.language === 'KO' ? '지도 · 캘린더' : 'Map · Calendar')
                    : (props.language === 'KO' ? '지도 · 목록' : 'Map · List')
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat {
  padding: 22px;
}

.stat span {
  color: var(--muted);
  font-size: 13px;
}

.stat strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  align-items: stretch;
}

.chart {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 430px;
  padding: 20px;
  box-sizing: border-box;
}

.chart h3 {
  flex-shrink: 0;
  margin: 0 0 16px;
  color: #172033;
  font-size: 20px;
  font-weight: 800;
}

.chart-canvas {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.chart-canvas canvas {
  width: 100% !important;
  height: 100% !important;
}

.table-wrap {
  margin-top: 16px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  font-size: 13px;
}

th {
  background: #fafbfc;
  color: var(--muted);
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 430px;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 400px;
    padding: 16px;
  }

  .chart h3 {
    font-size: 18px;
  }
}
</style>