This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 게시판 기능

- 게시글 작성 / 조회 / 수정 / 삭제 (CRUD)
- 테이블 형태 목록 표시
- 컬럼 넓이 조절 및 숨김/보임 기능
- 무한 스크롤 기반 페이지네이션
- 검색, 정렬, 필터 기능
- 금칙어 필터링

## API 연결

이 프로젝트는 **https://fe-hiring-rest-api.vercel.app** API를 사용합니다.

Swagger 문서: https://fe-hiring-rest-api.vercel.app/docs

### 환경 변수 설정 (선택사항)

다른 API를 사용하려면 프로젝트 루트에 `.env.local` 파일을 생성하고 외부 API URL을 설정하세요:

```bash
# 외부 API 베이스 URL (서버 사이드에서 사용)
EXTERNAL_API_BASE_URL=https://fe-hiring-rest-api.vercel.app
```

기본값으로 `https://fe-hiring-rest-api.vercel.app`이 설정되어 있습니다.

### API 엔드포인트

외부 API는 다음 엔드포인트를 제공해야 합니다:

- `GET /api/posts` - 게시글 목록 조회 (쿼리 파라미터: page, limit, search, category, sortField, sortOrder)
- `POST /api/posts` - 게시글 생성
- `GET /api/posts/:id` - 게시글 단일 조회
- `PUT /api/posts/:id` - 게시글 수정
- `DELETE /api/posts/:id` - 게시글 삭제

### API 응답 형식

**게시글 목록 (GET /api/posts):**
```json
{
  "posts": [...],
  "total": 100,
  "hasMore": true
}
```

**게시글 단일 (GET /api/posts/:id):**
```json
{
  "id": "1",
  "title": "제목",
  "content": "본문",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
