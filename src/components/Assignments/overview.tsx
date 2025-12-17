import { useMemo } from 'react'
import { STATUS_ICON, STATUS_LABEL } from './ProjectDetailTable/columns'

export const Overview = (props: { tasks: any }) => {
  const { tasks } = props
  const totalHours = useMemo(() => {
    return tasks.reduce((sum: any, t: any) => sum + (t.estimateHours || 0), 0)
  }, [tasks])

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="text-sm text-gray-600">Tổng số task</div>
            <div className="text-lg font-semibold">{tasks.length}</div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="text-sm text-gray-600">Tổng số giờ</div>
            <div className="text-lg font-semibold">
              {totalHours > 0 ? (
                `${totalHours} giờ`
              ) : (
                <p className="text-red-500">Quá hạn {totalHours} giờ</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(['todo', 'in_progress', 'pending', 'done', 'rejected'] as any[]).map((st) => {
            const count = tasks.filter((t: any) => t.status === st).length
            return (
              <div
                key={st}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm"
              >
                <span className="flex items-center">{STATUS_ICON[st]}</span>
                <span className="text-gray-700">{STATUS_LABEL[st]}</span>
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
