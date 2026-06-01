export type PaginationInput = {
  page?: string | number | null;
  pageSize?: string | number | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export function parsePositiveInt(value: string | number | null | undefined, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback;
}

export function getPagination(input: PaginationInput, maxPageSize = 50): Pagination {
  const page = parsePositiveInt(input.page, 1);
  const requestedPageSize = parsePositiveInt(input.pageSize, 10);
  const pageSize = Math.min(requestedPageSize, maxPageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
}

export function getTotalPages(total: number, pageSize: number) {
  if (total <= 0) {
    return 1;
  }

  return Math.ceil(total / pageSize);
}
