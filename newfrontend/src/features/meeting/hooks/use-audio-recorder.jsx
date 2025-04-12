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
    const uploadQueueRef = useRef([]);
    const isUploadingRef = useRef(false);
    const { user } = useUser();
    const { getToken } = useAuth();

    const processUploadQueue = useCallback(async () => {
        if (isUploadingRef.current || uploadQueueRef.current.length === 0)
            return;

        isUploadingRef.current = true;
        const token = localStorage.getItem("doctorToken");
        try {
            const { blob, timestamp } = uploadQueueRef.current[0];

            setRecordingStatus("Uploading chunk...");

            const formData = new FormData();
            formData.append("audio", blob, "recording.mp3");
            formData.append("slug", meetingId);
            formData.append("userId", user?.id || "unknown");
            formData.append("speaker", `${token ? "doctor" : "patient"}`);
            formData.append("timestamp", new Date(timestamp).toISOString());

            const response = await fetch(`${import.meta.env.VITE_MAIN_SERVER_URL}/transcript/uploadAudio`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Upload failed:", await response.text());
                setRecordingStatus("Upload failed, retrying...");
            } else {
                uploadQueueRef.current.shift();
                setRecordingStatus(
                    `Uploaded chunk (${uploadQueueRef.current.length} remaining)`
                );

                setTimeout(() => {
                    if (isRecording) {
                        setRecordingStatus("Recording...");
                    }
                }, 2000);
            }
        } catch (error) {
            console.error("Error uploading audio chunk:", error);
            setRecordingStatus("Upload error, will retry...");
        } finally {
            isUploadingRef.current = false;

            if (uploadQueueRef.current.length > 0) {
                setTimeout(processUploadQueue, 1000);
            }
        }
    }, [meetingId, user, isRecording]);

    const addChunkToUploadQueue = useCallback(
        (blob, timestamp) => {
            uploadQueueRef.current.push({ blob, timestamp });

            if (!isUploadingRef.current) {
                processUploadQueue();
            }
        },
        [processUploadQueue]
    );

    const cleanUp = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
        }

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

            let audioChunks = [];
            let chunkStartTime = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);

                    const currentTime = Date.now();
                    const chunkDuration = currentTime - chunkStartTime;

                    if (chunkDuration >= 60000) {
                        const audioBlob = new Blob(audioChunks, {
                            type: "audio/webm",
                        });

                        addChunkToUploadQueue(audioBlob, chunkStartTime);

                        audioChunks = [];
                        chunkStartTime = currentTime;
                    }
                }
            };

            mediaRecorder.onstop = () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, {
                        type: "audio/webm",
                    });
                    addChunkToUploadQueue(audioBlob, chunkStartTime);
                }
            };

            mediaRecorder.start(20000);
            setIsRecording(true);
            setRecordingStatus("Recording started");

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor(
                    (Date.now() - recordingStartTimeRef.current) / 1000
                );
                setRecordingTime(elapsed);
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            setRecordingStatus("Failed to start recording");
            setIsRecording(false);
        }
    }, [cleanUp, addChunkToUploadQueue]);

    const stopRecording = useCallback(() => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsRecording(false);
        setRecordingStatus(
            `Recording stopped. Uploading remaining chunks (${uploadQueueRef.current.length})...`
        );

        if (uploadQueueRef.current.length > 0 && !isUploadingRef.current) {
            processUploadQueue();
        }

        const checkUploadsComplete = setInterval(() => {
            if (uploadQueueRef.current.length === 0) {
                clearInterval(checkUploadsComplete);
                setRecordingStatus("All uploads complete");

                setTimeout(() => {
                    setRecordingTime(0);
                    setRecordingStatus("");
                }, 3000);
            }
        }, 1000);
    }, [processUploadQueue]);

    useEffect(() => {
        return () => {
            cleanUp();
        };
    }, [cleanUp]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordingTime,
        recordingStatus,
    };
}
