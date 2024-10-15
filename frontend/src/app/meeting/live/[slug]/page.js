import MeetingRoom from "@/components/meeting/MeetingRoom";
import React from "react";

const LiveMeeting = ({ params }) => {
    const { slug } = params;
    return (
        <div>
            <MeetingRoom slug={slug} />
        </div>
    );
};

export default LiveMeeting;
