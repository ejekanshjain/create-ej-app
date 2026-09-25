/**
 * Shared TanStack Table v9 feature set for the app DataTable.
 *
 * Defined once outside components so feature types stay stable and tree-shaken.
 */
import {
  type ColumnDef,
  type RowData,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
  tableFeatures
} from '@tanstack/react-table'

/** Features registered by every DataTable instance. */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
    text: sortFn_text,
    textCaseSensitive: sortFn_textCaseSensitive,
    datetime: sortFn_datetime,
    basic: sortFn_basic
  }
})

type DataTableFeatures = typeof dataTableFeatures

/**
 * Column definition typed to the DataTable feature set.
 * Prefer this over raw `ColumnDef` from `@tanstack/react-table`.
 */
export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown
> = ColumnDef<DataTableFeatures, TData, TValue>
