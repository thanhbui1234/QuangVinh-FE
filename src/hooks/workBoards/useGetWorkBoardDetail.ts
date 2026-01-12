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

  // IMPORTANT: Sort rows by createdTime (oldest first) and then by ID to ensure stable rowIndex mapping
  // This ensures rowIndex 0 = oldest row, rowIndex 1 = second oldest, etc.
  rows = [...rows].sort((a, b) => {
    if (a.createdTime !== b.createdTime) {
      return a.createdTime - b.createdTime
    }
    return a.id - b.id
  })

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

  // Map rows to cells (all rows from API)
  const cells: Array<{ rowIndex: number; columnIndex: number; value: string }> = []
  const rowIdMap: Record<number, number> = {}

  rows.forEach((row: ISheetRow, rowIndex: number) => {
    rowIdMap[rowIndex] = row.id
    const rowData = row.rowData || {}
    columns.forEach((col, colIdx) => {
      const value = rowData[col.name]
      // Include cell if it has a value (including empty string)
      if (value != null) {
        cells.push({
          rowIndex,
          columnIndex: colIdx,
          value: String(value),
        })
      }
    })
  })

  // Calculate rows: use actual rows count from DB, but ensure minimum is 1
  const totalRows = Math.max(1, rows.length)
  const totalColumns = columns.length

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

  const queryKey = [...workBoardsKey.detail(id || 0), rowSize]

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
