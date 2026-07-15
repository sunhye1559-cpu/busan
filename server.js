import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post('/api/chat', async (req, res) => {
  try {
    const { question, items, posts } = req.body

    if (!question) {
      return res.status(400).json({
        error: '질문이 없습니다.'
      })
    }

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      instructions:
        '당신은 LocalHub 부산 지역정보 챗봇입니다. 제공된 JSON 문맥을 우선 활용하고 한국어 존댓말로 간결하게 답하세요.',
      input: `
질문: ${question}

관광 데이터:
${JSON.stringify(items)}

커뮤니티 글:
${JSON.stringify(posts)}
      `,
      max_output_tokens: 1500
    })

    const answer =
  response.output_text?.trim() ||
  response.output
    ?.flatMap((item) => item.content || [])
    .find((item) => item.type === 'output_text')
    ?.text?.trim() ||
  ''

console.log('OpenAI 답변:', answer)

res.json({
  answer: answer || '관련 정보를 바탕으로 답변을 생성하지 못했습니다.'
})
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: error.message || 'OpenAI API 요청에 실패했습니다.'
    })
  }
})

app.listen(port, () => {
  console.log(`백엔드 서버 실행: http://localhost:${port}`)
})