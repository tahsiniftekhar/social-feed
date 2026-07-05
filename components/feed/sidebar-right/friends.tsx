"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useState("");

  const friends = [
    {
      id: 1,
      name: "Steve Jobs",
      image: "/assets/images/people1.png",
      role: "CEO of Apple",
      online: false,
      lastActive: "5 minute ago",
    },
    {
      id: 2,
      name: "Ryan Roslansky",
      image: "/assets/images/people2.png",
      role: "CEO of Linkedin",
      online: true,
    },
    {
      id: 3,
      name: "Dylan Field",
      image: "/assets/images/people3.png",
      role: "CEO of Figma",
      online: true,
    },
    {
      id: 4,
      name: "Steve Jobs",
      image: "/assets/images/people1.png",
      role: "CEO of Apple",
      online: false,
      lastActive: "5 minute ago",
    },
    {
      id: 5,
      name: "Ryan Roslansky",
      image: "/assets/images/people2.png",
      role: "CEO of Linkedin",
      online: true,
    },
    {
      id: 6,
      name: "Dylan Field",
      image: "/assets/images/people3.png",
      role: "CEO of Figma",
      online: true,
    },
  ];

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
      <div className="_feed_top_fixed">
        <div className="_feed_right_inner_area_card_content _mar_b24">
          <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
          <span className="_feed_right_inner_area_card_content_txt">
            <Link className="_feed_right_inner_area_card_content_txt_link" href="/find-friends">See All</Link>
          </span>
        </div>
        <form className="_feed_right_inner_area_card_form" onSubmit={(e) => e.preventDefault()}>
          <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
            <circle cx="7" cy="7" r="6" stroke="#666"></circle>
            <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
          </svg>
          <input
            className="form-control me-2 _feed_right_inner_area_card_form_inpt"
            type="search"
            placeholder="input search text"
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      <div className="_feed_bottom_fixed" style={{ marginTop: "15px" }}>
        {filteredFriends.map((friend, idx) => (
          <div
            className={`_feed_right_inner_area_card_ppl ${friend.online ? "" : "_feed_right_inner_area_card_ppl_inactive"}`}
            key={idx}
          >
            <div className="_feed_right_inner_area_card_ppl_box">
              <div className="_feed_right_inner_area_card_ppl_image">
                <Link href="/profile">
                  <Image
                    src={friend.image}
                    alt={friend.name}
                    width={40}
                    height={40}
                    className="_box_ppl_img"
                  />
                </Link>
              </div>
              <div className="_feed_right_inner_area_card_ppl_txt">
                <Link href="/profile">
                  <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
                </Link>
                <p className="_feed_right_inner_area_card_ppl_para">{friend.role}</p>
              </div>
            </div>
            <div className="_feed_right_inner_area_card_ppl_side">
              {friend.online ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                </svg>
              ) : (
                <span>{friend.lastActive}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
