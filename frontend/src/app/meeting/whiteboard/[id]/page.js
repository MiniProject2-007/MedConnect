import Whiteboard from "@/components/meeting/Whiteboard";
import React from "react";

const WhiteboardPage = ({ params }) => {
    const { id } = params;
    return (
        <div className="p-4">
            <Whiteboard id={id} />
        </div>
    );
};

export default WhiteboardPage;
