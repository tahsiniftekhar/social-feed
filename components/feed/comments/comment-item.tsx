"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FeedComment } from "@/types/post";
import { likeComment, unlikeComment } from "@/services/like.service";
import { createReply } from "@/services/comment.service";
import CommentForm from "./comment-form";

interface CommentItemProps {
  comment: FeedComment;
  onCommentUpdate: (updatedComment: FeedComment) => void;
  onOpenWhoLiked: (commentId: string) => void;
}

export default function CommentItem({ comment, onCommentUpdate, onOpenWhoLiked }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const avatarUrl = "/assets/images/comment_img.png";

  const handleLikeToggle = async () => {
    const nextLiked = !liked;
    const nextLikesCount = nextLiked ? likesCount + 1 : likesCount - 1;

    // Optimistic Update
    setLiked(nextLiked);
    setLikesCount(nextLikesCount);

    try {
      if (nextLiked) {
        await likeComment(comment.id);
      } else {
        await unlikeComment(comment.id);
      }
      // Notify parent of updated like state
      onCommentUpdate({
        ...comment,
        likedByCurrentUser: nextLiked,
        likesCount: nextLikesCount,
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      setLiked(!nextLiked);
      setLikesCount(liked ? likesCount : likesCount);
    }
  };

  const handleReplySubmit = async (content: string) => {
    try {
      const newReply = await createReply(comment.id, content);
      // Append reply to existing list
      onCommentUpdate({
        ...comment,
        replies: [...comment.replies, newReply],
      });
      setShowReplyForm(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="_comment_main_wrapper w-100 mb-3">
      {/* Parent Comment Row */}
      <div className="_comment_main d-flex align-items-start gap-2">
        <div className="_comment_image">
          <Link href="#0" className="_comment_image_link">
            <Image
              src={avatarUrl}
              alt={authorName}
              width={36}
              height={36}
              className="_comment_img1"
            />
          </Link>
        </div>
        <div className="_comment_area flex-grow-1">
          <div className="_comment_details">
            <div className="_comment_details_top">
              <div className="_comment_name">
                <Link href="#0">
                  <h4 className="_comment_name_title">{authorName}</h4>
                </Link>
              </div>
            </div>
            <div className="_comment_status">
              <p className="_comment_status_text mb-1">
                <span>{comment.content}</span>
              </p>
            </div>
            {likesCount > 0 && (
              <div className="_total_reactions d-inline-flex align-items-center gap-1" style={{ cursor: "pointer" }} onClick={() => onOpenWhoLiked(comment.id)}>
                <div className="_total_react d-inline-flex align-items-center">
                  <span className="_reaction_like d-inline-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up text-primary"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  </span>
                </div>
                <span className="_total fs-6">{likesCount}</span>
              </div>
            )}
            <div className="_comment_reply mt-1">
              <div className="_comment_reply_num">
                <ul className="_comment_reply_list d-flex align-items-center gap-2 m-0 p-0" style={{ listStyle: "none" }}>
                  <li>
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className="btn btn-link p-0 text-decoration-none small text-muted"
                      style={{ fontSize: "13px", fontWeight: liked ? "bold" : "normal", color: liked ? "#1890FF" : undefined }}
                    >
                      Like
                    </button>
                  </li>
                  <li>•</li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="btn btn-link p-0 text-decoration-none small text-muted"
                      style={{ fontSize: "13px" }}
                    >
                      Reply
                    </button>
                  </li>
                  <li>•</li>
                  <li>
                    <span className="_time_link text-muted small" style={{ fontSize: "12px" }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies List */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies-list ms-5 mt-2 border-start ps-3">
          {comment.replies.map((reply) => {
            const replyAuthorName = `${reply.author.firstName} ${reply.author.lastName}`;
            return (
              <div className="d-flex align-items-start gap-2 mb-2" key={reply.id}>
                <div className="p-2">
                <Image
                  src={avatarUrl}
                  alt={replyAuthorName}
                  width={28}
                  height={28}
                  className="rounded-circle"
                />
                </div>
                <div className="_comment_details flex-grow-1 p-2 bg-light rounded" style={{ fontSize: "13px" }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark">{replyAuthorName}</span>
                    <span className="text-muted small" style={{ fontSize: "11px" }}>
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mb-1 text-secondary mt-1">{reply.content}</p>

                  {/* Reply Likes bar */}
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const replyLiked = reply.likedByCurrentUser;
                        const nextReplyLiked = !replyLiked;
                        const nextReplyLikesCount = nextReplyLiked ? reply.likesCount + 1 : reply.likesCount - 1;

                        // Optimistic Update
                        const updatedReplies = comment.replies.map((r) =>
                          r.id === reply.id
                            ? { ...r, likedByCurrentUser: nextReplyLiked, likesCount: nextReplyLikesCount }
                            : r
                        );
                        onCommentUpdate({ ...comment, replies: updatedReplies });

                        try {
                          if (nextReplyLiked) {
                            await likeComment(reply.id);
                          } else {
                            await unlikeComment(reply.id);
                          }
                        } catch (err) {
                          console.error(err);
                          // Revert on error
                          const revertedReplies = comment.replies.map((r) =>
                            r.id === reply.id
                              ? { ...r, likedByCurrentUser: replyLiked, likesCount: reply.likesCount }
                              : r
                          );
                          onCommentUpdate({ ...comment, replies: revertedReplies });
                        }
                      }}
                      className="btn btn-link p-0 text-decoration-none text-muted"
                      style={{ fontSize: "12px", fontWeight: reply.likedByCurrentUser ? "bold" : "normal", color: reply.likedByCurrentUser ? "#1890FF" : undefined }}
                    >
                      Like
                    </button>
                    {reply.likesCount > 0 && (
                      <>
                        <span>•</span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px", cursor: "pointer" }}
                          onClick={() => onOpenWhoLiked(reply.id)}
                        >
                          👍 {reply.likesCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply input form */}
      {showReplyForm && (
        <div className="reply-form-wrapper ms-5 mt-2">
          <CommentForm
            placeholder="Write a reply..."
            onSubmit={handleReplySubmit}
            avatarUrl={avatarUrl}
          />
        </div>
      )}
    </div>
  );
}
