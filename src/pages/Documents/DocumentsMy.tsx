import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { UploadDocumentModal } from '@/components/Documents/UploadDocumentModal'

const DocumentsMy = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tải lên tài liệu
        </Button>
      </div>

      {/* Documents Table */}

      {/* Upload Modal */}
      <UploadDocumentModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  )
}

export default DocumentsMy
