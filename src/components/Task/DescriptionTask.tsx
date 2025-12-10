import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { EditorJSComponent } from '../Editor'
import { convertHTMLToEditorJS } from '@/utils/editorjs'

export const DescriptionTask = ({
  projectAssignmentDetail,
  isEditingDescription,
  editedDescription,
  setEditedDescription,
  handleStartEdit,
  handleSaveDescription,
  handleCancelEdit,
}: {
  projectAssignmentDetail: any
  isEditingDescription: boolean
  editedDescription: any
  setEditedDescription: (description: any) => void
  handleStartEdit: () => void
  handleSaveDescription: () => void
  handleCancelEdit: () => void
}) => {
  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Mô tả</h3>
      </div>

      {isEditingDescription ? (
        <div className="space-y-3">
          <div className="border rounded-md p-4">
            <EditorJSComponent
              data={editedDescription}
              onChange={setEditedDescription}
              placeholder="Nhập mô tả công việc..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={projectAssignmentDetail?.status === 9}
              size="sm"
              onClick={handleSaveDescription}
              className="h-8"
            >
              <Check className="w-4 h-4 mr-1" />
              {projectAssignmentDetail?.status === 9 ? 'Công việc đã hoàn thành' : 'Lưu'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8">
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-gray-700 leading-relaxed prose max-w-none cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
          onClick={handleStartEdit}
        >
          {projectAssignmentDetail?.checkList ? (
            <EditorJSComponent
              key={projectAssignmentDetail.checkList} // 🔑 Force remount when checkList changes
              data={convertHTMLToEditorJS(projectAssignmentDetail.checkList)}
              readOnly={true}
              placeholder=""
            />
          ) : (
            <span className="italic text-gray-400">Chưa có mô tả - Click để thêm</span>
          )}
        </div>
      )}
    </div>
  )
}
