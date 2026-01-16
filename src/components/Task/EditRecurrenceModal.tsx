import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { RecurrenceSettings } from '@/components/Assignments/RecurrenceSettings'
import { CreateTaskFormSchema, type CreateTaskFormData } from '@/schemas/taskSchema'
import { useUpdateRecurrence } from '@/hooks/assignments/task/useUpdateRecurrence'

interface EditRecurrenceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  onSuccess?: () => void
}

export const EditRecurrenceModal: React.FC<EditRecurrenceModalProps> = ({
  open,
  onOpenChange,
  task,
  onSuccess,
}) => {
  const updateRecurrenceMutation = useUpdateRecurrence(task)

  // Get initial recurrence data from task or recurrenceSchedules
  const initialRecurrenceData = useMemo(() => {
    const recurrenceSchedules = task?.recurrenceSchedules || []
    let recurrenceData = {
      isRecurrenceEnabled: task?.recurrenceEnable || false,
      recurrenceType: '',
      recurrenceInterval: '1',
      daysOfWeek: [] as string[],
      daysOfMonth: [] as string[],
      hours: [] as string[],
      minutes: [] as string[],
    }

    if (recurrenceSchedules.length > 0) {
      const schedule = recurrenceSchedules[0]
      recurrenceData = {
        isRecurrenceEnabled: task?.recurrenceEnable || false,
        recurrenceType: schedule.type ? String(schedule.type) : '',
        recurrenceInterval: schedule.interval ? String(schedule.interval) : '1',
        daysOfWeek: schedule.daysOfWeek?.map(String) || [],
        daysOfMonth: schedule.daysOfMonth?.map(String) || [],
        hours: schedule.hours?.map(String) || [],
        minutes: schedule.minutes?.map(String) || [],
      }
    } else if (task?.recurrenceType) {
      recurrenceData = {
        isRecurrenceEnabled: task?.recurrenceEnable || false,
        recurrenceType: String(task.recurrenceType),
        recurrenceInterval: task?.recurrenceInterval ? String(task.recurrenceInterval) : '1',
        daysOfWeek: [],
        daysOfMonth: [],
        hours: [],
        minutes: [],
      }
    }

    // Add required fields for schema validation
    return {
      ...recurrenceData,
      description: task?.description || '',
      priority: String(task?.priority || '2'),
      taskType: String(task?.taskType || '1'),
      status: String(task?.status || '1'),
      estimateDate: task?.estimateTime
        ? new Date(task.estimateTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      imageUrls: task?.imageUrls || [],
      assigneeIds: [],
      supervisor: '',
      checkList: '',
    }
  }, [task])

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(CreateTaskFormSchema) as any,
    defaultValues: initialRecurrenceData,
  })

  useEffect(() => {
    if (open) {
      reset({
        ...initialRecurrenceData,
        // Ensure all required fields are set
        description: task?.description || '',
        priority: String(task?.priority || '2'),
        taskType: String(task?.taskType || '1'),
        status: String(task?.status || '1'),
        estimateDate: task?.estimateTime
          ? new Date(task.estimateTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        imageUrls: task?.imageUrls || [],
        assigneeIds: [],
        supervisor: '',
        checkList: '',
      })
    }
  }, [open, initialRecurrenceData, reset, task])

  const onSubmit = (data: CreateTaskFormData) => {
    const taskId = task?.taskId || task?.id
    if (!taskId) {
      console.error('Task ID is missing')
      return
    }

    console.log('Form data:', data)

    const payload = {
      taskId,
      recurrenceEnable: data.isRecurrenceEnabled,
      recurrenceType: data.recurrenceType ? Number(data.recurrenceType) : undefined,
      recurrenceInterval: data.recurrenceInterval ? Number(data.recurrenceInterval) : undefined,
      daysOfWeek:
        data.daysOfWeek && data.daysOfWeek.length > 0
          ? data.daysOfWeek.map((d) => Number(d)).filter((d) => !isNaN(d))
          : undefined,
      daysOfMonth:
        data.daysOfMonth && data.daysOfMonth.length > 0
          ? data.daysOfMonth.map((d) => Number(d)).filter((d) => !isNaN(d))
          : undefined,
      hours:
        data.hours && data.hours.length > 0
          ? data.hours.map((h) => Number(h)).filter((h) => !isNaN(h))
          : undefined,
      minutes:
        data.minutes && data.minutes.length > 0
          ? data.minutes.map((m) => Number(m)).filter((m) => !isNaN(m))
          : undefined,
    }

    console.log('Payload to send:', payload)

    updateRecurrenceMutation.mutate(payload, {
      onSuccess: () => {
        console.log('Update recurrence success')
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
        console.error('Update recurrence error:', error)
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        onClick={() => !updateRecurrenceMutation.isPending && onOpenChange(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[80vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa lặp lại</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Cập nhật thông tin lặp lại tự động cho công việc
            </p>
          </div>
          <button
            onClick={() => !updateRecurrenceMutation.isPending && onOpenChange(false)}
            disabled={updateRecurrenceMutation.isPending}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error('Form validation errors:', errors)
          })}
          id="edit-recurrence-form"
        >
          <div className="p-6">
            <RecurrenceSettings control={control} watch={watch} errors={errors} />
            {/* Display form errors if any */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Có lỗi xảy ra khi xác thực form:
                </p>
                <ul className="text-xs text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, error]: [string, any]) => (
                    <li key={key}>
                      {key}: {error?.message || 'Invalid'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
            className="w-1/2"
            type="button"
            disabled={updateRecurrenceMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="edit-recurrence-form"
            className="w-1/2 bg-slate-900 hover:bg-slate-800"
            disabled={updateRecurrenceMutation.isPending}
          >
            {updateRecurrenceMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  )
}
