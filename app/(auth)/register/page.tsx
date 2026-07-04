import AuthWrapper from "@/components/auth/auth-wrapper";
import RegisterForm from "@/components/auth/register-form";
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
          <RegisterForm />

          {/* Footer */}
          <div className="_social_registration_bottom_txt text-center mt-5">
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
