import AuthWrapper from "@/components/auth/auth-wrapper";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthWrapper
      wrapperClassName="_social_registration_wrapper"
      contentClassName="_social_registration_wrap"
    >
      {/* LEFT SIDE */}
      <div className="col-xl-8 col-lg-8 col-md-12">
        <div className="_social_registration_right">
          <div className="_social_registration_right_image">
            <Image
              src="/assets/images/registration.png"
              alt="Registration illustration"
              width={1928}
              height={1422}
              priority
            />
          </div>

          <div className="_social_registration_right_image_dark">
            <Image
              src="/assets/images/registration1.png"
              alt="Registration illustration dark"
              width={1928}
              height={1422}
              priority
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-xl-4 col-lg-4 col-md-12">
        <div className="_social_registration_content">

          {/* Logo */}
          <div className="_social_registration_right_logo mb-4">
            <Image
              src="/assets/images/logo.svg"
              alt="Buddy Script logo"
              width={158}
              height={33}
              className="_right_logo"
              unoptimized
            />
          </div>

          {/* Heading */}
          <p className="_social_registration_content_para mb-1">
            Get Started Now
          </p>
          <h4 className="_social_registration_content_title mb-4">
            Registration
          </h4>

          {/* Google Auth */}
          <button type="button" className="_social_registration_content_btn mb-4">
            <Image
              src="/assets/images/google.svg"
              alt="Google logo"
              width={20}
              height={20}
              className="_google_img"
              unoptimized
            />
            <span>Register with Google</span>
          </button>

          {/* Divider */}
          <div className="_social_registration_content_bottom_txt mb-4">
            <span>Or</span>
          </div>

          {/* FORM */}
          <form className="_social_registration_form">

            <div className="row g-3">

              {/* First Name */}
              <div className="col-12 col-md-6">
                <label className="_social_registration_label mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control _social_registration_input"
                />
              </div>

              {/* Last Name */}
              <div className="col-12 col-md-6">
                <label className="_social_registration_label mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control _social_registration_input"
                />
              </div>

              {/* Email */}
              <div className="col-12">
                <label className="_social_registration_label mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control _social_registration_input"
                />
              </div>

              {/* Password */}
              <div className="col-12 col-md-6">
                <label className="_social_registration_label mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control _social_registration_input"
                />
              </div>

              {/* Confirm Password */}
              <div className="col-12 col-md-6">
                <label className="_social_registration_label mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control _social_registration_input"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="terms"
              />
              <label className="form-check-label" htmlFor="terms">
                I agree to terms & conditions
              </label>
            </div>

            {/* Submit */}
            <div className="mt-4 mb-5">
              <button
                type="submit"
                className="_social_registration_form_btn_link _btn1 w-100"
              >
                Register
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="_social_registration_bottom_txt text-center">
            <p className="_social_registration_bottom_txt_para">
              Already have an account?{" "}
              <Link href="/login">Login</Link>
            </p>
          </div>

        </div>
      </div>
    </AuthWrapper>
  );
}
