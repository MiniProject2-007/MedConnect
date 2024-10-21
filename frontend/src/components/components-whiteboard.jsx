'use client';

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
    Eraser 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Whiteboard = () => {
    const socket = useSocket();
    const [elements, setElements] = useState([]);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#FF7F50");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const stageRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socket.on("whiteboardUpdate", (newElements) => {
                setElements(newElements);
            });

            return () => {
                socket.off("whiteboardUpdate");
            };
        }
    }, [socket]);

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

    const handleMouseDown = () => {
        setIsDrawing(true);
        const pos = stageRef.current.getPointerPosition();
        if (tool === "pen" || tool === "eraser") {
            const newLine = {
                type: "line",
                points: [pos.x, pos.y],
                stroke: tool === "eraser" ? "#FFFFFF" : color,
                strokeWidth: tool === "eraser" ? 20 : strokeWidth,
            };
            const updatedElements = [...elements, newLine];
            setElements(updatedElements);
            socket.emit("whiteboardUpdate", updatedElements);
        } else if (tool === "text") {
            const newText = {
                type: "text",
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

    const saveBoard = () => {
        const boardData = JSON.stringify(elements);
        socket.emit("saveWhiteboard", boardData);
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
        const link = document.createElement('a');
        link.download = 'whiteboard.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        (<div className="flex flex-col h-screen bg-gray-50">
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-white shadow-md">
                <Button
                    onClick={() => setTool("pen")}
                    variant={tool === "pen" ? "default" : "outline"}
                    className={tool === "pen" ? "bg-[#FF7F50] text-white hover:bg-[#FF6347]" : "text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white"}>
                    <Square className="w-4 h-4 mr-2" />
                    Pen
                </Button>
                <Button
                    onClick={() => addShape("rect")}
                    variant="outline"
                    className="text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white">
                    <Square className="w-4 h-4 mr-2" />
                    Rectangle
                </Button>
                <Button
                    onClick={() => addShape("circle")}
                    variant="outline"
                    className="text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white">
                    <CircleIcon className="w-4 h-4 mr-2" />
                    Circle
                </Button>
                <Button
                    onClick={() => setTool("text")}
                    variant={tool === "text" ? "default" : "outline"}
                    className={tool === "text" ? "bg-[#FF7F50] text-white hover:bg-[#FF6347]" : "text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white"}>
                    <Type className="w-4 h-4 mr-2" />
                    Text
                </Button>
                <Button
                    onClick={() => setTool("eraser")}
                    variant={tool === "eraser" ? "default" : "outline"}
                    className={tool === "eraser" ? "bg-[#FF7F50] text-white hover:bg-[#FF6347]" : "text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white"}>
                    <Eraser className="w-4 h-4 mr-2" />
                    Eraser
                </Button>
                <Button
                    onClick={clearBoard}
                    variant="outline"
                    className="text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                </Button>
                <Button
                    onClick={saveBoard}
                    variant="outline"
                    className="text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
                <Button
                    onClick={downloadBoard}
                    variant="outline"
                    className="text-[#FF7F50] hover:bg-[#FF7F50] hover:text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="color" className="text-gray-700">Color:</Label>
                    <Input
                        type="color"
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 p-1 rounded border-[#FF7F50]" />
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="strokeWidth" className="text-gray-700">Stroke Width:</Label>
                    <Slider
                        id="strokeWidth"
                        min={1}
                        max={20}
                        step={1}
                        value={[strokeWidth]}
                        onValueChange={([value]) => setStrokeWidth(value)}
                        className="w-32" />
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                <Stage
                    width={window.innerWidth}
                    height={window.innerHeight - 100}
                    ref={stageRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="bg-white">
                    <Layer>
                        {elements.map((element, i) => {
                            if (element.type === "rect") {
                                return <Rect key={i} {...element} />;
                            } else if (element.type === "circle") {
                                return <Circle key={i} {...element} />;
                            } else if (element.type === "line") {
                                return <Line key={i} {...element} />;
                            } else if (element.type === "text") {
                                return <Text key={i} {...element} />;
                            }
                            return null;
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>)
    );
};

export default Whiteboard;