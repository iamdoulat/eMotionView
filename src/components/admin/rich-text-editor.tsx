
'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Pilcrow, Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }
  
  const TiptapButton = ({
      onClick,
      isActive,
      children,
      title
  }: {
      onClick: () => void;
      isActive: boolean;
      children: React.ReactNode;
      title: string;
  }) => (
      <Button
          type="button"
          onClick={onClick}
          variant={isActive ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          title={title}
      >
          {children}
      </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input border-b-0 p-1 bg-background">
      <TiptapButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="h-4 w-4" /></TiptapButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <TiptapButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph"><Pilcrow className="h-4 w-4" /></TiptapButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <TiptapButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List className="h-4 w-4" /></TiptapButton>
      <TiptapButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="h-4 w-4" /></TiptapButton>
    </div>
  );
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
        if (editor.isEmpty) {
            onChange('');
        } else {
            onChange(editor.getHTML());
        }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none p-4 min-h-[200px] border border-input rounded-b-md bg-card',
      },
    },
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
