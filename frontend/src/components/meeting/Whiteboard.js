"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Circle, Text } from "react-konva";
import { useSocket } from "../HOC/SocketProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Square,
    Circle as CircleIcon,
    Type,
    Trash2,
    Download,
    Save,
    Eraser,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Whiteboard = ({ id }) => {
    const socket = useSocket();
    const [elements, setElements] = useState([]);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#FF7F50");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const stageRef = useRef(null);

    // Listen for updates from Socket.io
    useEffect(() => {
        if (socket) {
            socket.on("whiteboardUpdate", (newElements) => {
                setElements(newElements);
            });

            socket.on("loadWhiteboard", (boardData) => {
                setElements(JSON.parse(boardData));
            });

            return () => {
                socket.off("whiteboardUpdate");
            };
        }
    }, [socket]);

    const loadBoard = () => {
        socket.emit("loadWhiteboard", id);
    };

    useEffect(() => {
        loadBoard();
    }, []);

    const addShape = (type) => {
        const shape = {
            type,
            id: `${type}-${elements.length}`,
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: color,
            draggable: true,
        };
        const updatedElements = [...elements, shape];
        setElements(updatedElements);
        socket.emit("whiteboardUpdate", updatedElements);
    };

    const isOnTextClick = (pos) => {
        const clickedText = elements.find((el) => {
            if (el.type === "text") {
                const textNode = stageRef.current.findOne(`#${el.id}`);
                const textPosition = textNode.getAbsolutePosition();
                const areaPosition = {
                    x: textPosition.x,
                    y: textPosition.y,
                };
                return (
                    pos.x >= areaPosition.x &&
                    pos.x <= areaPosition.x + textNode.width() &&
                    pos.y >= areaPosition.y &&
                    pos.y <= areaPosition.y + textNode.height()
                );
            }
            return false;
        });
        if (clickedText) {
            handleTextDblClick(clickedText.id);
            return true;
        }
        return false;
    };

    const handleMouseDown = (e) => {
        const pos = stageRef.current.getPointerPosition();
        if (tool === "pen" || tool === "eraser") {
            setIsDrawing(true);
            const newLine = {
                type: "line",
                points: [pos.x, pos.y],
                stroke: tool === "eraser" ? "#FFFFFF" : color,
                strokeWidth: tool === "eraser" ? 20 : strokeWidth,
                draggable: false,
            };
            const updatedElements = [...elements, newLine];
            setElements(updatedElements);
            socket.emit("whiteboardUpdate", updatedElements);
        } else if (tool === "text") {
            if (isOnTextClick(pos)) {
                return;
            }
            const newText = {
                type: "text",
                id: `text-${elements.length}`,
                x: pos.x,
                y: pos.y,
                text: "Double click to edit",
                fontSize: 16,
                fill: color,
                draggable: true,
            };
            const updatedElements = [...elements, newText];
            setElements(updatedElements);
            socket.emit("whiteboardUpdate", updatedElements);
        }
    };

    const handleMouseMove = () => {
        if (!isDrawing) return;
        const pos = stageRef.current.getPointerPosition();
        const lastElement = elements[elements.length - 1];
        if (lastElement.type === "line") {
            lastElement.points = lastElement.points.concat([pos.x, pos.y]);
            const updatedElements = [
                ...elements.slice(0, elements.length - 1),
                lastElement,
            ];
            setElements(updatedElements);
            socket.emit("whiteboardUpdate", updatedElements);
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleTextDblClick = (id) => {
        const textNode = stageRef.current.findOne(`#${id}`);
        const textPosition = textNode.getAbsolutePosition();
        const areaPosition = {
            x: textPosition.x,
            y: textPosition.y,
        };

        const textarea = document.createElement("textarea");
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = "absolute";
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;

        textarea.addEventListener("blur", () => {
            textNode.text(textarea.value);
            const updatedElements = elements.map((el) =>
                el.id === id ? { ...el, text: textarea.value } : el
            );
            setElements(updatedElements);
            socket.emit("whiteboardUpdate", updatedElements);
            document.body.removeChild(textarea);
        });

        textarea.focus();
    };

    const saveBoard = () => {
        const boardData = JSON.stringify(elements);
        socket.emit("saveWhiteboard", {
            slug: id,
            data: boardData,
        });
        toast({
            title: "Whiteboard Saved",
            description: "Your whiteboard has been saved successfully.",
            variant: "default",
        });
    };

    const clearBoard = () => {
        setElements([]);
        socket.emit("whiteboardUpdate", []);
    };

    const downloadBoard = () => {
        const dataURL = stageRef.current.toDataURL();
        const link = document.createElement("a");
        link.download = "whiteboard.png";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-white shadow-md">
                <Button
                    onClick={() => setTool("pen")}
                    variant={tool === "pen" ? "default" : "outline"}
                    className={
                        tool === "pen"
                            ? "bg-[#FF7F50] text-white"
                            : "text-[#FF7F50]"
                    }
                >
                    <Square className="w-4 h-4 mr-2" />
                    Pen
                </Button>
                <Button
                    onClick={() => addShape("rect")}
                    variant="outline"
                    className="text-[#FF7F50]"
                >
                    <Square className="w-4 h-4 mr-2" /> Rectangle
                </Button>
                <Button
                    onClick={() => addShape("circle")}
                    variant="outline"
                    className="text-[#FF7F50]"
                >
                    <CircleIcon className="w-4 h-4 mr-2" /> Circle
                </Button>
                <Button
                    onClick={() => setTool("text")}
                    variant={tool === "text" ? "default" : "outline"}
                    className="text-[#FF7F50]"
                >
                    <Type className="w-4 h-4 mr-2" /> Text
                </Button>
                <Button
                    onClick={() => setTool("eraser")}
                    variant={tool === "eraser" ? "default" : "outline"}
                    className="text-[#FF7F50]"
                >
                    <Eraser className="w-4 h-4 mr-2" /> Eraser
                </Button>
                <Button
                    onClick={clearBoard}
                    variant="outline"
                    className="text-[#FF7F50]"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
                <Button
                    onClick={saveBoard}
                    variant="outline"
                    className="text-[#FF7F50]"
                >
                    <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button
                    onClick={downloadBoard}
                    variant="outline"
                    className="text-[#FF7F50]"
                >
                    <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="color" className="text-gray-700">
                        Color:
                    </Label>
                    <Input
                        type="color"
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 p-1 rounded border-[#FF7F50]"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="strokeWidth" className="text-gray-700">
                        Stroke Width:
                    </Label>
                    <Slider
                        id="strokeWidth"
                        min={1}
                        max={20}
                        step={1}
                        value={[strokeWidth]}
                        onValueChange={([value]) => setStrokeWidth(value)}
                        className="w-32"
                    />
                </div>
            </div>

            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight - 150}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
            >
                <Layer>
                    {elements.map((el, i) => {
                        switch (el.type) {
                            case "line":
                                return (
                                    <Line
                                        key={i}
                                        points={el.points}
                                        stroke={el.stroke}
                                        strokeWidth={el.strokeWidth}
                                        draggable={el.draggable}
                                    />
                                );
                            case "text":
                                return (
                                    <Text
                                        key={i}
                                        id={el.id}
                                        x={el.x}
                                        y={el.y}
                                        text={el.text}
                                        fontSize={el.fontSize}
                                        fill={el.fill}
                                        draggable={el.draggable}
                                        onDblClick={() =>
                                            handleTextDblClick(el.id)
                                        }
                                    />
                                );
                            case "rect":
                                return (
                                    <Rect
                                        key={i}
                                        x={el.x}
                                        y={el.y}
                                        width={el.width}
                                        height={el.height}
                                        fill={el.fill}
                                        draggable={el.draggable}
                                    />
                                );
                            case "circle":
                                return (
                                    <Circle
                                        key={i}
                                        x={el.x}
                                        y={el.y}
                                        radius={50}
                                        fill={el.fill}
                                        draggable={el.draggable}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </Layer>
            </Stage>
        </div>
    );
};

export default Whiteboard;

{
    /*  */
}
