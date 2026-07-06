"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LikeUser } from "@/types/post";
import { getWhoLiked } from "@/services/like.service";

interface WhoLikedModalProps {
  postId?: string | null;
  commentId?: string | null;
  onClose: () => void;
}

export default function WhoLikedModal({ postId, commentId, onClose }: WhoLikedModalProps) {
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWhoLiked({
          postId: postId || undefined,
          commentId: commentId || undefined,
        });
        if (isMounted) {
          setUsers(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : "Failed to load likes";
          setError(errMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [postId, commentId]);

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ borderRadius: "12px", border: "none" }}>
          <div className="modal-header py-3 px-4 border-bottom-0 align-items-center">
            <h5 className="modal-title fw-bold" style={{ fontSize: "18px" }}>Reactions</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body px-4 py-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
            {loading && (
              <div className="text-center py-4">
                <span className="spinner-border spinner-border-sm text-primary"></span>
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
                {error}
              </div>
            )}
            {!loading && !error && users.length === 0 && (
              <div className="text-muted text-center py-4">No likes yet.</div>
            )}
            {!loading &&
              !error &&
              users.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                return (
                  <div className="d-flex align-items-center gap-3 py-2 border-bottom-light" key={user.id}>
                    <div style={{ position: "relative", width: "40px", height: "40px" }}>
                      <Image
                        src="/assets/images/comment_img.png"
                        alt={fullName}
                        fill
                        className="rounded-circle"
                      />
                    </div>
                    <span className="fw-semibold text-dark" style={{ fontSize: "15px" }}>
                      {fullName}
                    </span>
                  </div>
                );
              })}
          </div>
          <div className="modal-footer border-top-0 py-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-4"
              onClick={onClose}
              style={{ borderRadius: "6px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
