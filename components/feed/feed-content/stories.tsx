"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function StoriesSlider() {
  const desktopStories = [
    { id: 1, name: "Steve Jobs", image: "/assets/images/card_ppl1.png", isAdd: true },
    { id: 2, name: "Radovan SkillArena", image: "/assets/images/card_ppl2.png" },
    { id: 3, name: "Radovan SkillArena", image: "/assets/images/card_ppl3.png" },
    { id: 4, name: "Radovan SkillArena", image: "/assets/images/card_ppl4.png" },
  ];

  const mobileStories = [
    { id: 1, name: "Your Story", image: "/assets/images/mobile_story_img.png", isAdd: true },
    { id: 2, name: "Ryan...", image: "/assets/images/mobile_story_img1.png", isActive: true },
    { id: 3, name: "Ryan...", image: "/assets/images/mobile_story_img2.png", isInactive: true },
    { id: 4, name: "Ryan...", image: "/assets/images/mobile_story_img1.png", isActive: true },
    { id: 5, name: "Ryan...", image: "/assets/images/mobile_story_img2.png", isInactive: true },
  ];

  return (
    <>
      {/* For Desktop */}
      <div className="_feed_inner_ppl_card _mar_b16">
        <div className="_feed_inner_story_arrow">
          <button type="button" className="_feed_inner_story_arrow_btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
              <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
            </svg>
          </button>
        </div>
        <div className="row">
          {desktopStories.map((story) => (
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col" key={story.id}>
              <div className="_feed_inner_profile_story _b_radious6">
                <div className="_feed_inner_profile_story_image">
                  <Image
                    src={story.image}
                    alt={story.name}
                    width={300}
                    height={330}
                    className="_profile_story_img"
                  />
                  <div className="_feed_inner_story_txt">
                    {story.isAdd ? (
                      <>
                        <div className="_feed_inner_story_btn">
                          <button className="_feed_inner_story_btn_link" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                              <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                            </svg>
                          </button>
                        </div>
                        <h4 className="_feed_inner_profile_story_title_active">Add Story</h4>
                      </>
                    ) : (
                      <h4 className="_feed_inner_profile_story_title">{story.name}</h4>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Mobile */}
      <div className="_feed_inner_ppl_card_mobile _mar_b16">
        <div className="_feed_inner_ppl_card_area">
          <ul className="_feed_inner_ppl_card_area_list" style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {mobileStories.map((story) => (
              <li className="_feed_inner_ppl_card_area_item" key={story.id}>
                <Link href="#0" className="_feed_inner_ppl_card_area_link">
                  <div
                    className={
                      story.isAdd
                        ? "_feed_inner_ppl_card_area_story"
                        : story.isActive
                        ? "_feed_inner_ppl_card_area_story_active"
                        : "_feed_inner_ppl_card_area_story_inactive"
                    }
                  >
                    <Image
                      src={story.image}
                      alt={story.name}
                      width={story.isActive ? 60 : 120}
                      height={story.isActive ? 60 : 120}
                      className={story.isAdd ? "_card_story_img" : "_card_story_img1"}
                    />
                    {story.isAdd && (
                      <div className="_feed_inner_ppl_btn">
                        <button className="_feed_inner_ppl_btn_link" type="button">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                            <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={story.isAdd ? "_feed_inner_ppl_card_area_link_txt" : "_feed_inner_ppl_card_area_txt"}>
                    {story.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
