/**
 * @fileoverview Generic, feature-rich DataTable component built on TanStack Table.
 *
 * Supports:
 * - Server-side (manual) or client-side pagination & sorting
 * - Toolbar search input
 * - Static and async (server-fetched) column filters
 * - Column visibility toggle
 * - Skeleton loading states
 * - Active-filter pill bar with individual / bulk clear
 *
 * @module components/data-table
 */
'use client'

import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react'
import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '~/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { cn } from '~/lib/cn'
import { useSafeActionQuery } from '~/lib/safe-action-client'
import { Skeleton } from '../ui/skeleton'
import { SortOrderEnum } from './enum'
import { DataTableFilter, DataTableProps } from './types'

/**
 * Filter sub-content for filters with pre-defined static options.
 * Renders a searchable command list with checkboxes for multi-select.
 */
const StaticFilterSubContent = memo(function StaticFilterSubContent({
  filter,
  activeFilters,
  onSelect
}: {
  filter: DataTableFilter
  activeFilters: Record<string, (string | boolean)[]>
  onSelect: (values: (string | boolean)[]) => void
}) {
  // Convert all selected values to strings for uniform Set comparison
  const selectedValues = new Set((activeFilters[filter.id] || []).map(String))
  return (
    <Command>
      <CommandInput placeholder={filter.label} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {filter.options?.map(option => {
            const isSelected = selectedValues.has(String(option.value))
            const isTruncated = option.label && option.label.length > 18
            return (
              <CommandItem
                key={String(option.value)}
                className="data-selected:bg-accent data-selected:text-accent-foreground"
                onSelect={() => {
                  const newSet = new Set(selectedValues)
                  if (isSelected) {
                    newSet.delete(String(option.value))
                  } else {
                    newSet.add(String(option.value))
                  }
                  // Map back to original values
                  const values = Array.from(newSet).map(v => {
                    const op = filter.options?.find(o => String(o.value) === v)
                    return op ? op.value : v
                  })
                  onSelect(values)
                }}
              >
                <div
                  className={cn(
                    'mr-2 flex size-4 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-transparent'
                  )}
                >
                  <Check
                    className={cn(
                      'size-3',
                      isSelected
                        ? 'text-primary-foreground!'
                        : 'text-transparent'
                    )}
                  />
                </div>
                {option.icon && (
                  <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                )}
                {isTruncated ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{option.label.slice(0, 18) + '...'}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-75 break-all">{option.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{option.label}</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
})

/**
 * Filter sub-content for async filters whose options are fetched
 * from the server via a safe-action. Includes debounced search input.
 */
const AsyncFilterSubContent = memo(function AsyncFilterSubContent({
  filter,
  activeFilters,
  onSelect,
  onCacheLabels
}: {
  filter: DataTableFilter
  activeFilters: Record<string, (string | boolean)[]>
  onSelect: (values: string[]) => void
  onCacheLabels: (labels: Record<string, string>) => void
}) {
  const selectedValues = new Set((activeFilters[filter.id] || []).map(String))
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce the search input to avoid excessive server calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch filter options from the server action with debounced search
  const { data, isPending } = useSafeActionQuery(
    filter.queryKey || filter.id,
    filter.action,
    {
      search: debouncedSearch,
      limit: 20,
      page: 1
    }
  )

  // Normalise various server response shapes into a flat array
  const items = useMemo<{ label: string; value: string | number | boolean }[]>(
    () =>
      (data || []).map((item: any) => ({
        label: item.label ?? item.name ?? item.id,
        value: item.value ?? item.id
      })),
    [data]
  )

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder={filter.label}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isPending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {!isPending && items.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        <CommandGroup>
          {items.map(item => {
            const value = String(item.value)
            const label = item.label
            const isSelected = selectedValues.has(value)
            const isTruncated = label && label.length > 18
            return (
              <CommandItem
                key={value}
                className="data-selected:bg-accent data-selected:text-accent-foreground"
                onSelect={() => {
                  const newSet = new Set(selectedValues)
                  if (isSelected) {
                    newSet.delete(value)
                  } else {
                    newSet.add(value)
                    // Update cache when selecting an item
                    onCacheLabels({ [value]: label })
                  }
                  onSelect(Array.from(newSet))
                }}
              >
                <div
                  className={cn(
                    'mr-2 flex size-4 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background text-transparent'
                  )}
                >
                  <Check
                    className={cn(
                      'size-3',
                      isSelected
                        ? 'text-primary-foreground!'
                        : 'text-transparent'
                    )}
                  />
                </div>
                {/* Truncate long labels for better readability */}
                {isTruncated ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{label.slice(0, 18) + '...'}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-75 break-all">{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{label}</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
})

/**
 * Generic DataTable component with toolbar, filters, sorting and pagination.
 *
 * @template TData  Row data shape
 * @template TValue Cell value shape
 */
export function DataTable<TData, TValue>({
  columns,
  data = [],
  isLoading = false,
  enableSearch = false,
  searchPlaceholder = 'Search...',
  initialSearch = '',
  totalCount,
  onParamsChange,
  manualPagination = false,
  manualSorting = false,
  pageIndex: controlledPageIndex = 0,
  pageSize: controlledPageSize = 10,
  initialSorting = [],
  filters = [],
  activeFilters = {}
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchValue, setSearchValue] = useState(initialSearch)
  const [pagination, setPagination] = useState({
    pageIndex: controlledPageIndex,
    pageSize: controlledPageSize
  })
  /** Cache for async filter labels so pills display correctly after data refetch. */
  const [labelCache, setLabelCache] = useState<Record<string, string>>({})
  const searchInputId = useId()
  const lastTotalCountRef = useRef<number | undefined>(totalCount)
  /** Ref to always read the latest activeFilters inside async callbacks (avoids stale closures). */
  const activeFiltersRef = useRef(activeFilters)
  activeFiltersRef.current = activeFilters
  /** Set by the prop-sync effect so the debounced effect can skip redundant fires. */
  const isExternalPaginationSync = useRef(false)

  // Keep internal pagination in sync with controlled props from parent.
  // Without this, external resets (e.g. filter change → page 1) are ignored.
  useEffect(() => {
    setPagination(prev => {
      if (
        prev.pageIndex !== controlledPageIndex ||
        prev.pageSize !== controlledPageSize
      ) {
        // Flag so the debounced effect skips its next fire – the filter/clear
        // handler that triggered this prop change already called onParamsChange.
        isExternalPaginationSync.current = true
        return {
          pageIndex: controlledPageIndex,
          pageSize: controlledPageSize
        }
      }
      return prev
    })
  }, [controlledPageIndex, controlledPageSize])

  // Preserve totalCount during loading to avoid pagination flicker (e.g. "Page 1 of 1" when switching pages).
  // Updating a ref synchronously during render is a safe, idempotent pattern documented by React
  // because refs are not reactive and this does not trigger a re-render.
  if (totalCount !== undefined && totalCount > 0) {
    lastTotalCountRef.current = totalCount
  }
  const stableTotalCount = useMemo(
    () =>
      isLoading && totalCount === 0 && lastTotalCountRef.current !== undefined
        ? lastTotalCountRef.current
        : totalCount,
    // lastTotalCountRef is a ref - intentionally omitted from deps
    [isLoading, totalCount]
  )

  // Initialise TanStack Table with manual pagination/sorting when enabled
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(!manualPagination && {
      getPaginationRowModel: getPaginationRowModel()
    }),
    ...(!manualSorting && { getSortedRowModel: getSortedRowModel() }),
    manualPagination,
    manualSorting,
    ...(manualPagination && {
      pageCount:
        Math.ceil((stableTotalCount ?? data.length) / pagination.pageSize) || 1
    }),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      pagination
    }
  })

  /** Skip the initial render to avoid firing onParamsChange on mount. */
  const isFirstRender = useRef(true)

  // Stable reference for onParamsChange to avoid unnecessary effect re-runs
  const onParamsChangeRef = useRef(onParamsChange)
  onParamsChangeRef.current = onParamsChange

  /**
   * Build the params object sent to onParamsChange.
   * Uses `activeFiltersRef` so async callbacks always read the latest value.
   * Pass `overrides` to set page or filters explicitly (e.g. on filter change).
   */
  const buildParams = useCallback(
    (
      overrides?: Partial<{
        page: number
        filters: Record<string, (string | boolean)[]> | undefined
      }>
    ) => {
      const sort = sorting[0]
      const filtersValue =
        overrides && 'filters' in overrides
          ? overrides.filters
          : activeFiltersRef.current &&
              Object.keys(activeFiltersRef.current).length > 0
            ? activeFiltersRef.current
            : undefined
      return {
        page: overrides?.page ?? pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sort?.id,
        sortOrder: sort
          ? sort.desc
            ? SortOrderEnum.DESC
            : SortOrderEnum.ASC
          : undefined,
        search: searchValue || undefined,
        filters: filtersValue
      }
    },
    [pagination.pageIndex, pagination.pageSize, searchValue, sorting]
  )

  // Debounce param changes (300ms) to batch rapid user interactions.
  // Only watches pagination, sorting, and searchValue – NOT activeFilters,
  // because filter handlers already call onParamsChange directly.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Skip when the pagination change came from an external prop sync
    // (e.g. parent reset page after a filter handler already called onParamsChange).
    if (isExternalPaginationSync.current) {
      isExternalPaginationSync.current = false
      return
    }

    if (!onParamsChangeRef.current) return

    const timeout = setTimeout(() => {
      onParamsChangeRef.current?.(buildParams())
    }, 300)

    return () => clearTimeout(timeout)
  }, [pagination, sorting, searchValue, buildParams])

  /** Whether any filter has at least one selected value. */
  const hasAnyFilter = useMemo(
    () => Object.values(activeFilters).some(f => f.length > 0),
    [activeFilters]
  )

  /** Sum of all selected filter values across all filters (shown as badge count). */
  const totalActiveFilterCount = useMemo(
    () =>
      Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0),
    [activeFilters]
  )

  /** Stable callback for async filter sub-components to update label cache. */
  const handleCacheLabels = useCallback((newLabels: Record<string, string>) => {
    setLabelCache(prev => ({ ...prev, ...newLabels }))
  }, [])

  /**
   * Stable factory for per-filter onSelect handlers.
   * Returns a memoized handler for each filter id so sub-components
   * receive a stable reference and avoid unnecessary re-renders.
   */
  const makeFilterSelectHandler = useCallback(
    (filterId: string) => (values: (string | boolean)[]) => {
      const newFilters: Record<string, (string | boolean)[]> = {
        ...(activeFilters || {})
      }
      if (values.length > 0) {
        newFilters[filterId] = values
      } else {
        delete newFilters[filterId]
      }
      onParamsChange?.(
        buildParams({
          page: 1,
          filters: Object.keys(newFilters).length > 0 ? newFilters : undefined
        })
      )
    },
    [activeFilters, buildParams, onParamsChange]
  )

  return (
    <div className="space-y-4">
      {/* ── Toolbar: search, filter dropdown, column visibility toggle ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {enableSearch && (
            <div className="relative max-w-sm flex-1">
              <Search
                className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
                aria-hidden
              />
              <label htmlFor={searchInputId} className="sr-only">
                {searchPlaceholder}
              </label>
              <Input
                id={searchInputId}
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={event => {
                  setSearchValue(event.target.value)
                  // Reset to first page when search query changes
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  aria-label="Filter"
                >
                  <Filter className="h-4 w-4" />
                  {totalActiveFilterCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="pointer-events-none ml-1 h-5 min-w-5 px-1"
                    >
                      {totalActiveFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-50">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Render each filter as a sub-menu with either async or static content */}
                {filters.map(filter => (
                  <DropdownMenuSub key={filter.id}>
                    <DropdownMenuSubTrigger>
                      {filter.label}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-50 p-0">
                      {filter.action ? (
                        <AsyncFilterSubContent
                          filter={filter}
                          activeFilters={activeFilters}
                          onCacheLabels={handleCacheLabels}
                          onSelect={
                            makeFilterSelectHandler(filter.id) as (
                              values: string[]
                            ) => void
                          }
                        />
                      ) : (
                        <StaticFilterSubContent
                          filter={filter}
                          activeFilters={activeFilters}
                          onSelect={makeFilterSelectHandler(filter.id)}
                        />
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                {hasAnyFilter && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        onParamsChange?.(
                          buildParams({ page: 1, filters: undefined })
                        )
                      }}
                      className="justify-center text-center"
                    >
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Column visibility toggle dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              aria-label="Toggle columns"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                    onSelect={e => e.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Active filter pills bar ── */}
      {hasAnyFilter && (
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => {
            const selected = activeFilters[filter.id]
            if (!selected || selected.length === 0) return null
            return (
              <div
                key={filter.id}
                className="bg-accent/50 flex items-center gap-1 rounded-md px-2 py-1 text-sm"
              >
                <span className="font-medium">{filter.label}:</span>
                <div className="flex gap-1">
                  {selected.length > 2 ? (
                    <Badge variant="secondary" className="px-1 font-normal">
                      {selected.length} selected
                    </Badge>
                  ) : (
                    selected.map(val => {
                      const displayLabel =
                        filter.options?.find(
                          o => String(o.value) === String(val)
                        )?.label ||
                        labelCache[String(val)] ||
                        String(val)
                      const isTruncated =
                        displayLabel && displayLabel.length > 18
                      return isTruncated ? (
                        <Tooltip key={String(val)}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="px-1 font-normal"
                            >
                              {displayLabel.slice(0, 18) + '...'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-75 break-all">{displayLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge
                          key={String(val)}
                          variant="secondary"
                          className="px-1 font-normal"
                        >
                          {displayLabel}
                        </Badge>
                      )
                    })
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="hover:bg-muted ml-1 h-4 w-4 rounded-full p-0"
                  aria-label={`Clear ${filter.label} filter`}
                  onClick={() => {
                    const newFilters = { ...activeFilters }
                    delete newFilters[filter.id]
                    onParamsChange?.(
                      buildParams({
                        page: 1,
                        filters:
                          Object.keys(newFilters).length > 0
                            ? newFilters
                            : undefined
                      })
                    )
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              onParamsChange?.(buildParams({ page: 1, filters: undefined }))
            }}
          >
            Reset
          </Button>
        </div>
      )}

      {/* ── Table body ── */}
      <div className="bg-card relative rounded-md border">
        {isLoading && data.length > 0 && (
          <div
            role="status"
            aria-label="Loading"
            aria-live="polite"
            className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
          >
            <Loader2
              className="text-muted-foreground h-6 w-6 animate-spin"
              aria-hidden
            />
          </div>
        )}
        <Table aria-busy={isLoading} aria-label="Data table">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const isSortable = header.column.getCanSort()
                  const sortStatus = header.column.getIsSorted()

                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          role={isSortable ? 'button' : undefined}
                          tabIndex={isSortable ? 0 : undefined}
                          aria-sort={
                            isSortable
                              ? sortStatus === 'asc'
                                ? 'ascending'
                                : sortStatus === 'desc'
                                  ? 'descending'
                                  : 'none'
                              : undefined
                          }
                          className={cn(
                            'flex items-center gap-2',
                            isSortable &&
                              'hover:text-foreground cursor-pointer select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={
                            isSortable
                              ? e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    header.column.getToggleSortingHandler()?.(
                                      e as unknown as React.MouseEvent
                                    )
                                  }
                                }
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSortable && (
                            <div className="flex w-4 items-center justify-center">
                              {sortStatus === 'asc' ? (
                                <ArrowUp
                                  className="h-4 w-4"
                                  aria-label="Sorted ascending"
                                />
                              ) : sortStatus === 'desc' ? (
                                <ArrowDown
                                  className="h-4 w-4"
                                  aria-label="Sorted descending"
                                />
                              ) : (
                                <ArrowUpDown
                                  className="h-4 w-4 opacity-30"
                                  aria-label="Not sorted"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                // Using array index as key is acceptable for static skeleton placeholders
                <TableRow key={index} aria-hidden>
                  {table.getVisibleFlatColumns().map(col => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  role="cell"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row sm:gap-0">
        <div className="text-muted-foreground flex-1 text-center text-sm sm:text-left">
          {stableTotalCount !== undefined ? (
            stableTotalCount === 0 ? (
              <>No results</>
            ) : (
              <>
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  stableTotalCount
                )}{' '}
                of {stableTotalCount} results
              </>
            )
          ) : (
            <>{data.length} row(s) loaded.</>
          )}
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Rows per page
            </p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={value => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Page {pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
