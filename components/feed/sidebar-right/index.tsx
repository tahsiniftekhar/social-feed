"use client";

import React from "react";
import YouMightLike from "./you-might-like";
import FriendsList from "./friends";

export default function SidebarRight() {
  return (
    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
      <div className="_layout_right_sidebar_wrap">
        <div className="_layout_right_sidebar_inner">
          <YouMightLike />
        </div>
        <div className="_layout_right_sidebar_inner">
          <FriendsList />
        </div>
      </div>
    </div>
  );
}
