"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function YouMightLike() {
  return (
    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
      <div className="_right_inner_area_info_content _mar_b24">
        <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
        <span className="_right_inner_area_info_content_txt">
          <Link href="#0" className="_right_inner_area_info_content_txt_link">See All</Link>
        </span>
      </div>
      <hr className="_underline" />
      <div className="_right_inner_area_info_ppl">
        <div className="_right_inner_area_info_box">
          <div className="_right_inner_area_info_box_image">
            <Link href="/profile">
              <Image
                src="/assets/images/Avatar.png"
                alt="Avatar"
                width={50}
                height={50}
                className="_ppl_img"
              />
            </Link>
          </div>
          <div className="_right_inner_area_info_box_txt">
            <Link href="/profile">
              <h4 className="_right_inner_area_info_box_title">Radovan SkillArena</h4>
            </Link>
            <p className="_right_inner_area_info_box_para">Founder & CEO at Trophy</p>
          </div>
        </div>
        <div className="_right_info_btn_grp">
          <button type="button" className="_right_info_btn_link">Ignore</button>
          <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
        </div>
      </div>
    </div>
  );
}
