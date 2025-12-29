export type Category = 'NOTICE' | 'QNA' | 'FREE';

export interface Post {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: Category;
  tags: string[];
  createdAt: string;
}

export type SortField = 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface PostFilters {
  search?: string;
  category?: Category;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

