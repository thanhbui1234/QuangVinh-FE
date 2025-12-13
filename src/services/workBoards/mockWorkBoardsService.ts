import type { IWorkBoard, ICreateWorkBoard, IUpdateWorkBoard } from '@/types/WorkBoard'

// Mock data storage (using localStorage for persistence)
const STORAGE_KEY = 'work_boards_mock_data'

// Initialize with sample data if empty
const getInitialData = (): IWorkBoard[] => {
  return [
    {
      id: 1,
      name: 'Bảng công việc tuần này',
      description: 'Theo dõi công việc trong tuần',
      rows: 5,
      columns: 4,
      columnHeaders: [
        { id: 'col-0', label: 'Công việc', width: 200 },
        { id: 'col-1', label: 'Người phụ trách', width: 150 },
        { id: 'col-2', label: 'Trạng thái', width: 120 },
        { id: 'col-3', label: 'Ghi chú', width: 200 },
      ],
      cells: [
        { rowIndex: 0, columnIndex: 0, value: 'Thiết kế UI' },
        { rowIndex: 0, columnIndex: 1, value: 'Nguyễn Văn A' },
        { rowIndex: 0, columnIndex: 2, value: 'Đang làm' },
        { rowIndex: 0, columnIndex: 3, value: 'Cần hoàn thành trước thứ 6' },
        { rowIndex: 1, columnIndex: 0, value: 'Code API' },
        { rowIndex: 1, columnIndex: 1, value: 'Trần Thị B' },
        { rowIndex: 1, columnIndex: 2, value: 'Chưa bắt đầu' },
        { rowIndex: 1, columnIndex: 3, value: '' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

const getWorkBoards = (): IWorkBoard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    const initialData = getInitialData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
    return initialData
  } catch (error) {
    console.error('Error loading work boards:', error)
    return getInitialData()
  }
}

const saveWorkBoards = (boards: IWorkBoard[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
  } catch (error) {
    console.error('Error saving work boards:', error)
  }
}

// Simulate API delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockWorkBoardsService = {
  getList: async (): Promise<{ workBoards: IWorkBoard[]; total: number }> => {
    await delay(500)
    const boards = getWorkBoards()
    return {
      workBoards: boards,
      total: boards.length,
    }
  },

  getDetail: async (id: number): Promise<{ workBoard: IWorkBoard }> => {
    await delay(300)
    const boards = getWorkBoards()
    const board = boards.find((b) => b.id === id)
    if (!board) {
      throw new Error('Work board not found')
    }
    return { workBoard: board }
  },

  create: async (data: ICreateWorkBoard): Promise<{ workBoard: IWorkBoard; message: string }> => {
    await delay(500)
    const boards = getWorkBoards()
    const newId = Math.max(0, ...boards.map((b) => b.id)) + 1
    const newBoard: IWorkBoard = {
      id: newId,
      name: data.name,
      description: data.description,
      rows: data.rows,
      columns: data.columns,
      columnHeaders: data.columnHeaders,
      cells: data.cells || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    boards.push(newBoard)
    saveWorkBoards(boards)
    return {
      workBoard: newBoard,
      message: 'Tạo bảng công việc thành công',
    }
  },

  update: async (data: IUpdateWorkBoard): Promise<{ workBoard: IWorkBoard; message: string }> => {
    await delay(500)
    const boards = getWorkBoards()
    const index = boards.findIndex((b) => b.id === data.id)
    if (index === -1) {
      throw new Error('Work board not found')
    }
    const updatedBoard: IWorkBoard = {
      ...boards[index],
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.rows !== undefined && { rows: data.rows }),
      ...(data.columns !== undefined && { columns: data.columns }),
      ...(data.columnHeaders !== undefined && { columnHeaders: data.columnHeaders }),
      ...(data.cells !== undefined && { cells: data.cells }),
      updatedAt: new Date().toISOString(),
    }
    boards[index] = updatedBoard
    saveWorkBoards(boards)
    return {
      workBoard: updatedBoard,
      message: 'Cập nhật bảng công việc thành công',
    }
  },

  delete: async (id: number): Promise<{ message: string }> => {
    await delay(300)
    const boards = getWorkBoards()
    const filtered = boards.filter((b) => b.id !== id)
    if (filtered.length === boards.length) {
      throw new Error('Work board not found')
    }
    saveWorkBoards(filtered)
    return {
      message: 'Xóa bảng công việc thành công',
    }
  },
}
