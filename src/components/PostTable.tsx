'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Post } from '@/types/post';

interface PostTableProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

interface ColumnConfig {
  key: keyof Post;
  label: string;
  width: number;
  visible: boolean;
  resizable: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  NOTICE: '공지',
  QNA: '질문',
  FREE: '자유',
};

export default function PostTable({ posts, onEdit, onDelete }: PostTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'id', label: 'ID', width: 80, visible: true, resizable: true },
    { key: 'title', label: '제목', width: 300, visible: true, resizable: true },
    { key: 'body', label: '본문', width: 400, visible: true, resizable: true },
    { key: 'category', label: '카테고리', width: 120, visible: true, resizable: true },
    { key: 'tags', label: '태그', width: 200, visible: true, resizable: true },
    { key: 'createdAt', label: '작성일', width: 180, visible: true, resizable: true },
  ]);

  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (!columns[index].resizable) return;
    setResizingColumn(index);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columns[index].width);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingColumn === null) return;
    const diff = e.clientX - resizeStartX;
    const newWidth = Math.max(50, resizeStartWidth + diff);
    
    setColumns(prev => {
      const newColumns = [...prev];
      newColumns[resizingColumn] = {
        ...newColumns[resizingColumn],
        width: newWidth,
      };
      return newColumns;
    });
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleMouseUp = useCallback(() => {
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (resizingColumn !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  const toggleColumnVisibility = (index: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      newColumns[index] = {
        ...newColumns[index],
        visible: !newColumns[index].visible,
      };
      return newColumns;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <TableContainer $isResizing={resizingColumn !== null}>
      <ColumnControls>
        <h3>컬럼 표시/숨김</h3>
        {columns.map((col, index) => (
          <CheckboxLabel key={col.key}>
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => toggleColumnVisibility(index)}
            />
            {col.label}
          </CheckboxLabel>
        ))}
      </ColumnControls>
      
      <TableWrapper>
        <Table ref={tableRef}>
          <thead>
            <tr>
              {visibleColumns.map((col, index) => {
                const colIndex = columns.findIndex(c => c.key === col.key);
                return (
                  <Th
                    key={col.key}
                    width={col.width}
                  >
                    <ThContent>
                      {col.label}
                    </ThContent>
                    {col.resizable && (
                      <ResizeHandle
                        onMouseDown={(e) => handleMouseDown(colIndex, e)}
                        title="드래그하여 컬럼 넓이 조절"
                      />
                    )}
                  </Th>
                );
              })}
              <Th width={120}>작업</Th>
            </tr>
          </thead>
          <tbody>
            {posts && posts.length === 0 ? (
              <tr>
                <EmptyCell colSpan={visibleColumns.length + 1}>
                  게시글이 없습니다.
                </EmptyCell>
              </tr>
            ) : (
              posts && posts.map((post) => (
                <tr key={post.id}>
                  {visibleColumns.map((col) => (
                    <Td key={col.key}>
                      {col.key === 'createdAt'
                        ? formatDate(post[col.key] as string)
                        : col.key === 'body'
                        ? (post[col.key] as string).length > 50
                          ? (post[col.key] as string).substring(0, 50) + '...'
                          : post[col.key]
                        : col.key === 'category'
                        ? CATEGORY_LABELS[post[col.key] as string] || post[col.key]
                        : col.key === 'tags'
                        ? Array.isArray(post[col.key])
                          ? (post[col.key] as string[]).join(', ') || '-'
                          : '-'
                        : post[col.key]}
                    </Td>
                  ))}
                  <Td>
                    <ActionButtons>
                      <EditButton onClick={() => onEdit(post)}>
                        수정
                      </EditButton>
                      <DeleteButton onClick={() => onDelete(post.id)}>
                        삭제
                      </DeleteButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
}

const TableContainer = styled.div<{ $isResizing?: boolean }>`
  width: 100%;
  margin-top: 20px;
  user-select: ${props => props.$isResizing ? 'none' : 'auto'};
  cursor: ${props => props.$isResizing ? 'col-resize' : 'default'};
`;

const ColumnControls = styled.div`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

const CheckboxLabel = styled.label`
  display: inline-block;
  margin-right: 15px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 14px;

  input {
    margin-right: 5px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 100%;
`;

const Th = styled.th<{ width?: number }>`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  position: relative;
  user-select: none;
  width: ${props => props.width ? `${props.width}px` : 'auto'};
  min-width: 50px;
  max-width: none;
`;

const ThContent = styled.div`
  display: flex;
  align-items: center;
  padding-right: 8px;
`;

const ResizeHandle = styled.div`
  width: 8px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 2px;
    height: 60%;
    background: #ddd;
    border-radius: 1px;
    transition: background 0.2s;
  }

  &:hover::after {
    background: #007bff;
  }

  &:active::after {
    background: #0056b3;
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  word-break: break-word;
`;

const EmptyCell = styled.td`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const EditButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }
`;
