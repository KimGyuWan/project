'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import PostForm from '@/components/PostForm';
import { Category } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';

export default function NewPostPage() {
  const router = useRouter();
  const { token } = useAuth();

  const handleCreate = async (title: string, body: string, category: Category, tags: string[]) => {
    try {
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error('게시글 작성에 실패했습니다.');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <Container>
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

