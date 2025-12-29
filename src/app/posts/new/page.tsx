'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import PostForm from '@/components/PostForm';
import { Category } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';

export default function NewPostPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [error, setError] = useState('');

  const handleCreate = async (title: string, body: string, category: Category, tags: string[]) => {
    try {
      setError('');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, body, category, tags }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '게시글 작성에 실패했습니다.');
      }

      // 작성 성공 시 게시판 목록으로 이동
      router.push('/');
    } catch (err: any) {
      setError(err.message || '게시글 작성에 실패했습니다.');
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <Container>
      {/* <Header>
        <Title>게시글 작성</Title>
      </Header> */}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <PostForm
        post={null}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </Container>
  );
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
`;

