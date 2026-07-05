"use client";

import React from "react";
import StoriesSlider from "./stories";
import CreatePost from "./create-post";
import PostCard from "./post-card";
import { FeedPost } from "@/types/post";

interface FeedContentProps {
  posts: FeedPost[];
  onPostCreated(post: FeedPost): void;
}

export default function FeedContent({ posts, onPostCreated }: FeedContentProps) {


  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <StoriesSlider />
        <CreatePost
          onCreated={onPostCreated}
        />
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        ))}
      </div>
    </div>
  );
}
