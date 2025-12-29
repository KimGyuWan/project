import { NextRequest, NextResponse } from 'next/server';
import { containsForbiddenWords } from '@/lib/posts';

// 외부 API 베이스 URL (서버 사이드에서만 사용)
// Swagger 문서: https://fe-hiring-rest-api.vercel.app/docs
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'https://fe-hiring-rest-api.vercel.app';

// 게시글 단일 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더가 있으면 전달
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/posts/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch post' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch post', details: error.message },
      { status: 500 }
    );
  }
}

// 게시글 수정 (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
      // 중복 제거 (Set을 배열로 변환할 때 Array.from 사용하여 ES5 호환)
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

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ title, body: bodyText, category, tags: processedTags }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update post' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to update post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update post', details: error.message },
      { status: 500 }
    );
  }
}

// 게시글 삭제 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더가 있으면 전달
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete post' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to delete post' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete post', details: error.message },
      { status: 500 }
    );
  }
}

