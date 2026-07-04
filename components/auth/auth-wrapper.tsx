import React from "react";
import Image from "next/image";

export default function AuthWrapper({
  children,
  wrapperClassName,
  contentClassName,
}: {
  children: React.ReactNode;
  wrapperClassName: string;
  contentClassName: string;
}) {
  return (
    <section className={`${wrapperClassName} _layout_main_wrapper`}>
      {/* Shapes */}
      <div className="_shape_one">
        <Image
          src="/assets/images/shape1.svg"
          alt=""
          width={176}
          height={540}
          className="_shape_img"
          unoptimized
          priority
        />
        <Image
          src="/assets/images/dark_shape.svg"
          alt=""
          width={176}
          height={540}
          className="_dark_shape"
          unoptimized
          priority
        />
      </div>

      <div className="_shape_two">
        <Image
          src="/assets/images/shape2.svg"
          alt=""
          width={568}
          height={400}
          className="_shape_img"
          unoptimized
          priority
        />
        <Image
          src="/assets/images/dark_shape1.svg"
          alt=""
          width={576}
          height={408}
          className="_dark_shape _dark_shape_opacity"
          unoptimized
          priority
        />
      </div>

      <div className="_shape_three">
        <Image
          src="/assets/images/shape3.svg"
          alt=""
          width={568}
          height={548}
          className="_shape_img"
          unoptimized
          priority
        />
        <Image
          src="/assets/images/dark_shape2.svg"
          alt=""
          width={568}
          height={548}
          className="_dark_shape _dark_shape_opacity"
          unoptimized
          priority
        />
      </div>

      {/* MAIN CONTENT */}
      <div className={contentClassName}>
        <div className="container">
          <div className="row align-items-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

