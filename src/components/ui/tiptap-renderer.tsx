import { cn } from '@/lib/utils'
import { JSONContent } from '@tiptap/react'

interface TiptapRendererProps {
  content?: string | JSONContent
  className?: string
  fallback?: string
}

// Utility function to convert plain text to HTML
const convertPlainTextToHTML = (plainText: string): string => {
  if (!plainText || plainText.trim() === '') return ''

  // Convert line breaks to paragraph tags
  const paragraphs = plainText.split('\n\n')
  const htmlContent = paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return htmlContent
}

// Utility function to extract plain text from JSONContent
const extractTextFromJSONContent = (jsonContent: JSONContent): string => {
  if (!jsonContent) return ''

  if (jsonContent.type === 'text') {
    return jsonContent.text || ''
  }

  if (jsonContent.content && Array.isArray(jsonContent.content)) {
    return jsonContent.content
      .map(node => extractTextFromJSONContent(node))
      .join('')
  }

  return ''
}

export function TiptapRenderer({
  content,
  className,
  fallback = '',
}: TiptapRendererProps) {
  let htmlContent = ''

  // Handle different content types
  if (content) {
    if (typeof content === 'string') {
      htmlContent = content
    } else if (typeof content === 'object') {
      // For JSONContent, we need to convert it to HTML or extract text
      // For now, extract plain text and convert to HTML
      const plainText = extractTextFromJSONContent(content)
      htmlContent = convertPlainTextToHTML(plainText)
    }
  }

  // If no content, try to convert fallback to HTML
  if (!htmlContent || htmlContent.trim() === '') {
    if (!fallback || fallback.trim() === '') {
      return null
    }

    // Convert plain text fallback to HTML for better formatting
    htmlContent = convertPlainTextToHTML(fallback)
    if (htmlContent) {
      // Render converted HTML with proper styling
      return (
        <div
          className={cn(
            'prose prose-sm max-w-none',
            'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold',
            'prose-p:my-2 prose-p:leading-relaxed',
            'prose-ul:my-2 prose-li:my-1',
            'prose-ol:my-2 prose-ol:list-decimal',
            'prose-ul:list-disc prose-ul:ml-4',
            'prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic',
            'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
            'prose-strong:font-semibold',
            className
          )}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )
    }

    // Fallback to plain text span if conversion fails
    return (
      <span className={cn('text-muted-foreground', className)}>{fallback}</span>
    )
  }

  // Return rendered HTML content with proper styling
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold',
        'prose-p:my-2 prose-p:leading-relaxed',
        'prose-ul:my-2 prose-li:my-1',
        'prose-ol:my-2 prose-ol:list-decimal',
        'prose-ul:list-disc prose-ul:ml-4',
        'prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-strong:font-semibold',
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
