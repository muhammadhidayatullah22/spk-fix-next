'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface RelatedData {
  type: string;
  count: number;
  description: string;
}

interface AdvancedDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning';
  relatedData?: RelatedData[];
  checkRelatedData?: () => Promise<RelatedData[]>;
}

const AdvancedDeleteModal: React.FC<AdvancedDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  itemName,
  loading = false,
  variant = 'danger',
  relatedData = [],
  checkRelatedData,
}) => {
  const [isCheckingRelated, setIsCheckingRelated] = useState(false);
  const [relatedInfo, setRelatedInfo] = useState<RelatedData[]>(relatedData);

  useEffect(() => {
    if (isOpen && checkRelatedData) {
      setIsCheckingRelated(true);
      checkRelatedData()
        .then(setRelatedInfo)
        .catch(() => setRelatedInfo([]))
        .finally(() => setIsCheckingRelated(false));
    }
  }, [isOpen, checkRelatedData]);

  if (!isOpen) return null;

  const hasRelatedData = relatedInfo.length > 0;
  const totalRelatedItems = relatedInfo.reduce((sum, item) => sum + item.count, 0);

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
    }
  };

  const styles = getVariantStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform scale-95 animate-scale-in border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center mr-4`}>
              <svg 
                className={`w-6 h-6 ${styles.iconColor}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Main Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus {itemName ? `"${itemName}"` : 'item ini'}?
            </p>
          </div>

          {/* Related Data Check */}
          {isCheckingRelated ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-blue-700">Memeriksa data terkait...</span>
              </div>
            </div>
          ) : hasRelatedData ? (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    ⚠️ Data Terkait Akan Ikut Terhapus
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Menghapus item ini akan menghapus <strong>{totalRelatedItems} data terkait</strong>:
                  </p>
                  <ul className="space-y-1">
                    {relatedInfo.map((item, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></span>
                        <span className="font-medium">{item.count}</span>
                        <span className="ml-1">{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Warning */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-600">
                <strong>Perhatian:</strong> Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                {hasRelatedData && ' Semua data terkait akan ikut terhapus.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading || isCheckingRelated}
              className="min-w-[80px]"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              loading={loading}
              disabled={loading || isCheckingRelated}
              className={`min-w-[120px] text-white ${styles.buttonColor}`}
              icon={
                !loading ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : undefined
              }
            >
              {loading ? 'Menghapus...' : hasRelatedData ? `Hapus Semua (${totalRelatedItems + 1})` : 'Hapus'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDeleteModal;
