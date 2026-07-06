"use client";

import React, { useState, useEffect } from "react";
import { FeedComment } from "@/types/post";
import { getComments, createComment } from "@/services/comment.service";
import CommentForm from "../comments/comment-form";
import CommentItem from "../comments/comment-item";

interface PostCommentsProps {
  postId: string;
  onCommentCountChange: (newCount: number) => void;
  onOpenWhoLiked: (commentId: string) => void;
}

export default function PostComments({ postId, onCommentCountChange, onOpenWhoLiked }: PostCommentsProps) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      try {
        const data = await getComments(postId);
        if (isMounted) {
          setComments(data);
          onCommentCountChange(data.length);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : "Failed to load comments";
          setError(errMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadComments();
    return () => {
      isMounted = false;
    };
  }, [postId, onCommentCountChange]);

  const handleCommentSubmit = async (content: string) => {
    try {
      const newComment = await createComment(postId, content);
      // Prepend the new comment to the comments list
      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      onCommentCountChange(updatedComments.length);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleCommentUpdate = (updatedComment: FeedComment) => {
    setComments(comments.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
  };

  return (
    <div className="_feed_inner_timeline_cooment_area border-top pt-3 px-4">
      {/* Write Comment Box */}
      <CommentForm onSubmit={handleCommentSubmit} />

      <div className="_timline_comment_main mt-3">
        {loading && <div className="text-center py-2"><span className="spinner-border spinner-border-sm text-primary"></span></div>}
        {error && <div className="text-danger small py-2">{error}</div>}

        {!loading && !error && comments.length === 0 && (
          <div className="text-muted small py-2">No comments yet. Be the first to write one!</div>
        )}

        {!loading && !error && comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onCommentUpdate={handleCommentUpdate}
            onOpenWhoLiked={onOpenWhoLiked}
          />
        ))}
      </div>
    </div>
  );
}
