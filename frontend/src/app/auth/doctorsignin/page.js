'use client';
import DoctorSignInForm from "@/components/auth/DoctorSignin";
import React from "react";

const DoctorSigninPage = () => {
    return (
        <div className="min-h-screen w-full flex justify-center items-center">
            <DoctorSignInForm />
        </div>
    );
};

export default DoctorSigninPage;
