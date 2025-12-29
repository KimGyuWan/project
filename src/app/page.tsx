'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Post, Category, SortField, SortOrder } from '@/types/post';
import PostTable from '@/components/PostTable';
import PostForm from '@/components/PostForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user, logout, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 필터 상태
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevFiltersRef = useRef<string>('');
  const prevTokenRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fetchPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sortField) params.append('sortField', sortField);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/posts?${params}`, {
        headers,
      });
      const data = await response.json();

      if (reset) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortField, sortOrder, token]);

  // 필터 변경 감지 (token 제외)
  const filterKey = `${search}-${category}-${sortField}-${sortOrder}`;
  
  // 초기 로드 및 필터 변경 시
  useEffect(() => {
    // AuthContext가 로딩 중이면 요청하지 않음
    if (authLoading) return;
    
    // token이 null에서 실제 값으로 변경된 경우 (로그인 후)
    const tokenChanged = prevTokenRef.current === null && token !== null;
    if (tokenChanged) {
      prevTokenRef.current = token;
      // 필터 체크를 무시하고 바로 실행
    } else {
      // 필터가 실제로 변경되었는지 확인 (초기 로드는 제외)
      if (prevFiltersRef.current === filterKey && prevFiltersRef.current !== '') {
        return;
      }
      prevFiltersRef.current = filterKey;
    }
    
    // token 변경 추적
    if (prevTokenRef.current !== token) {
      prevTokenRef.current = token;
    }
    
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    isMountedRef.current = true;
    
    setPage(1);
    setPosts([]);
    
    const fetchData = async () => {
      // 컴포넌트가 언마운트되었거나 요청이 취소되었는지 확인
      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }
      
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '10',
        });
        
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (sortField) params.append('sortField', sortField);
        if (sortOrder) params.append('sortOrder', sortOrder);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // 최신 token 사용 (의존성 배열에 포함하지 않음)
        const currentToken = token;
        if (currentToken) {
          headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(`/api/posts?${params}`, {
          headers,
          signal: abortController.signal,
        });
        
        // 요청이 취소되었는지 다시 확인
        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }
        
        const data = await response.json();

        // 컴포넌트가 여전히 마운트되어 있는지 확인
        if (!isMountedRef.current || abortController.signal.aborted) {
          return;
        }

        setPosts(data.posts || []);
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
      } catch (error: any) {
        if (error.name === 'AbortError' || !isMountedRef.current) {
          return;
        }
        console.error('Failed to fetch posts:', error);
      } finally {
        if (isMountedRef.current && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, authLoading]);

  // 무한 스크롤
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, fetchPosts]);

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
        const error = await response.json();
        throw new Error(error.error || '게시글 작성에 실패했습니다.');
      }

      setShowForm(false);
      setPage(1);
      fetchPosts(1, true);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdate = async (title: string, body: string, category: Category, tags: string[]) => {
    if (!editingPost) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, body, category, tags }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 수정에 실패했습니다.');
      }

      setEditingPost(null);
      setShowForm(false);
      setPage(1);
      fetchPosts(1, true);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.');
      }

      setPage(1);
      fetchPosts(1, true);
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, true);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div>
            <h1>게시판</h1>
            <p>총 {total}개의 게시글</p>
          </div>
          <AuthSection>
            {isAuthenticated ? (
              <>
                <UserInfo>{user?.email}</UserInfo>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
              </>
            ) : (
              <LoginButton onClick={() => router.push('/login')}>로그인</LoginButton>
            )}
          </AuthSection>
        </HeaderContent>
      </Header>

      {!showForm ? (
        <>
          <Controls>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="제목 또는 본문 검색..."
              />
              <SearchButton type="submit">
                검색
              </SearchButton>
            </SearchForm>

            <Filters>
              <Select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category | '')}
              >
                <option value="">전체 카테고리</option>
                <option value="NOTICE">공지</option>
                <option value="QNA">질문</option>
                <option value="FREE">자유</option>
              </Select>

              <Select
                value={sortField}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortField(e.target.value as SortField)}
              >
                <option value="createdAt">작성일</option>
                <option value="title">제목</option>
              </Select>

              <Select
                value={sortOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortOrder)}
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </Select>

              <CreateButton onClick={() => router.push('/posts/new')}>
                게시글 작성
              </CreateButton>
            </Filters>
          </Controls>

          <PostTable
            posts={posts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <ObserverTarget ref={observerTarget}>
            {loading && <Loading>로딩 중...</Loading>}
            {!hasMore && posts && posts.length > 0 && (
              <EndMessage>모든 게시글을 불러왔습니다.</EndMessage>
            )}
          </ObserverTarget>
        </>
      ) : (
        <PostForm
          post={editingPost}
          onSubmit={editingPost ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  margin-bottom: 30px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  h1 {
    font-size: 32px;
    margin: 0 0 8px 0;
    color: #333;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.span`
  color: #666;
  font-size: 14px;
`;

const LoginButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Controls = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-left: auto;

  &:hover {
    background: #218838;
  }
`;

const ObserverTarget = styled.div`
  margin-top: 20px;
  padding: 20px;
  text-align: center;
`;

const Loading = styled.div`
  color: #666;
  font-size: 14px;
`;

const EndMessage = styled.div`
  color: #999;
  font-size: 14px;
  padding: 20px;
`;
