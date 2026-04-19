"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AmbientModeProps = {
  thumbnailUrl?: string;
  enabled: boolean;
};

function getAverageColor(data: Uint8ClampedArray) {
  let r = 0;
  let g = 0;
  let b = 0;
  let pixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    pixels += 1;
  }

  if (pixels === 0) return { r: 25, g: 25, b: 25 };

  return {
    r: Math.round(r / pixels),
    g: Math.round(g / pixels),
    b: Math.round(b / pixels),
  };
}

export default function AmbientMode({ thumbnailUrl, enabled }: AmbientModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState({ r: 44, g: 44, b: 44 });

  useEffect(() => {
    if (!enabled || !thumbnailUrl) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = thumbnailUrl;

    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      canvas.width = 32;
      canvas.height = 18;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      setColor(getAverageColor(frame.data));
    };
  }, [thumbnailUrl, enabled]);

  const style = useMemo(
    () => ({
      background: `radial-gradient(circle at center, rgba(${color.r}, ${color.g}, ${color.b}, 0.6) 0%, rgba(15, 15, 15, 0.95) 70%)`,
    }),
    [color],
  );

  if (!enabled) return null;

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[22px] blur-2xl" style={style} />
    </>
  );
}
