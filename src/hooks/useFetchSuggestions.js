import { useEffect, useState } from "react";
import { YOUTUBE_SEARCH_SUGGESTION_API } from "../utils/constants";

// ============================================================================
// CONSTANTS
// ============================================================================

const HOOK_NAME = "[useFetchSuggestions]";
const DEBOUNCE_DELAY = 200; // milliseconds

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates suggestion query before fetching
 * @param {string} query - Search query string
 * @returns {boolean} True if query is valid (non-empty)
 */
const isValidQuery = (query) => {
  return !!query?.trim();
};

/**
 * Handles suggestion fetch errors gracefully
 * @param {Error} error - Error from fetch
 * @param {string} query - Query that failed
 */
const handleSuggestionError = (error, query) => {
  console.error(`${HOOK_NAME} Failed to fetch suggestions for "${query}":`, error);
};

/**
 * Extracts suggestion items from API response
 * @param {Object} json - API response object
 * @returns {Array} Array of suggestion items
 */
const extractSuggestions = (json) => {
  return json?.items || [];
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFetchSuggestions Hook
 * Fetches search suggestions with debouncing
 * Prevents excessive API calls during typing
 *
 * @param {string} query - Search query for suggestions
 * @returns {Array} Array of suggestion items
 */
export function useFetchSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Clear suggestions if query is empty
    if (!isValidQuery(query)) {
      setSuggestions([]);
      return;
    }

    // Debounce API call to reduce requests while typing
    const debounceTimer = setTimeout(fetchData, DEBOUNCE_DELAY);

    /**
     * Fetches suggestions from API
     */
    async function fetchData() {
      try {
        const url = YOUTUBE_SEARCH_SUGGESTION_API(query);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch suggestions`);
        }

        const json = await response.json();
        const items = extractSuggestions(json);
        setSuggestions(items);
      } catch (error) {
        handleSuggestionError(error, query);
        setSuggestions([]);
      }
    }

    // Cleanup debounce timer on unmount or query change
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return suggestions;
}

