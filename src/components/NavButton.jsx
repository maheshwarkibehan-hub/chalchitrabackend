/**
 * NavButton Component - Category Filter Button
 *
 * Renders a filterable category button that updates the video filter state
 * when clicked in the ButtonList. Shows different styling for active/inactive states.
 *
 * @param {string} name - Category name (e.g., "All", "Gaming", "Music")
 */

import { useDispatch, useSelector } from "react-redux";
import { setCategory } from "../store/slices/filterSlice";

// Styling constants for active and inactive button states
const ACTIVE_CLASSES = "bg-black text-white";
const INACTIVE_CLASSES = "bg-gray-50 hover:bg-gray-200";
const BASE_CLASSES =
  "py-1 px-3 text-[11px] rounded-md cursor-pointer whitespace-nowrap shrink-0 transition-colors";

/**
 * Get button className based on active state
 * @param {boolean} isActive - Whether this category is currently selected
 * @returns {string} Combined className string
 */
function getButtonClassName(isActive) {
  return `${BASE_CLASSES} ${isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES}`;
}

function NavButton({ name }) {
  const dispatch = useDispatch();
  const activeCategory = useSelector((state) => state.filter.category);
  const isActive = activeCategory === name;

  const handleCategorySelect = () => {
    dispatch(setCategory(name));
  };

  return (
    <button
      onClick={handleCategorySelect}
      className={getButtonClassName(isActive)}
      aria-pressed={isActive}
      type="button"
    >
      {name}
    </button>
  );
}

export default NavButton;
