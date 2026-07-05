"use client";

import React from "react";
import StoriesSlider from "./stories";
import CreatePost from "./create-post";
import PostCard from "./post-card";

export default function FeedContent() {
  const posts = [
    {
      id: 1,
      author: "Karim Saif",
      avatar: "/assets/images/post_img.png",
      timeAgo: "5 minute ago",
      title: "-Healthy Tracking App",
      image: "/assets/images/timeline_img.png",
      commentsCount: 12,
      sharesCount: 122,
    },
    {
      id: 2,
      author: "Karim Saif",
      avatar: "/assets/images/post_img.png",
      timeAgo: "5 minute ago",
      title: "-Healthy Tracking App",
      image: "/assets/images/timeline_img.png",
      commentsCount: 12,
      sharesCount: 122,
    },
  ];

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <StoriesSlider />
        <CreatePost />
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
