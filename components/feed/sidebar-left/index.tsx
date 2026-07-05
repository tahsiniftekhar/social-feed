"use client";

import React from "react";
import ExplorePanel from "./explore";
import SuggestedPeople from "./suggested";
import EventsPanel from "./events";

export default function SidebarLeft() {
  return (
    <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
      <div className="_layout_left_sidebar_wrap">
        <div className="_layout_left_sidebar_inner">
          <ExplorePanel />
        </div>
        <div className="_layout_left_sidebar_inner">
          <SuggestedPeople />
        </div>
        <div className="_layout_left_sidebar_inner">
          <EventsPanel />
        </div>
      </div>
    </div>
  );
}
