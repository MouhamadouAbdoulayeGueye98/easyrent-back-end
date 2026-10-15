export const DEFAULT_LIMIT = 5;
export const MAX_LIMIT = 50;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Transforme les query params ?page=&limit= en valeurs sûres.
 * Par défaut : page 1, 5 éléments par page (max 50).
 */
export function parsePagination(page?: string, limit?: string): PaginationParams {
  const safePage = Math.max(parseInt(page ?? '1', 10) || 1, 1);
  const safeLimit = Math.min(
    Math.max(parseInt(limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function buildPaginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams,
): Paginated<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}