import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

export function useAudioRecorder(meetingId) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingStatus, setRecordingStatus] = useState("");
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const recordingStartTimeRef = useRef(null);
    const timerRef = useRef(null);
    const chunkIntervalRef = useRef(null);
    const uploadQueueRef = useRef([]);
    const isUploadingRef = useRef(false);
    const { user } = useUser();
    const { getToken } = useAuth();

    // Upload logic unchanged...
    const processUploadQueue = useCallback(async () => {
        if (isUploadingRef.current || uploadQueueRef.current.length === 0)
            return;
        isUploadingRef.current = true;

        try {
            const { blob, meta } = uploadQueueRef.current[0];
            setRecordingStatus("Uploading chunk...");
            const formData = new FormData();
            // descriptive filename
            const filename = `audio_${meetingId}_${
                meta.speaker
            }_${Date.now()}.webm`;
            formData.append("audio", blob, filename);
            formData.append("slug", meetingId);
            formData.append("userId", user?.id || "unknown");
            formData.append("speaker", meta.speaker);
            formData.append("startTime", meta.startTime);
            formData.append("endTime", meta.endTime);

            const response = await fetch(
                `${
                    import.meta.env.VITE_MAIN_SERVER_URL
                }/transcript/uploadAudio`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${await getToken()}` },
                    body: formData,
                }
            );

            if (!response.ok) {
                console.error("Upload failed:", await response.text());
                setRecordingStatus("Upload failed, retrying in 5s...");
                setTimeout(processUploadQueue, 5000);
                return;
            }

            uploadQueueRef.current.shift();
            setRecordingStatus(
                `Uploaded chunk (${uploadQueueRef.current.length} remaining)`
            );
            setTimeout(() => {
                if (isRecording) setRecordingStatus("Recording...");
            }, 2000);
        } catch (error) {
            console.error("Error uploading audio chunk:", error);
            setRecordingStatus("Upload error, will retry in 5s...");
            setTimeout(processUploadQueue, 5000);
        } finally {
            isUploadingRef.current = false;
            if (uploadQueueRef.current.length > 0) {
                setTimeout(processUploadQueue, 1000);
            }
        }
    }, [meetingId, user, isRecording, getToken]);

    const addChunkToUploadQueue = useCallback(
        (blob, meta) => {
            uploadQueueRef.current.push({ blob, meta });
            if (!isUploadingRef.current) processUploadQueue();
        },
        [processUploadQueue]
    );

    const cleanUp = useCallback(() => {
        // stop timers & recorder
        clearInterval(timerRef.current);
        clearInterval(chunkIntervalRef.current);
        timerRef.current = chunkIntervalRef.current = null;

        if (mediaRecorderRef.current?.state !== "inactive") {
            // flush final chunk
            mediaRecorderRef.current.requestData(); // :contentReference[oaicite:0]{index=0}
            mediaRecorderRef.current.stop();
        }
        audioStreamRef.current?.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;

        setRecordingTime(0);
        recordingStartTimeRef.current = null;
        setRecordingStatus("");
    }, []);

    const startRecording = useCallback(async () => {
        try {
            cleanUp();
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            audioStreamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
                audioBitsPerSecond: 128000,
            });
            mediaRecorderRef.current = mediaRecorder;
            recordingStartTimeRef.current = Date.now();

            let chunkStart = Date.now();
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    const now = Date.now();
                    const meta = {
                        speaker: localStorage.getItem("doctorToken")
                            ? "doctor"
                            : "patient",
                        startTime: new Date(chunkStart).toISOString(),
                        endTime: new Date(now).toISOString(),
                    };
                    addChunkToUploadQueue(e.data, meta);
                    chunkStart = now;
                }
            };

            // 1) Start continuous recording (no timeslice) :contentReference[oaicite:1]{index=1}
            mediaRecorder.start();

            // 2) Every 60s, request a blob
            chunkIntervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.requestData(); // :contentReference[oaicite:2]{index=2}
                }
            }, 60 * 1000);

            setIsRecording(true);
            setRecordingStatus("Recording started");

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor(
                    (Date.now() - recordingStartTimeRef.current) / 1000
                );
                setRecordingTime(elapsed);
            }, 1000);
        } catch (err) {
            console.error("Error starting recording:", err);
            setRecordingStatus("Failed to start recording");
            setIsRecording(false);
        }
    }, [cleanUp, addChunkToUploadQueue]);

    const stopRecording = useCallback(() => {
        cleanUp();
        setIsRecording(false);
        setRecordingStatus(
            `Recording stopped. Uploading remaining chunks (${uploadQueueRef.current.length})...`
        );
        if (!isUploadingRef.current) processUploadQueue();

        // wait for queue to drain
        const waiter = setInterval(() => {
            if (
                uploadQueueRef.current.length === 0 &&
                !isUploadingRef.current
            ) {
                clearInterval(waiter);
                setRecordingStatus("All uploads complete");
                setTimeout(() => setRecordingStatus(""), 3000);
            }
        }, 1000);
    }, [cleanUp, processUploadQueue]);

    useEffect(() => () => cleanUp(), [cleanUp]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordingTime,
        recordingStatus,
    };
}
