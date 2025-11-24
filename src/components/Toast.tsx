import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div
        className={`${
          type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
        } border-l-4 p-4 rounded-lg shadow-lg max-w-md`}
      >
        <div className="flex items-start">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
          )}
          <p
            className={`ml-3 text-sm ${
              type === 'success' ? 'text-green-800' : 'text-red-800'
            } flex-1`}
          >
            {message}
          </p>
          <button
            onClick={onClose}
            className={`ml-3 ${
              type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
