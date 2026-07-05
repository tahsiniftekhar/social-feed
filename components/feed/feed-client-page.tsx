"use client";

import React, { useState } from "react";
import FeedHeader from "./feed-header";
import MobileHeader from "./mobile/header";
import MobileBottomNav from "./mobile/bottom-nav";
import SidebarLeft from "./sidebar-left";
import SidebarRight from "./sidebar-right";
import FeedContent from "./feed-content";

interface FeedClientPageProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function FeedClientPage({ user }: FeedClientPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
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
            <FeedContent />

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
