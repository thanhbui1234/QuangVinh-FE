import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Download, RefreshCw, ChevronDown, Filter, Eye, EyeOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

export interface ColumnType<T = any> {
  title: string
  dataIndex: string
  key?: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sorter?: boolean | ((a: T, b: T) => number)
  filterable?: boolean
  filterType?: 'text' | 'select' | 'date'
  filterOptions?: { label: string | React.ReactNode; value: any }[]
  render?: (value: any, record: T, index: number) => React.ReactNode
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  className?: string
}

export interface TableBaseProps<T = any> {
  dataSource?: T[]
  columns: ColumnType<T>[]
  loading?: boolean
  pagination?: {
    current?: number
    pageSize?: number
    total?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: (total: number, range: [number, number]) => string
    pageSizeOptions?: number[]
    onChange?: (page: number, pageSize?: number) => void
    onShowSizeChange?: (current: number, size: number) => void
  }

  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  filterable?: boolean
  filters?: Record<string, any>
  onFilterChange?: (filters: Record<string, any>) => void
  columnVisibility?: boolean
  onColumnVisibilityChange?: (visibleColumns: string[]) => void
  actions?: React.ReactNode
  onRefresh?: () => void
  onExport?: () => void

  rowKey?: string | ((record: T) => string)
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: string[]
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void
  }
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void
    onDoubleClick?: () => void
    className?: string
  }

  className?: string
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
  striped?: boolean

  emptyText?: string | React.ReactNode
  emptyImage?: React.ReactNode
}

export function TableBase<T = any>({
  dataSource = [],
  columns,
  loading = false,
  pagination = {},
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  filterable = true,
  onFilterChange,
  columnVisibility = true,
  onColumnVisibilityChange,
  actions,
  onRefresh,
  onExport,
  rowKey = 'id',
  rowSelection,
  onRow,
  className,
  size = 'middle',
  bordered = true,
  striped = true,
  emptyText = 'Không có dữ liệu',
  emptyImage,
}: TableBaseProps<T>) {
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(pagination.current || 1)
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10)

  // Sync currentPage with external pagination.current prop
  useEffect(() => {
    if (pagination?.current && pagination.current !== currentPage) {
      setCurrentPage(pagination.current)
    }
  }, [pagination?.current, currentPage])
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  // const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
  //   rowSelection?.selectedRowKeys || []
  // )
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({})
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.key || col.dataIndex).filter(Boolean)
  )

  const total = pagination.total || dataSource.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)

  const processedData = useMemo(() => {
    let result = [...dataSource]

    if (searchValue && onSearch) {
      onSearch(searchValue)
    }

    result = result.filter((record) => {
      return Object.entries(columnFilters).every(([columnKey, filterValue]) => {
        if (!filterValue || filterValue === '') return true

        const column = columns.find((col) => (col.key || col.dataIndex) === columnKey)
        if (!column) return true

        const recordValue = (record as any)[column.dataIndex]

        if (column.filterType === 'select') {
          return recordValue === filterValue
        } else if (column.filterType === 'text') {
          return String(recordValue).toLowerCase().includes(String(filterValue).toLowerCase())
        } else if (column.filterType === 'date') {
          return String(recordValue).includes(String(filterValue))
        }

        return true
      })
    })

    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find((col) => col.dataIndex === sortConfig.key)
        if (!column?.sorter) return 0

        const aValue = (a as any)[sortConfig.key]
        const bValue = (b as any)[sortConfig.key]

        if (typeof column.sorter === 'function') {
          return sortConfig.direction === 'asc' ? column.sorter(a, b) : column.sorter(b, a)
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [dataSource, searchValue, sortConfig, columns, onSearch, columnFilters])

  const paginatedData = useMemo(() => {
    return processedData.slice(startIndex, endIndex)
  }, [processedData, startIndex, endIndex])

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      pagination?.onChange?.(page, pageSize)
    },
    [pagination, pageSize]
  )

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size)
      setCurrentPage(1)
      pagination?.onShowSizeChange?.(1, size)
    },
    [pagination]
  )

  const handleColumnFilter = useCallback(
    (columnKey: string, value: any) => {
      const newFilters = {
        ...columnFilters,
        [columnKey]: value,
      }
      setColumnFilters(newFilters)
      onFilterChange?.(newFilters)
      setCurrentPage(1)
    },
    [columnFilters, onFilterChange]
  )

  const handleClearFilter = useCallback(
    (columnKey: string) => {
      const newFilters = { ...columnFilters }
      delete newFilters[columnKey]
      setColumnFilters(newFilters)
      onFilterChange?.(newFilters)
      setCurrentPage(1)
    },
    [columnFilters, onFilterChange]
  )

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
    onFilterChange?.({})
    setCurrentPage(1)
  }, [onFilterChange])

  const handleColumnVisibilityToggle = useCallback(
    (columnKey: string) => {
      setVisibleColumns((prev) => {
        const newVisible = prev.includes(columnKey)
          ? prev.filter((key) => key !== columnKey)
          : [...prev, columnKey]
        onColumnVisibilityChange?.(newVisible)
        return newVisible
      })
    },
    [onColumnVisibilityChange]
  )

  // const handleRowSelection = useCallback(
  //   (record: T, checked: boolean) => {
  //     if (!rowSelection) return

  //     const key = typeof rowKey === 'function' ? rowKey(record) : (record as any)[rowKey]
  //     const newSelectedKeys = checked
  //       ? [...selectedRowKeys, key]
  //       : selectedRowKeys.filter((k) => k !== key)

  //     setSelectedRowKeys(newSelectedKeys)
  //     rowSelection.onChange?.(
  //       newSelectedKeys,
  //       dataSource.filter((_) =>
  //         newSelectedKeys.includes(typeof rowKey === 'function' ? rowKey(_) : (_ as any)[rowKey])
  //       )
  //     )
  //   },
  //   [rowSelection, selectedRowKeys, dataSource, rowKey]
  // )

  // const handleSelectAll = useCallback(
  //   (checked: boolean) => {
  //     if (!rowSelection) return

  //     const keys = paginatedData.map((record) =>
  //       typeof rowKey === 'function' ? rowKey(record) : (record as any)[rowKey]
  //     )
  //     const newSelectedKeys = checked ? keys : []

  //     setSelectedRowKeys(newSelectedKeys)
  //     rowSelection.onChange?.(newSelectedKeys, checked ? paginatedData : [])
  //   },
  //   [rowSelection, paginatedData, rowKey]
  // )

  const renderCell = (column: ColumnType<T>, record: T, index: number) => {
    const value = (record as any)[column.dataIndex]

    if (column.render) {
      return column.render(value, record, index)
    }

    if (column.ellipsis) {
      return (
        <div className="max-w-[200px] truncate" title={String(value)}>
          {value}
        </div>
      )
    }

    return value
  }

  const renderPagination = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (showEllipsis) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      )

      if (currentPage > 4) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (currentPage < totalPages - 3) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      if (totalPages > 1) {
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {pagination.showTotal && (
            <span className="text-sm text-muted-foreground">
              {pagination.showTotal(total, [startIndex + 1, endIndex])}
            </span>
          )}

          {pagination.showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Số hàng</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">mục</span>
            </div>
          )}
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {pages}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )
  }

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {emptyImage || (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <p className="text-muted-foreground text-lg font-medium">{emptyText}</p>
    </div>
  )

  return (
    <div className={cn('space-y-4 overflow-hidden bg-transparent', className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Column Filters */}
          {filterable && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                  {Object.keys(columnFilters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(columnFilters).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Bộ lọc cột</h4>
                    {Object.keys(columnFilters).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="h-8 px-2"
                      >
                        Xóa tất cả
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {columns
                      .filter((col) => col.filterable)
                      .map((column) => {
                        const columnKey = column.key || column.dataIndex
                        const filterValue = columnFilters[columnKey]

                        return (
                          <div key={columnKey} className="space-y-2">
                            <label className="text-sm font-medium">{column.title}</label>

                            {column.filterType === 'select' && column.filterOptions ? (
                              <div className="flex gap-2">
                                <Select
                                  value={filterValue || ''}
                                  onValueChange={(value) => handleColumnFilter(columnKey, value)}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Chọn..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {column.filterOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {filterValue && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearFilter(columnKey)}
                                    className="h-9 w-9 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  placeholder={`Lọc theo ${column.title.toLowerCase()}...`}
                                  value={filterValue || ''}
                                  onChange={(e) => handleColumnFilter(columnKey, e.target.value)}
                                  className="flex-1"
                                />
                                {filterValue && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleClearFilter(columnKey)}
                                    className="h-9 w-9 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Column Visibility */}
          {columnVisibility && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Cột
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Hiển thị cột</h4>

                  <div className="space-y-2">
                    {columns.map((column) => {
                      const columnKey = column.key || column.dataIndex
                      const isVisible = visibleColumns.includes(columnKey)

                      return (
                        <div key={columnKey} className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleColumnVisibilityToggle(columnKey)}
                            className="flex-1 justify-start h-8"
                          >
                            {isVisible ? (
                              <Eye className="w-4 h-4 mr-2" />
                            ) : (
                              <EyeOff className="w-4 h-4 mr-2" />
                            )}
                            {column.title}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          )}

          {actions}
        </div>
      </div>

      <Card className={cn('overflow-hidden', bordered && 'border')}>
        <div className="overflow-x-auto">
          <Table className={cn(size === 'small' && 'text-sm', size === 'large' && 'text-base')}>
            <TableHeader>
              <TableRow>
                {columns
                  .filter((column) => {
                    const columnKey = column.key || column.dataIndex
                    return visibleColumns.includes(columnKey)
                  })
                  .map((column) => (
                    <TableHead
                      key={column.key || column.dataIndex}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.className
                      )}
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.title}</span>
                        {column.sorter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSort(column.dataIndex)}
                          >
                            <ChevronDown
                              className={cn(
                                'w-3 h-3 transition-transform',
                                sortConfig?.key === column.dataIndex &&
                                  sortConfig.direction === 'desc' &&
                                  'rotate-180'
                              )}
                            />
                          </Button>
                        )}
                      </div>
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (rowSelection ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (rowSelection ? 1 : 0)}>
                    {renderEmpty()}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((record, index) => {
                  const key =
                    typeof rowKey === 'function' ? rowKey(record) : (record as any)[rowKey]
                  const rowProps = onRow?.(record, index) || {}

                  return (
                    <TableRow
                      key={key}
                      className={cn(
                        striped && index % 2 === 1 && 'bg-muted/50',
                        rowProps.className
                      )}
                      onClick={rowProps.onClick}
                      onDoubleClick={rowProps.onDoubleClick}
                    >
                      {columns
                        .filter((column) => {
                          const columnKey = column.key || column.dataIndex
                          return visibleColumns.includes(columnKey)
                        })
                        .map((column) => (
                          <TableCell
                            key={column.key || column.dataIndex}
                            className={cn(
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              column.className
                            )}
                          >
                            {renderCell(column, record, index)}
                          </TableCell>
                        ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {renderPagination()}
    </div>
  )
}

export default TableBase
