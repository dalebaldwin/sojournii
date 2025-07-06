'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react'

interface TiptapEditorProps {
  content?: JSONContent | string
  onUpdate?: (content: { html: string; json: JSONContent }) => void
  placeholder?: string
  className?: string
  editable?: boolean
  minHeight?: string
}

export function TiptapEditor({
  content,
  onUpdate,
  placeholder = 'Start typing...',
  className,
  editable = true,
  minHeight = '120px',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate({
          html: editor.getHTML(),
          json: editor.getJSON(),
        })
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'p-3 rounded-md border border-input bg-background text-sm',
          'min-h-[120px] overflow-y-auto',
          className
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  })

  if (!editor) {
    return null
  }

  if (!editable) {
    return (
      <div className={cn('prose prose-sm max-w-none', className)}>
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div className='w-full'>
      {/* Toolbar */}
      <div className='border-input bg-muted/50 flex flex-wrap gap-1 rounded-t-md border border-b-0 p-2'>
        {/* Text formatting */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 px-2', editor.isActive('bold') ? 'bg-accent' : '')}
        >
          <Bold className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'h-8 px-2',
            editor.isActive('italic') ? 'bg-accent' : ''
          )}
        >
          <Italic className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            'h-8 px-2',
            editor.isActive('strike') ? 'bg-accent' : ''
          )}
        >
          <Strikethrough className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn('h-8 px-2', editor.isActive('code') ? 'bg-accent' : '')}
        >
          <Code className='h-4 w-4' />
        </Button>

        {/* Divider */}
        <div className='bg-border mx-1 h-6 w-px' />

        {/* Headings */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(
            'h-8 px-2',
            editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''
          )}
        >
          <Heading1 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            'h-8 px-2',
            editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''
          )}
        >
          <Heading2 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            'h-8 px-2',
            editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''
          )}
        >
          <Heading3 className='h-4 w-4' />
        </Button>

        {/* Divider */}
        <div className='bg-border mx-1 h-6 w-px' />

        {/* Lists */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-8 px-2',
            editor.isActive('bulletList') ? 'bg-accent' : ''
          )}
        >
          <List className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-8 px-2',
            editor.isActive('orderedList') ? 'bg-accent' : ''
          )}
        >
          <ListOrdered className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'h-8 px-2',
            editor.isActive('blockquote') ? 'bg-accent' : ''
          )}
        >
          <Quote className='h-4 w-4' />
        </Button>

        {/* Divider */}
        <div className='bg-border mx-1 h-6 w-px' />

        {/* Undo/Redo */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className='h-8 px-2'
        >
          <Undo className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className='h-8 px-2'
        >
          <Redo className='h-4 w-4' />
        </Button>
      </div>

      {/* Editor */}
      <div className='relative'>
        <EditorContent
          editor={editor}
          className={cn(
            'border-input rounded-b-md border border-t-0',
            '[&_.ProseMirror]:focus:ring-ring [&_.ProseMirror]:focus:ring-2 [&_.ProseMirror]:focus:ring-offset-2 [&_.ProseMirror]:focus:outline-none'
          )}
        />
        {editor.isEmpty && (
          <div className='text-muted-foreground pointer-events-none absolute top-3 left-3 text-sm'>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
