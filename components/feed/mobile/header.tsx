"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function MobileHeader() {
  return (
    <div className="_header_mobile_menu">
      <div className="_header_mobile_menu_wrap">
        <div className="container">
          <div className="_header_mobile_menu">
            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_header_mobile_menu_top_inner">
                  <div className="_header_mobile_menu_logo">
                    <Link href="/feed" className="_mobile_logo_link">
                      <Image
                        src="/assets/images/logo.svg"
                        alt="Logo"
                        width={158}
                        height={33}
                        className="_nav_logo"
                        unoptimized
                      />
                    </Link>
                  </div>
                  <div className="_header_mobile_menu_right">
                    <form className="_header_form_grp">
                      <span className="_header_mobile_search" style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                          <circle cx="7" cy="7" r="6" stroke="#666" />
                          <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                        </svg>
                      </span>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
