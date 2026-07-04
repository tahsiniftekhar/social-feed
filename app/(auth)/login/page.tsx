import AuthWrapper from "@/components/auth/auth-wrapper";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthWrapper
      wrapperClassName="_social_login_wrapper"
      contentClassName="_social_login_wrap"
    >
      {/* Left side column with Illustration */}
      <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
        <div className="_social_login_left">
          <div className="_social_login_left_image">
            <Image
              src="/assets/images/login.png"
              alt="Image"
              width={1269}
              height={1240}
              className="_left_img"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side column with Form Content */}
      <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
        <div className="_social_login_content">
          <div className="_social_login_left_logo _mar_b28">
            <Image
              src="/assets/images/logo.svg"
              alt="Image"
              width={158}
              height={33}
              className="_left_logo"
              unoptimized
            />
          </div>
          <p className="_social_login_content_para _mar_b8">Welcome back</p>
          <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>

          <button type="button" className="_social_login_content_btn _mar_b40">
            <Image
              src="/assets/images/google.svg"
              alt="Image"
              width={20}
              height={20}
              className="_google_img"
              unoptimized
            />{" "}
            <span>Or sign-in with google</span>
          </button>

          <div className="_social_login_content_bottom_txt _mar_b40">
            <span>Or</span>
          </div>

          <form className="_social_login_form">
            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14">
                  <label className="_social_login_label _mar_b8">Email</label>
                  <input type="email" className="form-control _social_login_input" />
                </div>
              </div>

              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_social_login_form_input _mar_b14">
                  <label className="_social_login_label _mar_b8">Password</label>
                  <input type="password" className="form-control _social_login_input" />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                <div className="form-check _social_login_form_check">
                  <input
                    className="form-check-input _social_login_form_check_input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                    defaultChecked
                  />
                  <label
                    className="form-check-label _social_login_form_check_label"
                    htmlFor="flexRadioDefault2"
                  >
                    Remember me
                  </label>
                </div>
              </div>

              <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                <div className="_social_login_form_left">
                  <p className="_social_login_form_left_para">Forgot password?</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                <div className="_social_login_form_btn _mar_t40 _mar_b60">
                  <button type="button" className="_social_login_form_btn_link _btn1">
                    Login now
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="_social_login_bottom_txt">
                <p className="_social_login_bottom_txt_para">
                  Dont have an account? <Link href="/register">Create New Account</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
