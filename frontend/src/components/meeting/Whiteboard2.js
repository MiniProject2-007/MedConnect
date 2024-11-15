"use client";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import React from "react";
import "tldraw/tldraw.css";

const Whiteboard2 = ({ id }) => {
    const store = useSyncDemo({ roomId: `peer-connect-007-${id}` });
    return (
        <div style={{ position: "fixed", inset: 0 }}>
            {" "}
            <Tldraw store={store} />
        </div>
    );
};

export default Whiteboard2;
