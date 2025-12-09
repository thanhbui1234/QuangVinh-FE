import { useGetListDocument } from '@/hooks/documents/useGetListDocument'

const DocumentsShared = () => {
  const { documents, isFetching } = useGetListDocument({
    statuses: [],
    offset: 0,
    limit: 10,
  })
  console.log(documents)
  if (isFetching) return <div>Loading...</div>
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tài liệu được chia sẻ</h1>
        <p className="text-sm text-gray-500 mt-1">Các tài liệu được chia sẻ với bạn</p>
      </div>

      {/* Documents Table */}
      {/* <DocumentTable documents={documents || []} isLoading={isFetching} canDelete={false} /> */}
    </div>
  )
}

export default DocumentsShared
