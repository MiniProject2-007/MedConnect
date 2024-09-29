import React from "react";
import MeetingRoom from "@/components/meeting/MeetingRoom";
const MeetingRoomPage = ({ params }) => {
    return (
        <div>
            <MeetingRoom id={params.id} />
        </div>
    );
};

export default MeetingRoomPage;
