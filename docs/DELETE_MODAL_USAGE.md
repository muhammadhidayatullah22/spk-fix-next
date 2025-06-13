# Delete Modal Usage Guide

## Overview

Komponen DeleteModal dan ConfirmationModal menyediakan cara yang elegant dan user-friendly untuk menangani konfirmasi delete dan aksi lainnya dalam aplikasi.

## Components

### 1. DeleteModal

Modal khusus untuk konfirmasi delete dengan styling dan pesan yang sesuai.

### 2. AdvancedDeleteModal

Modal delete dengan fitur advanced seperti pengecekan data terkait dan cascade delete warning.

### 3. ConfirmationModal

Modal umum untuk berbagai jenis konfirmasi dengan berbagai variant.

### 4. useDeleteModal Hook

Custom hook untuk menangani state dan logic delete modal.

## Basic Usage

### DeleteModal dengan useDeleteModal Hook

```tsx
import { DeleteModal } from "@/components";
import { useDeleteModal } from "@/hooks";
import { API_ENDPOINTS, MESSAGES } from "@/lib/constants";

function MyComponent() {
  const {
    isModalOpen: isDeleteModalOpen,
    isDeleting,
    itemToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    error: deleteError,
  } = useDeleteModal({
    onDelete: async (id: number) => {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus item");
      }

      // Refresh data after successful delete
      fetchData();
    },
    getItemName: (item) => item.NAMA, // Function to get display name
  });

  return (
    <>
      {/* Delete Button */}
      <button onClick={() => openDeleteModal(item)}>Hapus</button>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Hapus Pengguna"
        itemName={itemToDelete?.NAMA}
        message={`Apakah Anda yakin ingin menghapus "${itemToDelete?.NAMA}"?`}
      />

      {/* Error handling */}
      {deleteError && <Alert type="error" message={deleteError} />}
    </>
  );
}
```

### ConfirmationModal untuk Aksi Lain

```tsx
import { ConfirmationModal } from "@/components";
import { useState } from "react";

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Perform action
      await performAction();
      setShowConfirm(false);
    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Reset Data</button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        loading={isProcessing}
        variant="warning"
        title="Reset Data"
        message="Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Reset"
        cancelText="Batal"
      />
    </>
  );
}
```

## Props Reference

### DeleteModal Props

| Prop      | Type                  | Default            | Description                   |
| --------- | --------------------- | ------------------ | ----------------------------- |
| isOpen    | boolean               | -                  | Whether modal is open         |
| onClose   | function              | -                  | Function to close modal       |
| onConfirm | function              | -                  | Function to confirm delete    |
| title     | string                | 'Konfirmasi Hapus' | Modal title                   |
| message   | string                | auto-generated     | Custom message                |
| itemName  | string                | -                  | Name of item being deleted    |
| loading   | boolean               | false              | Whether delete is in progress |
| variant   | 'danger' \| 'warning' | 'danger'           | Visual variant                |

### ConfirmationModal Props

| Prop        | Type                                         | Default                | Description                   |
| ----------- | -------------------------------------------- | ---------------------- | ----------------------------- |
| isOpen      | boolean                                      | -                      | Whether modal is open         |
| onClose     | function                                     | -                      | Function to close modal       |
| onConfirm   | function                                     | -                      | Function to confirm action    |
| title       | string                                       | 'Konfirmasi'           | Modal title                   |
| message     | string                                       | 'Apakah Anda yakin...' | Confirmation message          |
| confirmText | string                                       | 'Ya, Lanjutkan'        | Confirm button text           |
| cancelText  | string                                       | 'Batal'                | Cancel button text            |
| loading     | boolean                                      | false                  | Whether action is in progress |
| variant     | 'danger' \| 'warning' \| 'info' \| 'success' | 'info'                 | Visual variant                |
| icon        | ReactNode                                    | auto                   | Custom icon                   |

### useDeleteModal Hook

```tsx
const {
  isModalOpen, // boolean - modal open state
  isDeleting, // boolean - delete in progress
  itemToDelete, // any - item being deleted
  openDeleteModal, // (item) => void - open modal with item
  closeDeleteModal, // () => void - close modal
  confirmDelete, // () => Promise<void> - confirm delete
  error, // string | null - delete error
} = useDeleteModal({
  onDelete: async (id: number) => {
    // Delete implementation
  },
  getItemName: (item) => item.name, // Optional: get display name
});
```

## Examples

### 1. User Delete

```tsx
const userDeleteModal = useDeleteModal({
  onDelete: async (id: number) => {
    await fetch(`/api/user/${id}`, { method: "DELETE" });
    refreshUsers();
  },
  getItemName: (user) => user.NAMA,
});

<DeleteModal
  isOpen={userDeleteModal.isModalOpen}
  onClose={userDeleteModal.closeDeleteModal}
  onConfirm={userDeleteModal.confirmDelete}
  loading={userDeleteModal.isDeleting}
  title="Hapus Pengguna"
  itemName={userDeleteModal.itemToDelete?.NAMA}
  message={`Menghapus pengguna "${userDeleteModal.itemToDelete?.NAMA}" akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.`}
/>;
```

### 2. Bulk Delete Confirmation

```tsx
<ConfirmationModal
  isOpen={showBulkDelete}
  onClose={() => setShowBulkDelete(false)}
  onConfirm={handleBulkDelete}
  loading={isBulkDeleting}
  variant="danger"
  title="Hapus Multiple Items"
  message={`Apakah Anda yakin ingin menghapus ${selectedItems.length} item yang dipilih?`}
  confirmText={`Ya, Hapus ${selectedItems.length} Item`}
  icon={
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  }
/>
```

### 3. Data Export Confirmation

```tsx
<ConfirmationModal
  isOpen={showExportConfirm}
  onClose={() => setShowExportConfirm(false)}
  onConfirm={handleExport}
  loading={isExporting}
  variant="info"
  title="Export Data"
  message="Data akan diekspor dalam format Excel. Proses ini mungkin memakan waktu beberapa menit."
  confirmText="Ya, Export"
  icon={
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  }
/>
```

## Best Practices

1. **Always provide meaningful messages** - Explain what will happen and that it's irreversible
2. **Use appropriate variants** - danger for destructive actions, warning for potentially harmful actions
3. **Handle loading states** - Show loading during async operations
4. **Provide error feedback** - Display errors from failed operations
5. **Use descriptive button text** - Make it clear what action will be performed
6. **Include item names** - Help users confirm they're deleting the right item

## Styling

The modals use Tailwind CSS classes and support:

- Responsive design
- Dark mode (if implemented)
- Animation (fade-in, scale-in)
- Focus management
- Keyboard navigation (ESC to close)

### 4. AdvancedDeleteModal dengan Cascade Delete

```tsx
import { AdvancedDeleteModal } from "@/components";

function KriteriaPage() {
  const [showAdvancedDelete, setShowAdvancedDelete] = useState(false);
  const [selectedKriteria, setSelectedKriteria] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const checkRelatedData = async () => {
    const response = await fetch(
      `/api/kriteria/${selectedKriteria.ID}/related`
    );
    const data = await response.json();
    return [
      {
        type: "penilaian",
        count: data.penilaianCount,
        description: "data penilaian siswa",
      },
      {
        type: "results",
        count: data.resultsCount,
        description: "hasil perhitungan SAW",
      },
    ];
  };

  const handleAdvancedDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/kriteria/${selectedKriteria.ID}`, {
        method: "DELETE",
      });
      setShowAdvancedDelete(false);
      refreshData();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setSelectedKriteria(kriteria);
          setShowAdvancedDelete(true);
        }}
      >
        Hapus Kriteria
      </button>

      <AdvancedDeleteModal
        isOpen={showAdvancedDelete}
        onClose={() => setShowAdvancedDelete(false)}
        onConfirm={handleAdvancedDelete}
        loading={isDeleting}
        title="Hapus Kriteria"
        itemName={selectedKriteria?.NAMA}
        checkRelatedData={checkRelatedData}
        variant="danger"
      />
    </>
  );
}
```

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support
