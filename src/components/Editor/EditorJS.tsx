import { useEffect, useRef } from 'react'
import EditorJS, { type OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'

interface EditorJSComponentProps {
  data?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
  readOnly?: boolean
}

export const EditorJSComponent = ({
  data,
  onChange,
  placeholder = 'Nhập mô tả công việc...',
  readOnly = false,
}: EditorJSComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (editorRef.current) return // Prevent double initialization

    // Initialize Editor.js
    const editor = new EditorJS({
      holder: containerRef.current,
      placeholder,
      readOnly,
      autofocus: !readOnly, // Auto-focus khi ở edit mode để hiện toolbar
      data: data || {
        blocks: [],
      },
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Nhập tiêu đề',
            levels: [1, 2, 3, 4],
            defaultLevel: 1,
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered',
          },
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Nhập trích dẫn',
            captionPlaceholder: 'Tác giả',
          },
        },
        code: {
          class: Code,
          inlineToolbar: true,
          config: {
            placeholder: 'Nhập code',
          },
        },
        marker: {
          class: Marker,
        },
        inlineCode: {
          class: InlineCode,
        },
      },
      onChange: async () => {
        if (editorRef.current && onChange && !readOnly) {
          const content = await editorRef.current.save()
          onChange(content)
        }
      },
    })

    editorRef.current = editor

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [data, onChange, placeholder, readOnly])

  return <div ref={containerRef} className="min-h-[120px] prose max-w-none" />
}
