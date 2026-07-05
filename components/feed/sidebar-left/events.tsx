"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function EventsPanel() {
  const events = [
    {
      id: 1,
      title: "No more terrorism no more cry",
      day: "10",
      month: "Jul",
      people: "17 People Going",
      image: "/assets/images/feed_event1.png",
    },
    {
      id: 2,
      title: "No more terrorism no more cry",
      day: "10",
      month: "Jul",
      people: "17 People Going",
      image: "/assets/images/feed_event1.png",
    },
  ];

  return (
    <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
      <div className="_left_inner_event_content">
        <h4 className="_left_inner_event_title _title5">Events</h4>
        <Link href="/event" className="_left_inner_event_link">See all</Link>
      </div>
      {events.map((event, idx) => (
        <Link className="_left_inner_event_card_link" href="/event-single" key={idx}>
          <div className="_left_inner_event_card">
            <div className="_left_inner_event_card_iamge" style={{ position: "relative" }}>
              <Image
                src={event.image}
                alt="Event cover"
                width={528}
                height={320}
                className="_card_img"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="_left_inner_event_card_content">
              <div className="_left_inner_card_date">
                <p className="_left_inner_card_date_para">{event.day}</p>
                <p className="_left_inner_card_date_para1">{event.month}</p>
              </div>
              <div className="_left_inner_card_txt">
                <h4 className="_left_inner_event_card_title">{event.title}</h4>
              </div>
            </div>
            <hr className="_underline" />
            <div className="_left_inner_event_bottom">
              <p className="_left_iner_event_bottom">{event.people}</p>
              <span className="_left_iner_event_bottom_link">Going</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
