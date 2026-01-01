# SweetAlert2 Integration with Tailwind CSS

## Installation

First, install SweetAlert2:

```bash
npm install sweetalert2
```

## Features Implemented

✅ **SweetAlert2 Integration** - All modals replaced with SweetAlert
✅ **Background Blur** - Automatic blur effect when modals are open
✅ **Tailwind CSS Styling** - All modals use Tailwind classes
✅ **Dark Mode Support** - Automatically adapts to theme
✅ **Responsive Design** - Works on all screen sizes

## Files Created/Modified

### New Files:
- `src/utils/sweetalert.ts` - SweetAlert utility with blur functionality
- `src/styles/sweetalert.css` - Tailwind-based styles for SweetAlert

### Modified Files:
- `src/App.css` - Added SweetAlert CSS import
- `src/components/ApprovalModal.tsx` - Replaced with SweetAlert
- `src/components/NotificationModal.tsx` - Replaced with SweetAlert
- `src/pages/BlogPostDetail.tsx` - Replaced window.confirm with SweetAlert
- `src/dashboardUi/CreateNewPost.tsx` - Replaced window.confirm with SweetAlert

## Usage Examples

### Success Alert
```typescript
import { showSuccess } from "../utils/sweetalert";

showSuccess("Success!", "Operation completed successfully!");
```

### Error Alert
```typescript
import { showError } from "../utils/sweetalert";

showError("Error!", "Something went wrong.");
```

### Confirmation Dialog
```typescript
import { showConfirm } from "../utils/sweetalert";

showConfirm("Are you sure?", "This action cannot be undone.", {
  confirmText: "Yes",
  cancelText: "No",
  confirmColor: "error",
  onConfirm: () => {
    // Handle confirmation
  },
});
```

### Delete Confirmation
```typescript
import { showDeleteConfirm } from "../utils/sweetalert";

showDeleteConfirm("Item Name", () => {
  // Handle delete
});
```

## Background Blur

The background automatically blurs when any SweetAlert modal is open:
- Applies `blur-sm` class to body and App container
- Removes blur when modal closes
- Smooth transitions with Tailwind classes

## Styling

All modals use Tailwind CSS classes:
- `btn btn-primary` for confirm buttons
- `btn btn-ghost` for cancel buttons
- `rounded-lg` for rounded corners
- `bg-base-100` for background
- `text-base-content` for text

## Customization

You can customize modals by passing options:

```typescript
showSuccess("Title", "Message", {
  customClass: {
    confirmButton: "btn btn-custom-class",
  },
  timer: 3000,
  timerProgressBar: true,
});
```

