'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Post, Category } from '@/types/post';

interface PostFormProps {
  post?: Post | null;
  onSubmit: (title: string, body: string, category: Category, tags: string[]) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['NOTICE', 'QNA', 'FREE'];
const CATEGORY_LABELS: Record<Category, string> = {
  NOTICE: '공지',
  QNA: '질문',
  FREE: '자유',
};

export default function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<Category>('NOTICE');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      setCategory(post.category);
      setTags(post.tags || []);
    }
  }, [post]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    
    // 중복 제거 및 최대 5개 제한
    if (tags.length >= 5) {
      setError('태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      setError('이미 추가된 태그입니다.');
      return;
    }
    
    // 각 태그는 24자 이내
    if (trimmedTag.length > 24) {
      setError('태그는 24자 이내로 입력해주세요.');
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setTagInput('');
    setError('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 제목 최대 80자 검증
    if (title.length > 80) {
      setError('제목은 최대 80자까지 입력할 수 있습니다.');
      return;
    }
    
    // 본문 최대 2000자 검증
    if (body.length > 2000) {
      setError('본문은 최대 2000자까지 입력할 수 있습니다.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onSubmit(title, body, category, tags);
      // 폼 초기화
      if (!post) {
        setTitle('');
        setBody('');
        setCategory('NOTICE');
        setTags([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('오류가 발생했습니다.');
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{post ? '게시글 수정' : '게시글 작성'}</h2>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormGroup>
        <label htmlFor="category">카테고리</label>
        <Select
          id="category"
          value={category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category)}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <label htmlFor="title">제목 (최대 80자)</label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          maxLength={80}
          placeholder="제목을 입력하세요"
        />
        <CharCount>{title.length}/80</CharCount>
      </FormGroup>

      <FormGroup>
        <label htmlFor="body">본문 (최대 2000자)</label>
        <Textarea
          id="body"
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          required
          maxLength={2000}
          rows={10}
          placeholder="본문을 입력하세요"
        />
        <CharCount>{body.length}/2000</CharCount>
      </FormGroup>

      <FormGroup>
        <label htmlFor="tags">태그 (최대 5개, 각 24자 이내)</label>
        <TagInputContainer>
          <Input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="태그를 입력하고 Enter를 누르세요"
            maxLength={24}
          />
          <AddTagButton type="button" onClick={handleAddTag}>
            추가
          </AddTagButton>
        </TagInputContainer>
        {tags.length > 0 && (
          <TagList>
            {tags.map((tag, index) => (
              <TagItem key={index}>
                {tag}
                <RemoveTagButton type="button" onClick={() => handleRemoveTag(tag)}>
                  ×
                </RemoveTagButton>
              </TagItem>
            ))}
          </TagList>
        )}
      </FormGroup>

      <FormActions>
        <CancelButton
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </CancelButton>
        <SubmitButton
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : post ? '수정' : '작성'}
        </SubmitButton>
      </FormActions>
    </Form>
  );
}

const Form = styled.form`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;

  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    color: #333;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: #007bff;
  color: white;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CharCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: right;
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AddTagButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: #28a745;
  color: white;
  white-space: nowrap;

  &:hover {
    background: #218838;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const TagItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e9ecef;
  border-radius: 16px;
  font-size: 13px;
  color: #495057;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: #dee2e6;
    color: #495057;
  }
`;