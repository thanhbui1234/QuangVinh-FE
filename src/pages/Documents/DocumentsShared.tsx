import { DocumentTable } from '@/components/Documents/DocumentTable'
import { useGetSharedDocuments } from '@/hooks/documents/useDocument'

const DocumentsShared = () => {
  const { data, isLoading } = useGetSharedDocuments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tài liệu được chia sẻ</h1>
        <p className="text-sm text-gray-500 mt-1">Các tài liệu được chia sẻ với bạn</p>
      </div>

      {/* Documents Table */}
      <DocumentTable documents={data?.documents || []} isLoading={isLoading} canDelete={false} />
    </div>
  )
}

export default DocumentsShared
