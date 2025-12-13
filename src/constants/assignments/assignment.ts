import { createQueryKeys } from '@/constants/queryKey'

export const projectsAssignmentsKey = createQueryKeys<string>('projects-assignments')
export const projectAssignmentDetailKey = createQueryKeys<string>('project-assignment-detail')
export const memberTaskKey = createQueryKeys<string>('member-task')
export const allUserKey = createQueryKeys<string>('all-user')
export const detailTaskKey = createQueryKeys<string>('detail-task')
export const listCommentKey = createQueryKeys<string>('list-comment')
export const workBoardsKey = createQueryKeys<number>('work-boards')
export const listDocumentKey = createQueryKeys<string>('list-document')
