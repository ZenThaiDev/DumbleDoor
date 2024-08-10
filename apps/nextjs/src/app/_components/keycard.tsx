"use client";

import React, { useCallback, useEffect, useState } from "react";

interface MovableKeycardProps {
  name: string;
  role: string;
  id: string;
  level: number;
}

export default function MovableKeycard({
  name,
  role,
  id,
  level,
}: MovableKeycardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        setPosition({
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        });
      }
    },
    [dragging, offset],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="rounded-lg bg-yellow-500 p-4 shadow-md"
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: "200px",
        height: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: "15px",
        cursor: dragging ? "move" : "default",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
    >
      <p className="text-base font-bold">{name}</p>
      <p className="text-base">{role}</p>
      <p className="text-xs">{id}</p>
      <p className="text-xs" style={{ marginTop: "15px" }}>
        Level: {level}
      </p>
    </div>
  );
}