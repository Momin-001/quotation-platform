"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Undo,
    Redo,
} from "lucide-react";

function ToolbarButton({ onClick, isActive, children, title }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"
            }`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({ content, onChange, className = "" }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ bulletList: false, orderedList: false, listItem: false }),
            Underline,
        ],
        content: content || "",
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-gray-50 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
            </div>
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]"
            />
        </div>
    );
}
