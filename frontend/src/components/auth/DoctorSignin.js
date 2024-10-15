"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DoctorSignInForm = () => {
    const router = useRouter();
    const { getToken, userId } = useAuth();
    const [alertInfo, setAlertInfo] = useState(null);
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_MAIN_SERVER}/doctor/doctorSignin`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        userid: userId,
                    },
                    body: JSON.stringify(data),
                }
            );

            const responseData = await res.json();

            if (res.ok) {
                setAlertInfo({
                    type: "success",
                    message: "Registration successful!",
                });
                localStorage.setItem("isDoctor", "true");
                router.push("/home");
            } else {
                setAlertInfo({
                    type: "error",
                    message:
                        responseData.message ||
                        "Registration failed. Please try again.",
                });
            }
        } catch (error) {
            setAlertInfo({
                type: "error",
                message: "An error occurred. Please try again.",
            });
        }
    };

    const specializationOptions = [
        { id: 1, value: "Cardiologist" },
        { id: 2, value: "Dermatologist" },
        { id: 3, value: "Neurologist" },
        { id: 4, value: "Pediatrician" },
        { id: 5, value: "Orthopedic Surgeon" },
        { id: 6, value: "Psychiatrist" },
        { id: 7, value: "Endocrinologist" },
        { id: 8, value: "Oncologist" },
        { id: 9, value: "Ophthalmologist" },
        { id: 10, value: "Gynecologist" },
        { id: 11, value: "Urologist" },
        { id: 12, value: "Gastroenterologist" },
        { id: 13, value: "Rheumatologist" },
        { id: 14, value: "Pulmonologist" },
        { id: 15, value: "Allergist" },
        { id: 16, value: "Nephrologist" },
        { id: 17, value: "Radiologist" },
        { id: 18, value: "Plastic Surgeon" },
        { id: 19, value: "Infectious Disease Specialist" },
        { id: 20, value: "Anesthesiologist" },
    ];

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-800">
                    Sign In as Doctor
                </CardTitle>
            </CardHeader>
            <CardContent>
                {alertInfo && (
                    <Alert
                        variant={
                            alertInfo.type === "error"
                                ? "destructive"
                                : "default"
                        }
                        className="mb-4"
                    >
                        {alertInfo.type === "error" ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {alertInfo.type === "error" ? "Error" : "Success"}
                        </AlertTitle>
                        <AlertDescription>{alertInfo.message}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Shreyas"
                                className="border-[#FF7F50] focus:ring-[#FF7F50]"
                                {...register("firstName", {
                                    required: "First name is required",
                                })}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Kamble"
                                className="border-[#FF7F50] focus:ring-[#FF7F50]"
                                {...register("lastName", {
                                    required: "Last name is required",
                                })}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Controller
                            name="specialization"
                            control={control}
                            rules={{ required: "Specialization is required" }}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger
                                        id="specialization"
                                        className="border-[#FF7F50] focus:ring-[#FF7F50]"
                                    >
                                        <SelectValue placeholder="Select specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specializationOptions.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.value}
                                            >
                                                {option.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.specialization && (
                            <p className="text-red-500 text-sm">
                                {errors.specialization.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                            id="experience"
                            type="number"
                            min="0"
                            placeholder="5"
                            className="border-[#FF7F50] focus:ring-[#FF7F50]"
                            {...register("experience", {
                                required: "Years of experience is required",
                                min: {
                                    value: 0,
                                    message: "Experience cannot be negative",
                                },
                            })}
                        />
                        {errors.experience && (
                            <p className="text-red-500 text-sm">
                                {errors.experience.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Input
                            id="qualifications"
                            placeholder="MD, PhD, etc."
                            className="border-[#FF7F50] focus:ring-[#FF7F50]"
                            {...register("qualifications", {
                                required: "Qualifications are required",
                            })}
                        />
                        {errors.qualifications && (
                            <p className="text-red-500 text-sm">
                                {errors.qualifications.message}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#FF7F50] text-white hover:bg-[#FF9F70]"
                    >
                        Sign In
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DoctorSignInForm;
