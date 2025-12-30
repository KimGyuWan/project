import { NextRequest, NextResponse } from 'next/server';

// 외부 API 베이스 URL
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || 'https://fe-hiring-rest-api.vercel.app';

// Mock API 프록시 (동적 경로 처리)
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;
    const pathString = path.join('/');
    
    // Mock API 엔드포인트로 요청 전달
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/mock/${pathString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch mock data', details: errorMessage },
      { status: 500 }
    );
  }
}

