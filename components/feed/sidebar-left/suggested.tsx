"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function SuggestedPeople() {
  const suggestions = [
    {
      id: 1,
      name: "Steve Jobs",
      image: "/assets/images/people1.png",
      role: "CEO of Apple",
    },
    {
      id: 2,
      name: "Ryan Roslansky",
      image: "/assets/images/people2.png",
      role: "CEO of Linkedin",
    },
    {
      id: 3,
      name: "Dylan Field",
      image: "/assets/images/people3.png",
      role: "CEO of Figma",
    },
  ];

  return (
    <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
      <div className="_left_inner_area_suggest_content _mar_b24">
        <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
        <span className="_left_inner_area_suggest_content_txt">
          <Link href="#0" className="_left_inner_area_suggest_content_txt_link">See All</Link>
        </span>
      </div>
      {suggestions.map((person) => (
        <div className="_left_inner_area_suggest_info" key={person.id}>
          <div className="_left_inner_area_suggest_info_box">
            <div className="_left_inner_area_suggest_info_image">
              <Link href="/profile">
                <Image
                  src={person.image}
                  alt={person.name}
                  width={40}
                  height={40}
                  className={person.id === 1 ? "_info_img" : "_info_img1"}
                />
              </Link>
            </div>
            <div className="_left_inner_area_suggest_info_txt">
              <Link href="/profile">
                <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
              </Link>
              <p className="_left_inner_area_suggest_info_para">{person.role}</p>
            </div>
          </div>
          <div className="_left_inner_area_suggest_info_link">
            <Link href="#0" className="_info_link">Connect</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
