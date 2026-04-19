"use client";

type ToastProps = {
  message: string;
  show: boolean;
  className?: string;
};

export default function Toast({ message, show, className }: ToastProps) {
  if (!show) return null;

  return (
    <div className={className || "fixed bottom-5 left-5 z-[120] rounded-full bg-yt-chip px-4 py-2 text-sm text-yt-textPrimary"}>
      {message}
    </div>
  );
}
