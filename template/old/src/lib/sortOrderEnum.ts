export const SortOrderEnum = ['asc', 'desc'] as const
export type SortOrderEnum = (typeof SortOrderEnum)[number]
