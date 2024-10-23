"use client";

import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const Feedback = ({ appointment }) => {
    const { userId, getToken } = useAuth();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { user } = useUser();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const doctorId = (appointment.userId1 === userId) ? appointment.userId2 : appointment.userId1;
        try {
            const token = await getToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_MAIN_SERVER}/doctor/rateDoctor/${doctorId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        userId: userId,
                    },
                    body: JSON.stringify({
                        rating,
                        review,
                        username: user.username,
                    }),
                }
            );

            if (response.ok) {
                toast({
                    title: "Feedback Submitted",
                    description: "Thank you for your feedback!",
                    variant: "default",
                });
                setIsDialogOpen(false);
            } else {
                throw new Error("Failed to submit feedback");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit feedback. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-fit bg-[#FF7F50] text-white hover:bg-[#FF6347] transition-colors duration-300">
                    Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    <DialogDescription>
                        Rate your experience with Dr. {appointment.doctorName}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="rating">Rating</Label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer ${
                                        star <= rating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="review">Review</Label>
                        <Textarea
                            id="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your review here..."
                            className="w-full mt-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full bg-[#FF7F50] text-white hover:bg-[#FF6347]"
                        >
                            Submit Feedback
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Feedback;
