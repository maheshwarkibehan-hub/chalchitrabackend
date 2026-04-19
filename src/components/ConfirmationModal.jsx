import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

/**
 * Modal styling configuration
 * Centers the modal dialog with responsive width
 */
const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxWidth: "90%",
  bgcolor: "background.paper",
  boxShadow: 20,
  borderRadius: 3,
  p: 4,
};

/**
 * Button styles for cancel and confirm actions
 */
const BUTTON_STYLES = {
  cancel:
    "px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed",
  confirm:
    "px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed",
};

/**
 * CancelButton - Reusable cancel button component
 */
function CancelButton({ onClick, isDisabled, text }) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`cursor-pointer ${BUTTON_STYLES.cancel}`}
    >
      {text}
    </button>
  );
}

/**
 * ConfirmButton - Reusable confirm button component
 */
function ConfirmButton({ onClick, isDisabled, text, isLoading }) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`cursor-pointer ${BUTTON_STYLES.confirm}`}
    >
      {isLoading ? "Processing..." : text}
    </button>
  );
}

/**
 * ModalHeader - Header section with title and message
 */
function ModalHeader({ title, message }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

/**
 * ModalActions - Footer section with action buttons
 */
function ModalActions({
  onCancel,
  onConfirm,
  isLoading,
  cancelLabel,
  confirmLabel,
}) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <CancelButton onClick={onCancel} isDisabled={isLoading} text={cancelLabel} />
      <ConfirmButton
        onClick={onConfirm}
        isDisabled={isLoading}
        text={confirmLabel}
        isLoading={isLoading}
      />
    </div>
  );
}

/**
 * ConfirmationModal Component
 *
 * Reusable confirmation dialog for destructive or important actions
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when cancel button clicked or modal closed
 * @param {function} onConfirm - Called when confirm button clicked
 * @param {string} title - Modal title text
 * @param {string} message - Optional description text
 * @param {string} cancelLabel - Cancel button text (default: "Cancel")
 * @param {string} confirmLabel - Confirm button text (default: "OK")
 * @param {boolean} isLoading - Shows loading state and disables buttons
 */
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "",
  cancelLabel = "Cancel",
  confirmLabel = "OK",
  isLoading = false,
}) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={MODAL_STYLE}>
        <div className="space-y-4">
          <ModalHeader title={title} message={message} />
          <ModalActions
            onCancel={onClose}
            onConfirm={onConfirm}
            isLoading={isLoading}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
          />
        </div>
      </Box>
    </Modal>
  );
}

export default ConfirmationModal;
