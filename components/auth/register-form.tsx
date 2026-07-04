"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
    RegisterSchema,
    type RegisterInput,
} from "@/lib/validators";

export default function RegisterForm() {
    const router = useRouter();

    const [apiError, setApiError] = useState("");

    const {
        register,
        handleSubmit,
        control,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",

    });

    useEffect(() => {
        const firstErrorField = Object.keys(errors)[0];

        if (firstErrorField) {
            setFocus(firstErrorField as keyof RegisterInput);
        }
    }, [errors, setFocus]);

    const password = useWatch({
        control,
        name: "password",
    });

    const confirmPassword = useWatch({
        control,
        name: "confirmPassword",
    });

    const passwordMismatch =
        password &&
        confirmPassword &&
        password !== confirmPassword;

    const onSubmit = async (data: RegisterInput) => {
        setApiError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                // supports both single message and field errors
                if (result.errors) {
                    // optional: later we map field errors properly
                    setApiError("Please fix validation errors");
                } else {
                    setApiError(result.message);
                }
                return;
            }

            router.push("/login");
        } catch {
            setApiError("Something went wrong.");
        }
    };

    return (
        <form
            className="_social_registration_form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="row g-3">

                {/* First Name */}
                <div className="col-12 col-md-6">
                    <label className="_social_registration_label mb-1">
                        First Name
                    </label>

                    <input
                        type="text"
                        {...register("firstName")}
                        className="form-control _social_registration_input"
                    />

                    {errors.firstName && (
                        <small className="text-danger">
                            {errors.firstName.message}
                        </small>
                    )}
                </div>

                {/* Last Name */}
                <div className="col-12 col-md-6">
                    <label className="_social_registration_label mb-1">
                        Last Name
                    </label>

                    <input
                        type="text"
                        {...register("lastName")}
                        className="form-control _social_registration_input"
                    />

                    {errors.lastName && (
                        <small className="text-danger">
                            {errors.lastName.message}
                        </small>
                    )}
                </div>

                {/* Email */}
                <div className="col-12">
                    <label className="_social_registration_label mb-1">
                        Email
                    </label>

                    <input
                        type="email"
                        {...register("email")}
                        className="form-control _social_registration_input"
                    />

                    {errors.email && (
                        <small className="text-danger">
                            {errors.email.message}
                        </small>
                    )}
                </div>

                {/* Password */}
                <div className="col-12 col-md-6">
                    <label className="_social_registration_label mb-1">
                        Password
                    </label>

                    <input
                        type="password"
                        {...register("password")}
                        className="form-control _social_registration_input"
                    />

                    {errors.password && (
                        <small className="text-danger">
                            {errors.password.message}
                        </small>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="col-12 col-md-6">
                    <label className="_social_registration_label mb-1">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        {...register("confirmPassword")}
                        className="form-control _social_registration_input"
                    />

                    <div className="min-h-[20px]">
                        {errors.confirmPassword && (
                            <small className="text-danger">
                                {errors.confirmPassword.message}
                            </small>
                        )}

                        {!errors.confirmPassword && passwordMismatch && (
                            <small className="text-danger">
                                Passwords do not match
                            </small>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-check mt-3">

                <input
                    id="terms"
                    type="checkbox"
                    {...register("terms")}
                    className="form-check-input"
                />

                <label htmlFor="terms" className="form-check-label">
                    I agree to terms & conditions
                </label>

                {errors.terms && (
                    <div className="text-danger small mt-1">
                        {errors.terms.message}
                    </div>
                )}
            </div>
            {apiError && (
                <div className="alert alert-danger mt-3">
                    {apiError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="_social_registration_form_btn_link _btn1 w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        />
                        <span>Creating...</span>
                    </>
                ) : (
                    "Register"
                )}
            </button>
        </form>
    );
}
