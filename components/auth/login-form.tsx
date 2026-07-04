"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import {
    LoginSchema,
    type LoginInput,
} from "@/lib/validators";

export default function LoginForm() {
    const router = useRouter();

    const [apiError, setApiError] = useState("");

    const {
        register,
        handleSubmit,
        setFocus,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
    });

    useEffect(() => {
        const firstError = Object.keys(errors)[0];

        if (firstError) {
            setFocus(firstError as keyof LoginInput);
        }
    }, [errors, setFocus]);

    const onSubmit: SubmitHandler<LoginInput> = async (
        data
    ) => {
        setApiError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setApiError(result.message);
                return;
            }

            router.push("/feed");
            router.refresh();
        } catch {
            setApiError("Something went wrong.");
        }
    };

    return (
        <form
            className="_social_login_form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="row g-3">

                {/* Email */}

                <div className="col-12">
                    <label className="_social_login_label mb-1">
                        Email
                    </label>

                    <input
                        type="email"
                        {...register("email")}
                        className="form-control _social_login_input"
                    />

                    {errors.email && (
                        <small className="text-danger">
                            {errors.email.message}
                        </small>
                    )}
                </div>

                {/* Password */}

                <div className="col-12">
                    <label className="_social_login_label mb-1">
                        Password
                    </label>

                    <input
                        type="password"
                        {...register("password")}
                        className="form-control _social_login_input"
                    />

                    {errors.password && (
                        <small className="text-danger">
                            {errors.password.message}
                        </small>
                    )}
                </div>

            </div>

            <div className="row mt-3">
                <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                    <div className="form-check _social_login_form_check">
                        <input
                            className="form-check-input _social_login_form_check_input"
                            type="radio"
                            name="flexRadioDefault"
                            id="flexRadioDefault2"

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

            {apiError && (
                <div className="alert alert-danger mt-3">
                    {apiError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="_social_login_form_btn_link _btn1 w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                style={{
                    padding: "12px 24px",
                    whiteSpace: "nowrap",
                }}
            >
                {isSubmitting ? (
                    <>
                        <span
                            className="spinner-border spinner-border-sm"
                            aria-hidden="true"
                        />
                        <span>Signing in...</span>
                    </>
                ) : (
                    "Login"
                )}
            </button>
        </form>
    );
}
