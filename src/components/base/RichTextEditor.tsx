import React, { useEffect, useRef } from 'react'

export type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <RteButton label="B" onClick={() => exec('bold')} />
        <RteButton label="I" onClick={() => exec('italic')} />
        <RteButton label="U" onClick={() => exec('underline')} />
        <RteButton label="• List" onClick={() => exec('insertUnorderedList')} />
        <RteButton label="1. List" onClick={() => exec('insertOrderedList')} />
        <RteButton label="Clear" onClick={() => exec('removeFormat')} />
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder || ''}
        style={{
          minHeight,
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: 10,
          outline: 'none',
        }}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}

function RteButton(props: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        padding: '6px 10px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        background: 'white',
        cursor: 'pointer',
      }}
    >
      {props.label}
    </button>
  )
}

export default RichTextEditor
