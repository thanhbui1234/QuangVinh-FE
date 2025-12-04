// import { create } from 'zustand'
// import { devtools } from 'zustand/middleware'
// import type { TaskStore, TaskResponse, ApiError } from '@/types'
// import { DELETE, GET, POST, PUT } from '../core/api'

// export const useTaskStore = create<TaskStore>()(
//   devtools(
//     (set, get) => ({
//       tasks: [],
//       isLoading: false,
//       error: null,
//       filter: 'all',
//       sortBy: 'createdAt',
//       sortOrder: 'desc',

//       fetchTasks: async () => {
//         set({ isLoading: true, error: null })

//         try {
//           const response = (await GET('/tasks')) as TaskResponse[]
//           const tasks = response

//           set({
//             tasks,
//             isLoading: false,
//             error: null,
//           })
//         } catch (error: unknown) {
//           const apiError = error as ApiError
//           set({
//             tasks: [],
//             isLoading: false,
//             error: apiError.message || 'Failed to fetch tasks',
//           })
//         }
//       },

//       createTask: async (taskData) => {
//         set({ isLoading: true, error: null })

//         try {
//           const response = (await POST('/tasks', taskData)) as TaskResponse
//           const newTask = response

//           set((state) => ({
//             tasks: [...state.tasks, newTask],
//             isLoading: false,
//             error: null,
//           }))
//         } catch (error: unknown) {
//           const apiError = error as ApiError
//           set({
//             isLoading: false,
//             error: apiError.message || 'Failed to create task',
//           })
//         }
//       },

//       updateTask: async (id, updates) => {
//         set({ isLoading: true, error: null })

//         try {
//           const response = (await PUT(`/tasks/${id}`, updates)) as TaskResponse
//           const updatedTask = response

//           set((state) => ({
//             tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
//             isLoading: false,
//             error: null,
//           }))
//         } catch (error: unknown) {
//           const apiError = error as ApiError
//           set({
//             isLoading: false,
//             error: apiError.message || 'Failed to update task',
//           })
//         }
//       },

//       deleteTask: async (id) => {
//         set({ isLoading: true, error: null })

//         try {
//           await DELETE(`/tasks/${id}`)

//           set((state) => ({
//             tasks: state.tasks.filter((task) => task.id !== id),
//             isLoading: false,
//             error: null,
//           }))
//         } catch (error: unknown) {
//           const apiError = error as ApiError
//           set({
//             isLoading: false,
//             error: apiError.message || 'Failed to delete task',
//           })
//         }
//       },

//       toggleTask: async (id) => {
//         const task = get().tasks.find((t) => t.id === id)
//         if (task) {
//           await get().updateTask(id, { completed: !task.completed })
//         }
//       },

//       setFilter: (filter) => {
//         set({ filter })
//       },

//       setSortBy: (sortBy) => {
//         set({ sortBy })
//       },

//       setSortOrder: (sortOrder) => {
//         set({ sortOrder })
//       },

//       clearError: () => {
//         set({ error: null })
//       },

//       setLoading: (loading) => {
//         set({ isLoading: loading })
//       },
//     }),
//     {
//       name: 'task-store',
//     }
//   )
// )

// // Selectors for computed values
// export const useFilteredTasks = () => {
//   return useTaskStore((state) => {
//     const { tasks, filter, sortBy, sortOrder } = state

//     let filteredTasks = tasks

//     // Apply filter
//     if (filter === 'completed') {
//       filteredTasks = tasks.filter((task) => task.completed)
//     } else if (filter === 'pending') {
//       filteredTasks = tasks.filter((task) => !task.completed)
//     }

//     // Apply sorting
//     filteredTasks.sort((a, b) => {
//       let aValue: string | number
//       let bValue: string | number

//       if (sortBy === 'priority') {
//         const priorityOrder = { high: 3, medium: 2, low: 1 }
//         aValue = priorityOrder[a.priority]
//         bValue = priorityOrder[b.priority]
//       } else if (sortBy === 'dueDate') {
//         aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
//         bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
//       } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
//         aValue = new Date(a[sortBy]).getTime()
//         bValue = new Date(b[sortBy]).getTime()
//       } else if (sortBy === 'title') {
//         aValue = a.title.toLowerCase()
//         bValue = b.title.toLowerCase()
//       } else {
//         aValue = a[sortBy] as string
//         bValue = b[sortBy] as string
//       }

//       if (sortOrder === 'asc') {
//         return aValue > bValue ? 1 : -1
//       } else {
//         return aValue < bValue ? 1 : -1
//       }
//     })

//     return filteredTasks
//   })
// }
