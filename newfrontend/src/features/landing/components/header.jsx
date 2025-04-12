import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router";
import {
    SignedOut,
    SignInButton,
    SignUpButton,
    useAuth,
} from "@clerk/clerk-react";

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isSignedIn } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleContactClick = () => {
        toast("Contact Us", {
            description: "Our team will get back to you shortly!",
            action: {
                label: "Close",
                onClick: () => console.log("Closed"),
            },
        });
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full transition-all duration-200 py-2",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md shadow-sm"
                    : "bg-transparent"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <Link
                    to="/landing"
                    className="flex items-center gap-2 font-bold text-xl"
                >
                    <span className="text-primary">HealthConnect</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="#features"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        to="#how-it-works"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        How It Works
                    </Link>
                    <Link
                        to="#testimonials"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        Testimonials
                    </Link>
                    <Button
                        variant="ghost"
                        className="text-sm font-medium"
                        onClick={handleContactClick}
                    >
                        Contact
                    </Button>
                </nav>

                {!isSignedIn ? (
                    <div className="hidden md:flex items-center gap-4">
                        <SignedOut>
                            <SignInButton forceRedirectUrl="/dashboard">
                                <Button variant="outline">Log In</Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedOut>
                            <SignUpButton forceRedirectUrl="/dashboard">
                                <Button>Sign Up</Button>
                            </SignUpButton>
                        </SignedOut>
                    </div>
                ) : (
                    <div className="hidden md:flex items-center">
                        <Button variant="outline" asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </Button>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    {/* <ModeToggle /> */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden border-b bg-background"
                    >
                        <div className="flex flex-col space-y-3 py-4">
                            <Link
                                to="#features"
                                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                to="#how-it-works"
                                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How It Works
                            </Link>
                            <Link
                                to="#testimonials"
                                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Testimonials
                            </Link>
                            <Link
                                to="#pricing"
                                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Button
                                variant="ghost"
                                className="justify-start px-0 text-sm font-medium"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleContactClick();
                                }}
                            >
                                Contact
                            </Button>
                            {!isSignedIn ? (
                                <div className="flex flex-col justify-center items-center gap-4">
                                    <SignedOut>
                                        <SignInButton forceRedirectUrl="/dashboard">
                                            <Button variant="outline">
                                                Log In
                                            </Button>
                                        </SignInButton>
                                    </SignedOut>
                                    <SignedOut>
                                        <SignUpButton forceRedirectUrl="/dashboard">
                                            <Button>Sign Up</Button>
                                        </SignUpButton>
                                    </SignedOut>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center">
                                    <Button variant="outline" asChild>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
