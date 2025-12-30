import { NextRequest, NextResponse } from 'next/server';
import { containsForbiddenWords } from '@/lib/posts';

// 외부 API 베이스 URL (서버 사이드에서만 사용)
// Swagger 문서: https://fe-hiring-rest-api.vercel.app/docs
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'https://fe-hiring-rest-api.vercel.app';

// 게시글 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');

    // 쿼리 파라미터를 외부 API로 전달
    const params = new URLSearchParams();
    
    // 모든 파라미터를 먼저 복사
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    // 정렬 파라미터 변환 (외부 API가 sortBy와 order를 사용한다고 가정)
    const sortField = searchParams.get('sortField') || searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') || searchParams.get('order') || searchParams.get('direction');
    
    // sortBy와 order 파라미터 추가 (외부 API가 이 이름을 사용할 수 있음)
    if (sortField) {
      params.set('sortBy', sortField);
    }
    if (sortOrder) {
      params.set('order', sortOrder);
    }
    
    // 디버깅: 전달되는 파라미터 확인
    console.log('API Request params:', params.toString());

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더가 있으면 전달
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/posts?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch posts' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch posts from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch posts from external API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch posts from external API', details: errorMessage },
      { status: 500 }
    );
  }
}

// 게시글 생성 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: bodyText, category, tags } = body;
    const authHeader = request.headers.get('authorization');

    if (!title || !bodyText || !category) {
      return NextResponse.json(
        { error: 'Title, body, and category are required' },
        { status: 400 }
      );
    }

    // 제목 최대 80자 검증
    if (title.length > 80) {
      return NextResponse.json(
        { error: '제목은 최대 80자까지 입력할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 본문 최대 2000자 검증
    if (bodyText.length > 2000) {
      return NextResponse.json(
        { error: '본문은 최대 2000자까지 입력할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 태그 검증
    let processedTags: string[] = [];
    if (tags && Array.isArray(tags)) {
      // 중복 제거
      processedTags = Array.from(new Set(tags));
      
      // 최대 5개 제한
      if (processedTags.length > 5) {
        return NextResponse.json(
          { error: '태그는 최대 5개까지 추가할 수 있습니다.' },
          { status: 400 }
        );
      }
      
      // 각 태그 24자 이내 검증
      for (const tag of processedTags) {
        if (typeof tag !== 'string' || tag.length > 24) {
          return NextResponse.json(
            { error: '태그는 각각 24자 이내로 입력해주세요.' },
            { status: 400 }
          );
        }
      }
    }

    // 금칙어 검사 (본문에만 적용)
    if (containsForbiddenWords(title) || containsForbiddenWords(bodyText)) {
      return NextResponse.json(
        { error: '금칙어가 포함되어 있습니다.' },
        { status: 400 }
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더가 있으면 전달
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, body: bodyText, category, tags: processedTags }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create post' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to create post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create post', details: errorMessage },
      { status: 500 }
    );
  }
}

