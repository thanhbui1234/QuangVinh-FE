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
import { motion } from 'framer-motion'

export const DetailTask = () => {
  const { id } = useParams()
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const { projectAssignmentDetail, isLoading } = useGetDetailTask(Number(id))
  const groupId = projectAssignmentDetail?.groupId
  const { memberTask } = useGetMemberTask(groupId)
  const { updateTaskMutation, isUpdateTaskLoading } = useUpdateTask()
  const [editOpen, setEditOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [showReview, setShowReview] = useState(false)
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
    if (projectAssignmentDetail?.checkList && !isEditingDescription) {
      const converted = convertHTMLToEditorJS(projectAssignmentDetail.checkList)
      setEditedDescription(converted)
    }
  }, [projectAssignmentDetail?.checkList, isEditingDescription])

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
      isRecurrenceEnabled: projectAssignmentDetail.recurrenceEnable || false,
      recurrenceType: projectAssignmentDetail.recurrenceType,
      recurrenceInterval: projectAssignmentDetail.recurrenceInterval,
    }
  }, [projectAssignmentDetail])

  if (isLoading)
    return (
      <motion.div
        className=""
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
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
      </motion.div>
    )

  if (!projectAssignmentDetail)
    return (
      <motion.div
        className="text-center pt-20 text-2xl text-muted-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        Task not found.
      </motion.div>
    )

  return (
    <motion.div
      className=""
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className=" mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <MobileBar assignee={projectAssignmentDetail.supervisor} setInfoOpen={setInfoOpen} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
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
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                    className="flex items-start justify-between gap-4 mb-6"
                  >
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground flex-1">
                      {projectAssignmentDetail.description}
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 }}
                  >
                    <ButtonAction
                      memberTask={memberTask}
                      setEditOpen={setEditOpen}
                      projectAssignmentDetail={projectAssignmentDetail}
                    />
                  </motion.div>
                  {/* Details Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.25 }}
                  >
                    <DetailSection projectAssignmentDetail={projectAssignmentDetail} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.3 }}
                  >
                    <DescriptionTask
                      projectAssignmentDetail={projectAssignmentDetail}
                      isEditingDescription={isEditingDescription}
                      editedDescription={editedDescription}
                      setEditedDescription={setEditedDescription}
                      handleStartEdit={handleStartEdit}
                      handleSaveDescription={handleSaveDescription}
                      handleCancelEdit={handleCancelEdit}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.35 }}
            >
              <ShowFileTask files={projectAssignmentDetail?.imageUrls || []} />
            </motion.div>

            {/* Comments Card */}
            <motion.div
              className="comments-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <CommentTask member={memberTask || []} taskId={id ? Number(id) : 0} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25, ease: 'easeOut' }}
          >
            <SidebarTask projectAssignmentDetail={projectAssignmentDetail} />
          </motion.div>
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
              recurrenceType: data.recurrenceType,
              recurrenceInterval: data.recurrenceInterval,
              recurrenceEnable: data.isRecurrenceEnabled,
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
    </motion.div>
  )
}
