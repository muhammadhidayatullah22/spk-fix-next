import { useState } from 'react';

interface UseDeleteProps {
  onSuccess?: (id: number) => void;
  onError?: (error: string) => void;
  confirmMessage?: string;
}

interface UseDeleteReturn {
  isDeleting: boolean;
  deleteItem: (id: number, endpoint: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useDelete({
  onSuccess,
  onError,
}: UseDeleteProps = {}): UseDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = async (id: number, endpoint: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus item');
      }

      onSuccess?.(id);
    } catch (err: any) {
      const errorMessage = err.message || 'Terjadi kesalahan saat menghapus item';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isDeleting,
    deleteItem,
    error,
    clearError,
  };
}

// Hook untuk menangani delete modal state
interface UseDeleteModalProps {
  onDelete: (id: number) => Promise<void>;
  getItemName?: (item: any) => string;
}

interface UseDeleteModalReturn {
  isModalOpen: boolean;
  isDeleting: boolean;
  itemToDelete: any;
  openDeleteModal: (item: any) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  error: string | null;
}

export function useDeleteModal({
  onDelete,
  getItemName,
}: UseDeleteModalProps): UseDeleteModalReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const openDeleteModal = (item: any) => {
    setItemToDelete(item);
    setIsModalOpen(true);
    setError(null);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setItemToDelete(null);
      setError(null);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(itemToDelete.ID);
      setIsModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus item');
    } finally {
      setIsDeleting(false);
    }
  };

  const itemName = itemToDelete && getItemName ? getItemName(itemToDelete) : undefined;

  return {
    isModalOpen,
    isDeleting,
    itemToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    error,
    itemName,
  } as UseDeleteModalReturn & { itemName?: string };
}
