'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { Post } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  NOTICE: '공지',
  QNA: '질문',
  FREE: '자유',
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, loading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // AuthContext가 로딩 중이면 요청하지 않음
    if (authLoading) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/posts/${params.id}`, {
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          // 401 에러인 경우 로그인 페이지로 리다이렉트
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error(data.error || data.message || '게시글을 불러오는데 실패했습니다.');
        }

        // API 응답 구조 확인 및 데이터 추출
        const postData = data.data || data.item || data || null;
        
        if (!postData || !postData.id) {
          throw new Error('게시글 데이터를 찾을 수 없습니다.');
        }

        setPost(postData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('게시글을 불러오는데 실패했습니다.');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id, token, authLoading]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  if (loading || authLoading) {
    return (
      <Container>
        <Loading>로딩 중...</Loading>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container>
        <ErrorMessage>{error || '게시글을 찾을 수 없습니다.'}</ErrorMessage>
        <BackButton onClick={() => router.push('/posts')}>목록으로</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.push('/posts')}>← 목록으로</BackButton>
        <Title>{post.title}</Title>
        <MetaInfo>
          <MetaItem>
            <Label>카테고리:</Label>
            <Value>{CATEGORY_LABELS[post.category] || post.category}</Value>
          </MetaItem>
          <MetaItem>
            <Label>작성일:</Label>
            <Value>{formatDate(post.createdAt)}</Value>
          </MetaItem>
          {post.tags && post.tags.length > 0 && (
            <MetaItem>
              <Label>태그:</Label>
              <TagList>
                {post.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagList>
            </MetaItem>
          )}
        </MetaInfo>
      </Header>

      <Content>
        <Body>{post.body}</Body>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 14px;
`;

const Value = styled.span`
  color: #333;
  font-size: 14px;
`;

const TagList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 4px 12px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 13px;
  color: #495057;
`;

const Content = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const Body = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
`;

