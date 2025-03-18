import React from "react";
import { LandingHeader } from "../components/header";
import { LandingHero } from "../components/hero";
import { LandingFeatures } from "../components/features";
import { LandingHowItWorks } from "../components/how-it-works";
import { LandingTestimonials } from "../components/testimonials";
import { LandingPricing } from "../components/pricing";
import { LandingFAQ } from "../components/faq";
import { LandingCTA } from "../components/cta";
import { LandingFooter } from "../components/footer";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />
            <main className="flex-1 w-full">
                <LandingHero />
                <LandingFeatures />
                <LandingHowItWorks />
                <LandingTestimonials />
                {/* <LandingPricing /> */}
                <LandingFAQ />
                <LandingCTA />
            </main>
            <LandingFooter />
        </div>
    );
}
