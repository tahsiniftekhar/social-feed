"use client";

import React, { useState } from "react";
import Image from "next/image";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  avatarUrl?: string;
}

export default function CommentForm({ onSubmit, placeholder = "Write a comment", avatarUrl = "/assets/images/comment_img.png" }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="_feed_inner_comment_box w-100">
      <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
        <div className="_feed_inner_comment_box_content d-flex align-items-start gap-2">
          <div className="_feed_inner_comment_box_content_image">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={36}
              height={36}
              className="_comment_img"
            />
          </div>
          <div className="_feed_inner_comment_box_content_txt flex-grow-1">
            <textarea
              className="form-control _comment_textarea"
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ minHeight: "38px", height: "38px" }}
            />
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between mt-1 ps-5">
          {error && <span className="text-danger small">{error}</span>}
          <div className="_feed_inner_comment_box_icon ms-auto d-flex align-items-center gap-2">
            {content.trim() && (
              <button
                className="btn btn-primary btn-sm px-3"
                type="submit"
                disabled={loading}
                style={{ fontSize: "12px", height: "28px", border: "none" }}
              >
                {loading ? "Sending..." : "Post"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
