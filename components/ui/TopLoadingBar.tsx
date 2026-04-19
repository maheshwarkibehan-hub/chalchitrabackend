"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * YouTube-style thin loading bar at the top of the page.
 * Activates on route changes to give instant visual feedback.
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(60), 150);
    const t2 = setTimeout(() => setProgress(80), 400);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[200] h-[3px] bg-yt-accent transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress >= 100 ? 0 : 1,
      }}
    />
  );
}
