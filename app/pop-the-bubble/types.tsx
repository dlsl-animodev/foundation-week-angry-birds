export type BubbleVariant = "normal" | "star" | "heart" | "clock" | "rainbow";

export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  isPopping: boolean;
  variant: BubbleVariant;
}

export interface Fish {
  id: string;
  y: number;
  speed: number;
  scale: number;
  delay: number;
  type: "orange" | "yellow" | "purple";
}
