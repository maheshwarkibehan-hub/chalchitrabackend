/**
 * ToasterNotification Component
 *
 * Auto-dismissing toast notification that appears in the top-right corner.
 * Slides down with animation and closes after 2 seconds.
 *
 * @param {string} message - Notification message to display
 * @param {string} backgroundColor - Tailwind background color class (e.g., "bg-green-500")
 * @param {function} onClose - Callback when notification auto-closes
 */

import { useEffect } from "react";

// Animation keyframes
const SLIDE_DOWN_ANIMATION = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Constants
const AUTO_DISMISS_DELAY = 2000;
const NOTIFICATION_CLASSES =
  "fixed top-4 right-4 text-white text-[16px] px-6 py-3 rounded-lg shadow-lg min-w-[300px] z-50";
const ANIMATION_STYLE = { animation: "slideDown 0.3s ease-out" };

function ToasterNotification({ message, backgroundColor, onClose }) {
  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      onClose();
    }, AUTO_DISMISS_DELAY);

    return () => clearTimeout(dismissTimer);
  }, [onClose]);

  return (
    <>
      <div className={`${NOTIFICATION_CLASSES} ${backgroundColor}`} style={ANIMATION_STYLE}>
        {message}
      </div>
      <style>{SLIDE_DOWN_ANIMATION}</style>
    </>
  );
}

export default ToasterNotification;
