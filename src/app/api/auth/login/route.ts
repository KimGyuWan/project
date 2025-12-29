import { NextRequest, NextResponse } from 'next/server';

// 외부 API 베이스 URL (서버 사이드에서만 사용)
// Swagger 문서: https://fe-hiring-rest-api.vercel.app/docs
const EXTERNAL_API_URL = process.env.REACT_APP_API_URL || 'https://fe-hiring-rest-api.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 외부 API로 로그인 요청 전달
    const response = await fetch(`${EXTERNAL_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to login', details: error.message },
      { status: 500 }
    );
  }
}

