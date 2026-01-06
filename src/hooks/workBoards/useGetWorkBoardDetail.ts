import { useQuery, useQueryClient } from '@tanstack/react-query'
import { workBoardsKey } from '@/constants/assignments/assignment'
import { API_ENDPOINT } from '@/common/apiEndpoint'
import { POST } from '@/core/api'
import type {
  IWorkBoard,
  IGetSheetDetailRequest,
  IGetSheetDetailResponse,
  ISheetInfo,
  ISheetRow,
} from '@/types/WorkBoard'

/**
 * Map API response to IWorkBoard structure
 */
const mapSheetInfoToWorkBoard = (sheetInfo: ISheetInfo): IWorkBoard => {
  // Ensure columns and rows are arrays
  const columns = Array.isArray(sheetInfo.columns) ? sheetInfo.columns : []
  // API returns latestRows, not rows
  let rows = Array.isArray(sheetInfo.latestRows)
    ? sheetInfo.latestRows
    : Array.isArray(sheetInfo.rows)
      ? sheetInfo.rows
      : []

  // IMPORTANT: Sort rows by createdTime (oldest first) to ensure consistent rowIndex mapping
  // This ensures rowIndex 0 = oldest row, rowIndex 1 = second oldest, etc.
  rows = [...rows].sort((a, b) => a.createdTime - b.createdTime)

  // Map columns to columnHeaders
  const columnHeaders = columns
    .sort((a, b) => a.index - b.index)
    .map((col) => ({
      id: `col-${col.index}`,
      label: col.name,
      width: 150,
      name: col.name,
      type: col.type,
      index: col.index,
      color: col.color,
      required: col.required,
      options: col.options || [],
    }))

  // Filter rows that have at least one value
  const rowsWithData = rows.filter((row: ISheetRow) => {
    const rowData = row.rowData || {}
    // Check if row has at least one non-empty value
    return columns.some((col) => {
      const value = rowData[col.name]
      return value != null && String(value).trim() !== ''
    })
  })

  // Map rows to cells (only rows with data)
  const cells: Array<{ rowIndex: number; columnIndex: number; value: string }> = []

  rowsWithData.forEach((row: ISheetRow, newRowIndex: number) => {
    const rowData = row.rowData || {}
    columns.forEach((col, colIdx) => {
      const value = rowData[col.name]
      // Only include cell if it has a value
      if (value != null && String(value).trim() !== '') {
        cells.push({
          rowIndex: newRowIndex,
          columnIndex: colIdx,
          value: String(value).trim(),
        })
      }
    })
  })

  // Calculate rows: use actual rows with data length, but ensure minimum is 1
  const totalRows = Math.max(1, rowsWithData.length)
  const totalColumns = columns.length

  // Create rowIdMap: map rowIndex to actual row ID from backend
  const rowIdMap: Record<number, number> = {}
  rowsWithData.forEach((row: ISheetRow, newRowIndex: number) => {
    rowIdMap[newRowIndex] = row.id
  })

  return {
    id: sheetInfo.id,
    name: sheetInfo.sheetName || '',
    description: undefined,
    rows: totalRows,
    columns: totalColumns,
    columnHeaders,
    cells,
    rowIdMap,
    createdAt: sheetInfo.createdTime ? new Date(sheetInfo.createdTime).toISOString() : undefined,
    updatedAt: sheetInfo.updatedTime ? new Date(sheetInfo.updatedTime).toISOString() : undefined,
  }
}

export const useGetWorkBoardDetail = (id: number | undefined, rowSize: number = 50) => {
  const queryClient = useQueryClient()

  const queryKey = [workBoardsKey.detail(id || 0), rowSize]

  const { data, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!id || isNaN(id)) {
        throw new Error('Invalid sheet ID')
      }

      const payload: IGetSheetDetailRequest = {
        sheetId: id,
        rowSize,
      }

      const response = (await POST(
        API_ENDPOINT.GET_SHEET_DETAIL,
        payload
      )) as IGetSheetDetailResponse

      let sheetInfo: ISheetInfo

      if (response?.sheetInfo) {
        sheetInfo = response.sheetInfo
      } else if (response && 'id' in response && 'sheetName' in response) {
        sheetInfo = response as unknown as ISheetInfo
      } else {
        throw new Error('Invalid API response')
      }

      sheetInfo.columns ??= []
      sheetInfo.rows ??= []

      const workBoard: IWorkBoard = mapSheetInfoToWorkBoard(sheetInfo)

      return { workBoard }
    },
    enabled: !!id && !isNaN(id) && id > 0,
    retry: 1,
  })

  /**
   * 🔥 refetch mới: clear cache + fetch lại
   */
  const refetchAndClearCache = async () => {
    await queryClient.removeQueries({
      queryKey,
      exact: true,
    })

    // fetch lại sau khi clear
    return queryClient.fetchQuery({
      queryKey,
      queryFn: () => Promise.resolve(refetch()).then((r) => r.data),
    })
  }

  return {
    workBoard: data?.workBoard,
    isFetching,
    isLoading: isFetching && !data,
    error,
    refetch, // giữ lại refetch cũ
    refetchAndClearCache, // ✅ refetch mới có clear cache
  }
}
