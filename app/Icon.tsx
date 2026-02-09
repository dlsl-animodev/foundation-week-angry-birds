import React from "react";

type IconType = "pop-the-bubble" | "slingshot";
type IconProps = {
  type: IconType;
  size?: number;
};

export default function Icon({ type, size = 112 }: IconProps) {
  const icons: Record<IconType, string> = {
    "pop-the-bubble": "🫧",
    slingshot: "🐦",
  };
  return (
    <span style={{ fontSize: size, display: "inline-block" }}>
      {icons[type] || "❓"}
    </span>
  );
}
