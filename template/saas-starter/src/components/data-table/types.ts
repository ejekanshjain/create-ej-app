import { ColumnDef, SortingState } from '@tanstack/react-table'
import { SortOrderEnum } from './enum'

/** A single selectable option inside a filter dropdown. */
interface DataTableFilterOption {
  label: string
  value: string | boolean
  /** Optional icon rendered next to the option label. */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Describes a filter that appears in the DataTable toolbar.
 * Filters can either be static (pre-defined `options`) or async
 * (fetched via a server `action` on search).
 */
export interface DataTableFilter {
  /** Unique key used to store the filter's selected values. */
  id: string
  /** Human-readable label shown in the filter dropdown trigger. */
  label: string
  /** Pre-defined options for static filters. Omit for async filters. */
  options?: DataTableFilterOption[]
  /** Server action called to fetch options dynamically (async filters). */
  action?: any
  /** Custom React-Query key for async filter caching. Defaults to `id`. */
  queryKey?: string
}

/**
 * Props accepted by the generic `DataTable` component.
 *
 * Supports both client-side and server-side (manual) pagination & sorting.
 * When `manualPagination` / `manualSorting` are enabled the parent is
 * responsible for fetching data and passing results back via `data` & `totalCount`.
 */
export interface DataTableProps<TData, TValue> {
  /** Column definitions (TanStack Table). */
  columns: ColumnDef<TData, TValue>[]
  /** Row data to display. */
  data?: TData[]
  /** Show skeleton loading rows while data is being fetched. */
  isLoading?: boolean
  /** Render the search input in the toolbar. */
  enableSearch?: boolean
  /** Placeholder text for the search input. */
  searchPlaceholder?: string
  /** Initial value for the search input (e.g. restored from URL query params). */
  initialSearch?: string
  /** Total row count for server-side pagination info. */
  totalCount?: number
  /** Callback fired when pagination, sorting, search or filters change. */
  onParamsChange?: (params: {
    page: number
    limit: number
    sortBy?: string
    sortOrder?: SortOrderEnum
    search?: string
    filters?: Record<string, (string | boolean)[]>
  }) => void
  /** Enable server-side pagination (parent controls data fetching). */
  manualPagination?: boolean
  /** Enable server-side sorting (parent controls data fetching). */
  manualSorting?: boolean
  /** Current 0-based page index (controlled). */
  pageIndex?: number
  /** Number of rows per page (controlled). */
  pageSize?: number
  /** Default sorting state applied on mount. */
  initialSorting?: SortingState
  /** Filter definitions rendered in the toolbar filter dropdown. */
  filters?: DataTableFilter[]
  /** Currently active filter selections keyed by filter id. */
  activeFilters?: Record<string, (string | boolean)[]>
}
