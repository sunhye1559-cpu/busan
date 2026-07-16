import OpenAI from "openai";

const createJsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

export default async (request) => {
  if (request.method !== "POST") {
    return createJsonResponse(
      { error: "POST 요청만 가능합니다." },
      405,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY가 설정되지 않았습니다.");

    return createJsonResponse(
      { error: "서버 환경변수가 설정되지 않았습니다." },
      500,
    );
  }

  try {
    const body = await request.json();

    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    const items = Array.isArray(body.items) ? body.items : [];
    const posts = Array.isArray(body.posts) ? body.posts : [];

    if (!question) {
      return createJsonResponse(
        { error: "질문이 없습니다." },
        400,
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions:
        "당신은 LocalHub 부산 지역정보 챗봇입니다. 제공된 JSON 문맥을 우선 활용하고 한국어 존댓말로 간결하게 답하세요.",
      input: `
질문:
${question}

관광 데이터:
${JSON.stringify(items)}

커뮤니티 글:
${JSON.stringify(posts)}
      `,
      max_output_tokens: 1500,
    });

    const answer = response.output_text?.trim() || "";

    return createJsonResponse({
      answer:
        answer ||
        "관련 정보를 바탕으로 답변을 생성하지 못했습니다.",
    });
  } catch (error) {
    console.error("챗봇 Function 오류:", error);

    return createJsonResponse(
      { error: "OpenAI API 요청에 실패했습니다." },
      500,
    );
  }
};

// 브라우저에서는 /api/chat으로 호출
export const config = {
  path: "/api/chat",
};