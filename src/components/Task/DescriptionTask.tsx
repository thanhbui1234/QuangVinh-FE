import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { convertHTMLToEditorJS } from '@/utils/editorjs'

const EditorJSComponent = lazy(() =>
  import('../Editor').then((m) => ({ default: m.EditorJSComponent }))
)

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
        <h3 className="text-sm font-semibold text-foreground">Mô tả</h3>
      </div>

      {isEditingDescription ? (
        <div className="space-y-3">
          <div className="border border-border rounded-md p-4 bg-muted/30">
            <Suspense fallback={<div className="h-[120px] animate-pulse bg-muted rounded-md" />}>
              <EditorJSComponent
                data={editedDescription}
                onChange={setEditedDescription}
                placeholder="Nhập mô tả công việc..."
              />
            </Suspense>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveDescription} className="h-8">
              <Check className="w-4 h-4 mr-1" />
              Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8">
              <X className="w-4 h-4 mr-1" />
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-foreground leading-relaxed prose max-w-none cursor-pointer hover:bg-accent hover:text-accent-foreground p-2 -m-2 rounded transition-colors"
          onClick={handleStartEdit}
        >
          {projectAssignmentDetail?.checkList ? (
            <div className="dark:text-gray-100">
              <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-md" />}>
                <EditorJSComponent
                  key={projectAssignmentDetail.checkList} // 🔑 Force remount when checkList changes
                  data={convertHTMLToEditorJS(projectAssignmentDetail.checkList)}
                  readOnly={true}
                  placeholder=""
                />
              </Suspense>
            </div>
          ) : (
            <span className="italic text-muted-foreground">Chưa có mô tả - Click để thêm</span>
          )}
        </div>
      )}
    </div>
  )
}
