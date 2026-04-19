/**
 * Wrapper Component
 *
 * Layout wrapper that adds consistent right padding to child elements.
 * Used to maintain content spacing across different page layouts.
 *
 * @param {ReactNode} children - Child components to wrap
 */

const WRAPPER_PADDING_CLASS = "pr-6";

function Wrapper({ children }) {
  return <div className={WRAPPER_PADDING_CLASS}>{children}</div>;
}

export default Wrapper;
