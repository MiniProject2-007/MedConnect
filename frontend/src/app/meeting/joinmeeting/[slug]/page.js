import JoinMeeting from "@/components/meeting/JoinMeeting";
import LobbyScreen from "@/components/meeting/LobyScreen";
import React from "react";

const JoinMeetingPage = ({ params }) => {
    const { slug } = params;
    return (
        <div className="flex flex-col md:pl-32 py-2  min-h-screen">
            <JoinMeeting slug={slug} />
        </div>
    );
};

export default JoinMeetingPage;
