"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorRatings = ({ doctor }) => {
    const { ratings } = doctor;
    const averageRating =
        ratings.length > 0
            ? (
                  ratings.reduce((sum, rating) => sum + rating.rating, 0) /
                  ratings.length
              ).toFixed(1)
            : "N/A";

    const RatingSkeleton = () => (
        <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center border-[#FF6347] text-[#FF6347]"
                >
                    <StarIcon className="w-4 h-4 mr-2" />
                    View Ratings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#FF7F50]">
                        Ratings for Dr. {doctor.firstName} {doctor.lastName}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p className="text-lg font-semibold">
                        Average Rating:{" "}
                        <span className="text-[#FF7F50]">{averageRating}</span>
                    </p>
                    <div className="flex items-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-6 w-6 ${
                                    star <= Math.round(Number(averageRating))
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            ({ratings.length} reviews)
                        </span>
                    </div>
                </div>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    {ratings.length > 0 ? (
                        ratings.map((rating) => (
                            <Card key={rating._id} className="mb-4">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <User className="h-6 w-6 mr-2 text-gray-400" />
                                            <span className="font-semibold">
                                                {rating.username
                                                    ? rating.username
                                                    : "Anonymous"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`h-4 w-4 ${
                                                        star <= rating.rating
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {rating.review}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(
                                            rating.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">
                            No ratings yet.
                        </p>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default DoctorRatings;
