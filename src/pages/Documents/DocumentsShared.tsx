import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileText, Download, Eye } from 'lucide-react'
import { useGetListDocument } from '@/hooks/documents/useGetListDocument'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

const DocumentsShared = () => {
  const { documents, isFetching } = useGetListDocument({
    statuses: [0],
    limit: 10,
  })

  const [tab, setTab] = useState('all')

  if (isFetching) return <div className="p-8 text-center text-gray-500">Đang tải...</div>
  if (!documents) return <div className="p-8 text-center text-gray-500">Không có tài liệu</div>

  const docs = documents || []

  const filteredDocs =
    tab === 'all'
      ? docs
      : tab === 'images'
        ? docs.filter((doc: any) => doc.contentType.startsWith('image/'))
        : tab === 'pdf'
          ? docs.filter((doc: any) => doc.contentType === 'application/pdf')
          : docs

  const allCount = docs.length
  const imagesCount = docs.filter((doc: any) => doc.contentType.startsWith('image/')).length
  const pdfCount = docs.filter((doc: any) => doc.contentType === 'application/pdf').length

  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tài liệu được chia sẻ</h1>
      <p className="text-gray-600 mb-8">Tất cả file mà mọi người đã chia sẻ với bạn</p>

      <Tabs value={tab} onValueChange={setTab} className="w-full mb-10">
        <TabsList className="inline-flex h-12 items-center rounded-full bg-gray-100 p-1 gap-1">
          <TabsTrigger
            value="all"
            className="rounded-full px-6 py-2.5 font-medium data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
          >
            Tất cả
            <Badge className="bg-white text-black text-xs px-2 data-[state=active]:bg-white data-[state=active]:text-black">
              {allCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="rounded-full px-6 py-2.5 font-medium data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
          >
            Hình ảnh
            <Badge className="bg-white text-black text-xs px-2 data-[state=active]:bg-white data-[state=active]:text-black">
              {imagesCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="pdf"
            className="rounded-full px-6 py-2.5 font-medium data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
          >
            PDF
            <Badge className="bg-white text-black text-xs px-2 data-[state=active]:bg-white data-[state=active]:text-black">
              {pdfCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3">
          <PhotoProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocs.map((doc: any) => {
                const status = { label: 'Đã chia sẻ', variant: 'secondary' as const }
                const isImage = doc.contentType.startsWith('image/')

                return (
                  <Card
                    key={doc.id}
                    className="group relative h-full border border-gray-200/80 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-xl hover:border-gray-300 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      {isImage ? (
                        <PhotoView src={doc.fileUrl}>
                          <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 cursor-pointer">
                            <img
                              src={doc.fileUrl}
                              alt={doc.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </PhotoView>
                      ) : (
                        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl w-full h-40 mb-4 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-white" />
                        </div>
                      )}

                      <CardTitle className="text-lg font-medium text-gray-900 line-clamp-1 pr-10">
                        {doc.title || 'Chưa đặt tên'}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {doc.uploader?.name
                          ? `Được chia sẻ bởi: ${doc.uploader?.name}`
                          : 'Không rõ người chia sẻ'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={status.variant} className="text-xs font-medium">
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={doc.uploader?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                            {doc.uploader?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 truncate">{doc.uploader?.name}</span>
                      </div>
                    </CardContent>

                    <div className="px-6 pb-5 mt-2">
                      <div className="flex gap-2">
                        {isImage ? (
                          <PhotoView src={doc.fileUrl}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 rounded-full text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                            </Button>
                          </PhotoView>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-9 rounded-full text-xs"
                            asChild
                          >
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1 h-9 rounded-full text-xs bg-black hover:bg-gray-800"
                          asChild
                        >
                          <a href={doc.downloadUrl} download={doc.title}>
                            <Download className="w-3.5 h-3.5 mr-1" /> Tải
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </PhotoProvider>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DocumentsShared
