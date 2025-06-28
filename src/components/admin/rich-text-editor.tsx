'use client';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { 
        ssr: false,
        loading: () => <Skeleton className="h-[200px] w-full rounded-md" />
    }),[]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="bg-background [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
            />
        </div>
    );
}
