import React from "react";
import { useSync } from "@tldraw/sync";
import { AssetRecordType, getHashForString, Tldraw, uniqueId } from "tldraw";
import "tldraw/tldraw.css";
import { useParams } from "react-router";

const WORKER_URL = import.meta.env.VITE_WHITEBOARD_SERVER_URL;
function Whiteboard2() {
    const { id: roomId } = useParams();
    const store = useSync({
        uri: `${WORKER_URL}/connect/${roomId}`,
        assets: myAssetStore,
    });

    return (
        <div style={{ position: "fixed", inset: 0 }}>
            <div className="w-32 h-24 bg-[#f9fafb] absolute bottom-1 right-1 z-[1000]"></div>
            <Tldraw
                store={store}
                onMount={(editor) => {
                    window.editor = editor;
                    editor.registerExternalAssetHandler(
                        "url",
                        unfurlBookmarkUrl
                    );
                }}
            />
        </div>
    );
}

const UPLOAD_URL = `${import.meta.VITE_MAIN_SERVER_URL}/whiteboard/uploadImage`;

const myAssetStore = {
    async upload(asset, file) {
        const formData = new FormData();
        formData.append("image", file);

        const uniqueid = uniqueId();
        const key = `${uniqueid}/${file.name}`;
        formData.append("key", key);

        const res = await fetch(UPLOAD_URL, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        console.log(data);
        return data.url;
    },

    resolve(asset) {
        return asset.props.src;
    },
};

async function unfurlBookmarkUrl({ url }) {
    const asset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: "asset",
        type: "bookmark",
        meta: {},
        props: {
            src: url,
            description: "",
            image: "",
            favicon: "",
            title: "",
        },
    };

    try {
        const response = await fetch(
            `${WORKER_URL}/unfurl?url=${encodeURIComponent(url)}`
        );
        const data = await response.json();

        asset.props.description = data?.description || "";
        asset.props.image = data?.image || "";
        asset.props.favicon = data?.favicon || "";
        asset.props.title = data?.title || "";
    } catch (e) {
        console.error(e);
    }

    return asset;
}

export default Whiteboard2;
