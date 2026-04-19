import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

// ============================================================================
// STYLES & CONSTANTS
// ============================================================================

const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxWidth: "90%",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 0,
};

const MAX_DESCRIPTION_LENGTH = 1000;

// Report reasons with predefined descriptions
const REPORT_REASONS = [
  {
    id: "sexual-content",
    title: "Sexual content",
    description:
      "This video contains sexual or adult content that violates YouTube's community guidelines.",
  },
  {
    id: "violent-content",
    title: "Violent or repulsive content",
    description:
      "This video displays violence, graphic content, or disturbing material that may shock or disgust viewers.",
  },
  {
    id: "hateful-content",
    title: "Hateful or abusive content",
    description:
      "This video promotes hatred, discrimination, or abuse against individuals or groups based on protected attributes.",
  },
  {
    id: "harassment",
    title: "Harassment or bullying",
    description:
      "This video contains content that harasses, intimidates, or bullies an individual or group.",
  },
  {
    id: "spam",
    title: "Spam or misleading",
    description:
      "This video is spam, misleading, or uses deceptive practices to gain views or engagement.",
  },
  {
    id: "child-abuse",
    title: "Child abuse",
    description:
      "This video exploits, endangers, or otherwise harms children in any way.",
  },
  {
    id: "terrorism",
    title: "Promotes terrorism",
    description:
      "This video promotes or incites terrorist activities or violent extremism.",
  },
  {
    id: "copyright",
    title: "Infringes my rights",
    description:
      "This video violates my copyright, privacy, or other legal rights.",
  },
  {
    id: "misinformation",
    title: "Misinformation",
    description:
      "This video spreads false or misleading information that could cause harm.",
  },
  {
    id: "other",
    title: "Other",
    description: "",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Finds report reason by ID and returns its default description
 * @param {string} reasonId - ID of the report reason
 * @returns {string} Default description for the reason
 */
const getReasonDescription = (reasonId) => {
  const reason = REPORT_REASONS.find((r) => r.id === reasonId);
  return reason?.description || "";
};

/**
 * Validates report submission data
 * @param {string} description - Report description text
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validateReportSubmission = (description) => {
  if (!description.trim()) {
    return { isValid: false, error: "Description is required" };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { isValid: false, error: `Max ${MAX_DESCRIPTION_LENGTH} characters allowed` };
  }

  return { isValid: true, error: null };
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ReportModal Component
 * Allows users to report inappropriate videos with categorized reasons
 * Features character limit, auto-filled descriptions, and form validation
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onSubmit - Callback with report data ({ reason, description })
 * @returns {React.ReactElement} Report modal dialog
 */
function ReportModal({ isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  /**
   * Handles reason selection with auto-filled description
   */
  const handleReasonChange = (e) => {
    const reasonId = e.target.value;
    setSelectedReason(reasonId);
    
    // Auto-fill description from predefined reason
    const reasonDescription = getReasonDescription(reasonId);
    setDescription(reasonDescription);
  };

  /**
   * Handles description text input with character limit
   */
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  /**
   * Submits report and closes modal
   */
  const handleSubmitReport = () => {
    const { isValid, error } = validateReportSubmission(description);
    
    if (!isValid) {
      console.error("[ReportModal]", error);
      return;
    }

    onSubmit({ reason: selectedReason, description: description.trim() });
    resetAndClose();
  };

  /**
   * Resets form state and closes modal
   */
  const resetAndClose = () => {
    setSelectedReason("");
    setDescription("");
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={resetAndClose} aria-labelledby="report-modal-title">
      <Box sx={MODAL_STYLE}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 id="report-modal-title" className="text-xl font-semibold text-gray-900">
            Report this Video
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Select Problem Dropdown */}
          <div>
            <label htmlFor="reason-select" className="block text-sm font-semibold text-gray-900 mb-2">
              Select a problem
            </label>
            <div className="relative">
              <select
                id="reason-select"
                value={selectedReason}
                onChange={handleReasonChange}
                className="w-full px-4 py-3 pr-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                aria-label="Select report reason"
              >
                <option value="">Select the issue you want to report</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.id} value={reason.id}>
                    {reason.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-500 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description-textarea" className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description-textarea"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Select a problem to view its details, then you can update or add more details if needed."
              className="w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows="6"
              maxLength={MAX_DESCRIPTION_LENGTH}
              aria-label="Report description"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500" aria-live="polite">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={resetAndClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitReport}
            disabled={!description.trim()}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition cursor-pointer ${
              description.trim()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            type="button"
            aria-label="Submit report"
          >
            Report
          </button>
        </div>
      </Box>
    </Modal>
  );
}

export default ReportModal;
