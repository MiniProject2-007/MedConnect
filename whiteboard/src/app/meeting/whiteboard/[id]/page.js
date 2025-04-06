import Whiteboard2 from "@/components/meeting/Whiteboard2";
import React from "react";

const WhiteboardPage = ({ params }) => {
    const { id } = params;
    return (
        <div className="p-4">
            <Whiteboard2 roomId={id} />
        </div>
    );
};

export default WhiteboardPage;
