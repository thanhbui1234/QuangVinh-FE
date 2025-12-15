import { useState, useEffect, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { CustomDialog } from '@/components/ui/customDialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scoreSchema } from '@/schemas/taskSchema'
import { Button } from '@/components/ui/button'

export const DetailTask = () => {
  const { id } = useParams()
  const { projectAssignmentDetail, isFetching } = useGetDetailTask(Number(id))
  const { updateTaskMutation, isUpdateTaskLoading } = useUpdateTask()
  const { memberTask } = useGetMemberTask(projectAssignmentDetail?.groupId || 0)
  const [editOpen, setEditOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState<OutputData>(() =>
    convertHTMLToEditorJS(projectAssignmentDetail?.checkList || '')
  )
  const updateDescriptionMutation = useUpdateDescription()
  const scoreForm = useForm({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      progressScore: projectAssignmentDetail?.progressScore || 0,
    },
  })

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

  // Memoize initialData to prevent unnecessary re-creation
  const initialTaskData = useMemo(() => {
    if (!projectAssignmentDetail) return undefined
    return {
      description: projectAssignmentDetail.description,
      priority: projectAssignmentDetail.priority,
      taskType: projectAssignmentDetail.taskType,
      estimateTime: projectAssignmentDetail.estimateTime,
      status: projectAssignmentDetail.status,
      assigneeIds: projectAssignmentDetail.assignees?.map((a: any) => a.id) || [],
      supervisorId: projectAssignmentDetail.supervisor?.id,
      startTime: projectAssignmentDetail.startTime,
      checkList: projectAssignmentDetail.checkList,
      imageUrls: projectAssignmentDetail.imageUrls,
    }
  }, [projectAssignmentDetail])

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
            <MobileBar assignee={projectAssignmentDetail.supervisor} setInfoOpen={setInfoOpen} />
            <Card className="border-0 shadow-sm py-0">
              <div className="flex items-center justify-between px-3">
                <BreadcrumbTask projectAssignmentDetail={projectAssignmentDetail} />
                <div className="flex gap-2">
                  {projectAssignmentDetail.status === 9 &&
                    projectAssignmentDetail.progressScore === 0 && (
                      <Badge
                        onClick={() => setShowReview(true)}
                        className="px-2 py-1 cursor-pointer"
                      >
                        Đánh giá công việc
                      </Badge>
                    )}
                  {projectAssignmentDetail.progressScore > 0 && (
                    <Badge className="px-2 py-1 cursor-pointer bg-green-500">
                      Số điểm đánh giá {projectAssignmentDetail.progressScore}
                    </Badge>
                  )}
                </div>
              </div>

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
              assignees: data.assignees,
              supervisor: data.supervisor,
              assigneeIds: data.assigneeIds,
              supervisorId: data.supervisorId,
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
        initialData={initialTaskData}
        groupId={projectAssignmentDetail?.groupId || 0}
        isLoading={isUpdateTaskLoading}
      />
      <CustomDialog
        open={showReview}
        onOpenChange={setShowReview}
        title="Đánh giá công việc"
        description="Nhập điểm từ 1 đến 10"
      >
        <form
          onSubmit={scoreForm.handleSubmit((data) => {
            updateTaskMutation.mutate(
              {
                taskId: Number(id),
                progressScore: data.progressScore,
              },
              {
                onSuccess: () => {
                  setShowReview(false)
                  scoreForm.reset()
                },
              }
            )
          })}
          className="space-y-4"
        >
          <div>
            <Input
              {...scoreForm.register('progressScore', { valueAsNumber: true })}
              type="number"
              min={1}
              max={10}
              placeholder="Nhập điểm từ 1 đến 10"
            />
            {scoreForm.formState.errors.progressScore?.message && (
              <p className="text-sm text-red-500 mt-1">
                {String(scoreForm.formState.errors.progressScore.message)}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowReview(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isUpdateTaskLoading}>
              {isUpdateTaskLoading ? 'Đang lưu...' : 'Lưu đánh giá'}
            </Button>
          </div>
        </form>
      </CustomDialog>
    </div>
  )
}
