# API 연결 가이드

## Swagger 문서

API 문서: https://fe-hiring-rest-api.vercel.app/docs

## API 베이스 URL

기본 설정: `https://fe-hiring-rest-api.vercel.app`

## 엔드포인트 구조

Swagger 문서를 확인하여 실제 엔드포인트 경로를 확인하세요.

### 예상되는 엔드포인트

1. **게시글 목록 조회**
   - `GET /posts` 또는 `GET /api/posts`
   - 쿼리 파라미터: `page`, `limit`, `search`, `category`, `sortField`, `sortOrder`

2. **게시글 생성**
   - `POST /posts` 또는 `POST /api/posts`
   - Body: `{ title: string, content: string, category: Category }`

3. **게시글 단일 조회**
   - `GET /posts/:id` 또는 `GET /api/posts/:id`

4. **게시글 수정**
   - `PUT /posts/:id` 또는 `PUT /api/posts/:id`
   - Body: `{ title: string, content: string, category: Category }`

5. **게시글 삭제**
   - `DELETE /posts/:id` 또는 `DELETE /api/posts/:id`

## 경로 수정 방법

만약 실제 API 경로가 `/api/posts`라면, 다음 파일들을 수정하세요:

1. `src/app/api/posts/route.ts` - `/posts`를 `/api/posts`로 변경
2. `src/app/api/posts/[id]/route.ts` - `/posts`를 `/api/posts`로 변경

또는 환경 변수로 설정:

```bash
# .env.local
EXTERNAL_API_BASE_URL=https://fe-hiring-rest-api.vercel.app
```

그리고 코드에서 `/posts` 경로를 그대로 사용하면 됩니다.

## 응답 형식 확인

Swagger 문서에서 실제 응답 형식을 확인하고, 필요시 `src/types/post.ts`의 타입 정의를 수정하세요.

