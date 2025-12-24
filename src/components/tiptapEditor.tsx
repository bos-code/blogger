// components/TipTapEditor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseconfig";

export default function TipTapEditor({ authorId }: { authorId: string }): JSX.Element {
  const [title, setTitle] = useState("");
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your blog post here...</p>",
  });

  const handlePublish = async () => {
    const content = editor?.getHTML() ?? ""; 

    await addDoc(collection(db, "posts"), {
      title,
      content,
      authorId,
      createdAt: new Date(),
      approved: false, // Admin can approve
    });

    setTitle("");
    editor.commands.setContent("<p>Start writing your blog post here...</p>");
  };

  return (
    <div className="space-y-4">
      <input
        className="input input-bordered w-full"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="border rounded-md p-2 bg-white">
        <EditorContent editor={editor} />
      </div>

      <button onClick={handlePublish} className="btn btn-primary">
        Publish Blog
      </button>
    </div>
  );
}
