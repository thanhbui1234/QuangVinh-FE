import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useGetDetailTask } from '@/hooks/assignments/useGetDetailTask'
import { CommentTask } from '@/components/Task/CommentTask'
import { SidebarTask } from '@/components/Task/SidebarTask'
import CreateTaskModal from '@/components/Assignments/CreateTaskModal'
import { BottomSheetTask } from '@/components/Task/BottomSheet'
import type { OutputData } from '@editorjs/editorjs'
import { convertEditorJSToHTML, convertHTMLToEditorJS } from '@/utils/editorjs'
import { MobileBar } from '@/components/Task/MolbieBar'
import { useGetMemberTask } from '@/hooks/assignments/useGetMemberTask'
import { DetailSection } from '@/components/Task/DetailSection'
import { useUpdateTask } from '@/hooks/assignments/task/useUpdateTask'
import { useUpdateDescription } from '@/hooks/assignments/task/useUpdateDescription'
import { ButtonAction } from '@/components/Task/ButtonAction'
import { DescriptionTask } from '@/components/Task/DescriptionTask'
import { BreadcrumbTask } from '@/components/ui/breadcrumbTask'
import { ShowFileTask } from '@/components/Task/ShowFileTask'

export const DetailTask = () => {
  const { id } = useParams()
  const { projectAssignmentDetail, isFetching } = useGetDetailTask(Number(id))
  const { updateTaskMutation, isUpdateTaskLoading } = useUpdateTask()
  const { memberTask } = useGetMemberTask(projectAssignmentDetail?.groupId || 0)
  const [editOpen, setEditOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState<OutputData>(() =>
    convertHTMLToEditorJS(projectAssignmentDetail?.checkList || '')
  )
  const updateDescriptionMutation = useUpdateDescription()

  useEffect(() => {
    if (projectAssignmentDetail?.checkList) {
      const converted = convertHTMLToEditorJS(projectAssignmentDetail.checkList)
      setEditedDescription(converted)
    }
  }, [projectAssignmentDetail?.checkList])

  const handleSaveDescription = () => {
    const descriptionHTML = convertEditorJSToHTML(editedDescription)
    updateDescriptionMutation.mutate({ taskId: Number(id), checklist: descriptionHTML })
    setIsEditingDescription(false)
  }

  const handleCancelEdit = () => {
    setEditedDescription(convertHTMLToEditorJS(projectAssignmentDetail?.checkList || ''))
    setIsEditingDescription(false)
  }

  const handleStartEdit = () => {
    setEditedDescription(convertHTMLToEditorJS(projectAssignmentDetail?.checkList || ''))
    setIsEditingDescription(true)
  }

  if (isFetching)
    return (
      <div className="">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  {/* Title Skeleton */}
                  <div className="mb-6">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                  </div>

                  {/* Description Section Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm sticky top-6">
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-40 mb-5" />

                  <div className="space-y-5">
                    {/* Info Items Skeleton */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )

  if (!projectAssignmentDetail)
    return <div className="text-center pt-20 text-2xl text-gray-400">Task not found.</div>

  return (
    <div className="">
      <div className=" mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MobileBar assignee={projectAssignmentDetail.assignee} setInfoOpen={setInfoOpen} />
            <Card className="border-0 shadow-sm py-0">
              <BreadcrumbTask projectAssignmentDetail={projectAssignmentDetail} />
              <CardContent className="p-6 pt-0">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 flex-1">
                    {projectAssignmentDetail.description}
                  </h1>
                </div>

                <ButtonAction
                  memberTask={memberTask}
                  setEditOpen={setEditOpen}
                  projectAssignmentDetail={projectAssignmentDetail}
                />
                {/* Details Section */}
                <DetailSection projectAssignmentDetail={projectAssignmentDetail} />

                <DescriptionTask
                  projectAssignmentDetail={projectAssignmentDetail}
                  isEditingDescription={isEditingDescription}
                  editedDescription={editedDescription}
                  setEditedDescription={setEditedDescription}
                  handleStartEdit={handleStartEdit}
                  handleSaveDescription={handleSaveDescription}
                  handleCancelEdit={handleCancelEdit}
                />
              </CardContent>
            </Card>
            <ShowFileTask files={projectAssignmentDetail?.imageUrls || []} />

            {/* Comments Card */}
            <div className="comments-section">
              <CommentTask member={memberTask || []} taskId={id ? Number(id) : 0} />
            </div>
          </div>

          {/* Sidebar */}
          <SidebarTask projectAssignmentDetail={projectAssignmentDetail} />
        </div>
      </div>

      {/* Mobile detail sheet */}
      <BottomSheetTask
        infoOpen={infoOpen}
        setInfoOpen={setInfoOpen}
        task={projectAssignmentDetail}
      />
      <CreateTaskModal
        open={editOpen}
        onOpenChange={setEditOpen}
        memberTask={memberTask}
        onCreate={(data) => {
          updateTaskMutation.mutate(
            {
              taskId: Number(id),
              groupId: projectAssignmentDetail?.groupId || 0,
              description: data.description,
              priority: data.priority,
              taskType: data.taskType,
              estimateTime: data.estimateTime,
              status: data.status,
              assigneeId: data.assigneeId,
              startTime: data.startTime,
              imageUrls: data.imageUrls,
            },
            {
              onSuccess: () => {
                setEditOpen(false) // Close modal after successful update
              },
            }
          )
        }}
        mode="edit"
        initialData={{
          description: projectAssignmentDetail.description, // Mapping title to description as per CreateTaskModal structure
          priority: projectAssignmentDetail.priority, // Default or map from task if available
          taskType: projectAssignmentDetail.taskType, // Default or map from task if available
          estimateTime: projectAssignmentDetail.estimateTime, // Reverse calc or mock
          status: projectAssignmentDetail.status, // Map status string to number
          assigneeId: projectAssignmentDetail.assigneeId,
          startTime: projectAssignmentDetail.startTime, // Mock
          checkList: projectAssignmentDetail.checkList,
          imageUrls: projectAssignmentDetail.imageUrls,
        }}
        groupId={projectAssignmentDetail?.groupId || 0}
        isLoading={isUpdateTaskLoading}
      />
    </div>
  )
}
