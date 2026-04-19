# Code Refactoring Guide - YouTube Clone

This guide provides patterns and best practices for refactoring your React project to follow clean code principles.

## Core Refactoring Principles

### 1. **Consistent Naming Conventions**

#### Props
```javascript
// ❌ Bad - Inconsistent naming
<Modal open={true} handleClose={close} handleConfirm={confirm} />

// ✅ Good - Consistent, semantic names
<Modal isOpen={true} onClose={close} onConfirm={confirm} />
```

**Pattern:** 
- Boolean props: `is*`, `has*`, `should*`
- Event handlers: `on*` (e.g., `onClose`, `onSubmit`, `onChange`)
- Other callbacks: Descriptive action names

#### Variables
```javascript
// ❌ Bad
const data = useSelector(...);
const x = localStorage.getItem(...);
let a = 0;

// ✅ Good
const videoData = useSelector(...);
const userPreferences = localStorage.getItem(...);
let completedTaskCount = 0;
```

### 2. **Extract Styling Constants**

```javascript
// ❌ Before - Inline styles scattered
<button className={`px-4 py-2 ${isActive ? "bg-black text-white" : "bg-gray-50 hover:bg-gray-200"}`}>
  Click
</button>

// ✅ After - Constants at top
const BUTTON_CLASSES = {
  active: "bg-black text-white",
  inactive: "bg-gray-50 hover:bg-gray-200",
  base: "px-4 py-2 transition-colors",
};

function getButtonClass(isActive) {
  return `${BUTTON_CLASSES.base} ${isActive ? BUTTON_CLASSES.active : BUTTON_CLASSES.inactive}`;
}

<button className={getButtonClass(isActive)}>Click</button>
```

### 3. **Extract Helper Functions**

```javascript
// ❌ Before - Complex logic in component
function VideoCard({ videoId, videoData }) {
  return (
    <div>
      {videoData && videoData.snippet && videoData.snippet.title ? (
        <h3>{videoData.snippet.title}</h3>
      ) : null}
    </div>
  );
}

// ✅ After - Extract validation
function getVideoTitle(videoData) {
  return videoData?.snippet?.title || null;
}

function VideoCard({ videoId, videoData }) {
  const title = getVideoTitle(videoData);
  return title ? <h3>{title}</h3> : null;
}
```

### 4. **Better Component Structure**

```javascript
// ✅ Good structure
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SomeModal from "./SomeModal";

// Constants at top
const DEFAULT_TIMEOUT = 3000;
const BUTTON_CLASSES = { /* ... */ };

// Helper functions
function validateData(data) { /* ... */ }
function processData(data) { /* ... */ }

// Sub-components (if needed)
function ModalHeader({ title }) { /* ... */ }
function ModalFooter({ onCancel, onConfirm }) { /* ... */ }

// Main component
function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(false);
  const dispatch = useDispatch();
  
  // Handlers
  const handleAction = () => { /* ... */ };
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

### 5. **Redux Actions - Better Naming**

```javascript
// ❌ Before
export const { add, set, remove } = slice.actions;

// ✅ After - Clear intent
export const { addToWatchLater, setCategory, removeFromLiked } = slice.actions;
```

### 6. **State Management - Clear Selectors**

```javascript
// ❌ Before
const isLiked = useSelector((state) => !!state.liked.likedVideos[videoId]);

// ✅ After - Create reusable selector
const selectIsVideoLiked = (state, videoId) => 
  !!state.liked.likedVideos[videoId];

// Or better - create custom hook
function useIsVideoLiked(videoId) {
  return useSelector((state) => !!state.liked.likedVideos[videoId]);
}

// Use in component
const isVideoLiked = useIsVideoLiked(videoId);
```

### 7. **Error Handling**

```javascript
// ❌ Before - Silent failures
const handleSubmit = () => {
  if (!videoId) return;
  dispatch(action(videoId));
};

// ✅ After - Clear error messages with context
const handleSubmit = () => {
  if (!videoId) {
    console.error("[SubmitButton] Missing required videoId");
    showErrorNotification("Video information unavailable");
    return;
  }
  dispatch(action(videoId));
};
```

### 8. **Hook Organization**

```javascript
// ✅ Good hook structure
import { useEffect, useState } from "react";

/**
 * Hook description and usage
 * @param {string} videoId - Video identifier
 * @returns {object} { data, isLoading, error }
 */
function useFetchVideoData(videoId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate inputs
  useEffect(() => {
    if (!videoId) return;
    if (data && data.id === videoId) return; // Already loaded

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  return { data, isLoading, error };
}
```

### 9. **Redux Slice Pattern**

```javascript
// ✅ Good slice structure
import { createSlice } from "@reduxjs/toolkit";

/**
 * Slice description: What state does it manage?
 * Structure: { items: {}, isLoading, error }
 */

const INITIAL_STATE = {
  items: {},
  isLoading: false,
  error: null,
};

const mySlice = createSlice({
  name: "myFeature",
  initialState: INITIAL_STATE,
  reducers: {
    // Descriptive action names
    addItem: (state, action) => {
      const { id, data } = action.payload;
      state.items[id] = data;
      state.error = null;
    },
    removeItem: (state, action) => {
      delete state.items[action.payload];
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { addItem, removeItem, setLoading, setError } = mySlice.actions;
export default mySlice.reducer;
```

### 10. **View/Page Component Pattern**

```javascript
// ✅ Good page structure
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";

function MyPage() {
  const dispatch = useDispatch();
  const [localState, setLocalState] = useState(false);
  
  // Selectors
  const items = useSelector((state) => state.feature.items);
  const isLoading = useSelector((state) => state.feature.isLoading);

  // Handlers
  const handleAddItem = (newItem) => {
    if (!validateItem(newItem)) return;
    dispatch(addItem(newItem));
  };

  // Render
  if (isLoading) return <LoadingState />;
  if (items.length === 0) return <EmptyState />;
  
  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default MyPage;
```

## File-by-File Refactoring Checklist

### Components (/src/components/)
- [ ] Extract CSS classes to constants
- [ ] Use semantic prop names (`isOpen`, `onClose`, `onConfirm`)
- [ ] Extract complex logic to functions
- [ ] Add JSDoc comments
- [ ] Remove unnecessary div wrappers
- [ ] Use composition for complex components

### Hooks (/src/hooks/)
- [ ] Use consistent naming: `use*` prefix
- [ ] Add JSDoc with @param and @returns
- [ ] Extract complex logic from components
- [ ] Handle errors and edge cases
- [ ] Validate inputs upfront

### Redux Slices (/src/store/slices/)
- [ ] Use clear action names
- [ ] Consistent state structure
- [ ] Add selector functions
- [ ] Document state shape

### Views (/src/views/)
- [ ] Extract sub-components
- [ ] Use composition pattern
- [ ] Keep business logic in hooks
- [ ] Clear data flow

### Utils (/src/utils/)
- [ ] Group related functions
- [ ] Add JSDoc comments
- [ ] Consistent function naming
- [ ] Handle edge cases

## Quick Reference: Renaming Map

| Old | New | Reason |
|-----|-----|--------|
| `open` | `isOpen` | Clearer boolean intent |
| `handleClose` | `onClose` | Standard React pattern |
| `handleConfirm` | `onConfirm` | Standard React pattern |
| `text` | `message` | More descriptive |
| `bgColor` | `backgroundColor` | Clearer name |
| `name` | `label` or `title` | Context-specific clarity |
| `img` | `iconUrl` or `imageSource` | More descriptive |
| `isUser` | `isUserLoggedIn` | Explicit meaning |
| `isLiked` | `isVideoLiked` | Context clarity |
| `handleClick` | `handleActionName` | Specific action |
| `data` | `specificDataName` | Descriptive |
| `error` | `errorMessage` | More specific |
| `loading` | `isLoading` | Boolean prefix |

## Implementation Strategy

1. **Priority Order:**
   - Constants & helpers first (easier, provides foundation)
   - Props & naming conventions (affects component interfaces)
   - Component structure (organization)
   - Redux improvements (state management clarity)
   - Pages/Views (final polish)

2. **Testing After Changes:**
   - Verify component rendering
   - Check Redux state updates
   - Test modal/form interactions
   - Ensure no prop-drilling issues

3. **Batch Updates:**
   - Update components that use changed components
   - Update Redux slices with new action names
   - Update imports in pages

## Examples by Category

### Before & After: Component

**Before:**
```jsx
const LikeBtn = ({ vidId, vData, count }) => {
  const [open, setOpen] = useState(false);
  const isLike = useSelector(s => !!s.liked.videos[vidId]);
  const user = useSelector(s => s.user);
  
  const handleLike = () => {
    if (user) {
      if (isLike) dispatch(unlike(vidId));
      else dispatch(like({vidId, vData: {...}}));
    } else setOpen(true);
  };
  
  return <>
    <button onClick={handleLike} className={`...${isLike ? 'bg-blue' : 'bg-gray'}...`}>...
    <AuthModal open={open} handleClose={() => setOpen(false)} />
  </>;
};
```

**After:**
```jsx
/**
 * LikeButton - Toggle like status for videos
 * @param {string} videoId - Video identifier
 * @param {object} videoData - Video metadata
 * @param {string} likeCount - Current like count
 */

const BUTTON_CLASSES = "px-4 py-1 rounded-full transition-all";
const LIKED_CLASS = "bg-blue-100";
const UNLIKED_CLASS = "bg-gray-200 hover:bg-gray-300";

function createLikePayload(videoId, videoData, likeCount) {
  return { videoId, videoData: { ...videoData, likeCount } };
}

function LikeButton({ videoId, videoData, likeCount }) {
  const dispatch = useDispatch();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const isVideoLiked = useSelector(s => !!s.liked.videos[videoId]);
  const isUserLoggedIn = useSelector(s => s.user);

  const handleLikeClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    if (isVideoLiked) dispatch(unlikeVideo(videoId));
    else dispatch(likeVideo(createLikePayload(videoId, videoData, likeCount)));
  };

  const buttonClasses = `${BUTTON_CLASSES} ${isVideoLiked ? LIKED_CLASS : UNLIKED_CLASS}`;

  return (
    <>
      <button onClick={handleLikeClick} className={buttonClasses}>
        <i className={`ri-thumb-up-${isVideoLiked ? 'fill' : 'line'}`} />
        <span>{likeCount ? formatViews(likeCount) : "Like"}</span>
      </button>
      <AuthenticationModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
```

## Common Pitfalls to Avoid

1. **Over-extracting** - Don't create tiny functions for simple logic
2. **Naming confusion** - Be consistent with prefixes (is*, handle*, on*)
3. **Deep nesting** - Extract complex ternaries to functions
4. **Magic strings** - Use constants for repeated strings
5. **Prop drilling** - Use Redux for deeply-nested state
6. **Silent failures** - Always log errors with context

---

**Apply these patterns incrementally and consistently across your project for maintainable, professional code!**
