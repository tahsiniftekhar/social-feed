"use client";

import { FeedPost } from "@/types/post";
import { useState } from "react";
import FeedContent from "./feed-content";
import FeedHeader from "./feed-header";
import MobileBottomNav from "./mobile/bottom-nav";
import MobileHeader from "./mobile/header";
import SidebarLeft from "./sidebar-left";
import SidebarRight from "./sidebar-right";

interface FeedClientPageProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  initialPosts: FeedPost[];
}

export default function FeedClientPage({ user, initialPosts }: FeedClientPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handlePostCreated = (post: FeedPost) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className={`_layout _layout_main_wrapper ${isDarkMode ? "_dark_wrapper" : ""}`}>
      {/* Desktop Header */}
      <FeedHeader
        user={user}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Layout Wrapper */}
      <div className="_main_layout _padd_t32 _padd_b40">
        <div className="container _custom_container">
          <div className="row">
            {/* Left Sidebar */}
            <SidebarLeft />

            {/* Feed Middle Column */}
            <FeedContent
              posts={posts}
              onPostCreated={handlePostCreated}
            />

            {/* Right Sidebar */}
            <SidebarRight />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
