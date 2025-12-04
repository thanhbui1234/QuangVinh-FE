import type { OutputData } from '@editorjs/editorjs'
import edjsHTML from 'editorjs-html'

// Configure parser without checklist support
const edjsHTMLParser = edjsHTML({
  checklist: () => '', // Ignore checklist blocks
})

/**
 * Convert EditorJS OutputData to HTML string
 * @param data - EditorJS OutputData object
 * @returns HTML string
 */
export const convertEditorJSToHTML = (data: OutputData): string => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return ''
  }

  try {
    const html = edjsHTMLParser.parse(data)
    // edjsParser returns an array of HTML strings
    if (Array.isArray(html)) {
      return html.join('')
    }
    return html
  } catch (error) {
    console.error('Error converting EditorJS to HTML:', error)
    return ''
  }
}

/**
 * Convert HTML string to EditorJS OutputData
 * This is a simple parser that handles basic HTML tags
 * @param html - HTML string
 * @returns EditorJS OutputData object
 */
export const convertHTMLToEditorJS = (html: string): OutputData => {
  if (!html || html.trim() === '') {
    return {
      blocks: [],
    }
  }

  try {
    const blocks: any[] = []

    // Parse HTML string into blocks
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body

    // Process each child element
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          blocks.push({
            type: 'paragraph',
            data: {
              text: text,
            },
          })
        }
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()

        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            blocks.push({
              type: 'header',
              data: {
                text: element.innerHTML,
                level: parseInt(tagName.charAt(1)),
              },
            })
            break

          case 'p': {
            const text = element.innerHTML.trim()
            if (text) {
              blocks.push({
                type: 'paragraph',
                data: {
                  text: text,
                },
              })
            }
            break
          }

          case 'ul':
          case 'ol': {
            const items = Array.from(element.querySelectorAll('li')).map((li) => li.innerHTML)
            if (items.length > 0) {
              blocks.push({
                type: 'list',
                data: {
                  style: tagName === 'ul' ? 'unordered' : 'ordered',
                  items: items,
                },
              })
            }
            break
          }

          case 'blockquote':
            blocks.push({
              type: 'quote',
              data: {
                text: element.innerHTML,
                caption: '',
              },
            })
            break

          case 'pre':
          case 'code':
            blocks.push({
              type: 'code',
              data: {
                code: element.textContent || '',
              },
            })
            break

          default:
            // For other tags, process children or treat as paragraph
            if (element.children.length > 0) {
              Array.from(element.children).forEach(processNode)
            } else {
              const text = element.innerHTML.trim()
              if (text) {
                blocks.push({
                  type: 'paragraph',
                  data: {
                    text: text,
                  },
                })
              }
            }
        }
      }
    }

    // Process all body children
    Array.from(body.children).forEach(processNode)

    // If no blocks were created, treat entire HTML as paragraph
    if (blocks.length === 0) {
      const text = body.innerHTML.trim()
      if (text) {
        blocks.push({
          type: 'paragraph',
          data: {
            text: text,
          },
        })
      }
    }

    return {
      blocks: blocks.length > 0 ? blocks : [],
    }
  } catch (error) {
    console.error('Error converting HTML to EditorJS:', error)

    // Fallback: treat as plain paragraph
    return {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: html.replace(/<[^>]*>/g, ''),
          },
        },
      ],
    }
  }
}
