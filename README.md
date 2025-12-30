# 게시판 & 데이터 시각화 채용 과제

Next.js를 기반으로 한 게시판 CRUD 기능과 데이터 시각화 기능을 제공하는 웹 애플리케이션입니다.

## 📋 목차

- [기술 스택](#-기술-스택)
- [주요 구현 기능](#-주요-구현-기능)
- [프로젝트 실행 방법](#-프로젝트-실행-방법)
- [API 연결](#-api-연결)
- [배포](#-배포)

## 🛠 기술 스택

### Frontend
- **Next.js 14** (App Router) - React 프레임워크
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **styled-components** - CSS-in-JS 스타일링
- **recharts** - 데이터 시각화 차트 라이브러리

### Backend
- **Next.js API Routes** - 서버 사이드 API 프록시

### 개발 도구
- **ESLint** - 코드 품질 관리
- **TypeScript** - 정적 타입 검사

## ✨ 주요 구현 기능

### 게시판 기능
- ✅ **CRUD 기능**: 게시글 작성, 조회, 수정, 삭제
- ✅ **테이블 UI**: 게시글 목록을 테이블 형태로 표시
- ✅ **컬럼 관리**: 
  - 컬럼 넓이 드래그로 조절 가능
  - 컬럼 표시/숨김 기능
  - 상단 헤더 고정 (Sticky Header)
- ✅ **무한 스크롤**: 커서 기반 페이지네이션으로 테이블 내부 스크롤 시 자동 로딩
- ✅ **검색 기능**: 제목 및 본문 내용 검색 (검색 버튼 클릭 시 실행)
- ✅ **정렬 기능**: 제목 또는 작성일 기준 오름차순/내림차순 정렬
- ✅ **필터 기능**: 카테고리별 필터링 (NOTICE, QNA, FREE)
- ✅ **금칙어 필터링**: 특정 단어 포함 시 게시글 등록/수정 불가
- ✅ **상세 페이지**: 게시글 클릭 시 상세 조회 페이지로 이동

### 인증 기능
- ✅ **로그인/로그아웃**: JWT 토큰 기반 인증
- ✅ **인증 상태 관리**: Context API를 통한 전역 상태 관리
- ✅ **보호된 라우트**: 인증이 필요한 기능에 토큰 자동 포함

### 데이터 시각화 기능
- ✅ **바 차트**: 커피 브랜드 인기도, 스낵 브랜드 점유율 시각화
- ✅ **도넛 차트**: 브랜드 데이터 원형 차트로 표시
- ✅ **스택형 바/면적 차트**: 주간 기분 트렌드, 운동 트렌드 누적 표시
- ✅ **멀티라인 차트**: 
  - 커피 소비량과 버그 수, 생산성 관계 시각화
  - 스낵 소비와 회의 불참, 사기 관계 시각화
  - 이중 Y축 지원 (왼쪽/오른쪽)
  - 실선/점선 구분, 원형/사각형 마커 구분
- ✅ **인터랙티브 범례**: 
  - 데이터 시리즈 색상 변경 기능
  - 데이터 보이기/숨기기 토글 기능

## 🚀 프로젝트 실행 방법

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd project
```

2. **의존성 패키지 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 확인**
   - http://localhost:3000 접속

### 기타 명령어

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 실행
npm run lint
```

## 🔌 API 연결

이 프로젝트는 **https://fe-hiring-rest-api.vercel.app** API를 사용합니다.

### Swagger 문서
https://fe-hiring-rest-api.vercel.app/docs

### 환경 변수 설정 (선택사항)

다른 API를 사용하려면 프로젝트 루트에 `.env.local` 파일을 생성하고 외부 API URL을 설정하세요:


## 🌐 배포

### GitHub 저장소에 푸시

1. **GitHub 저장소 생성**
   - GitHub에서 새 저장소 생성
   - 저장소 URL 복사

2. **로컬 저장소 초기화 및 푸시**
```bash
# Git 초기화 (이미 초기화되어 있다면 생략)
git init

# 원격 저장소 추가
git remote add origin <your-github-repo-url>

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit"

# 메인 브랜치에 푸시
git branch -M main
git push -u origin main
```

3. **환경 변수 설정**
   - GitHub 저장소 Settings > Secrets and variables > Actions에서 환경 변수 추가
   - 또는 배포 플랫폼(Vercel, Netlify 등)에서 환경 변수 설정

### GitHub Pages 배포 (정적 사이트)

Next.js를 정적 사이트로 export하여 GitHub Pages에 배포:

```bash
# next.config.mjs에 output: 'export' 추가 후
npm run build
```

또는 **Vercel**과 GitHub 연동 (권장):
- Vercel에 GitHub 저장소 연결 시 자동 배포
- [Vercel](https://vercel.com)에서 GitHub 저장소 import

### 배포 링크
(배포 후 링크를 여기에 추가하세요)

---

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
