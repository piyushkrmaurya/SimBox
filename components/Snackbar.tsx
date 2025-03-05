import React, { useEffect } from 'react';

interface SnackbarProps {
    message: string;
    open: boolean;
    onClose: () => void;
    autoHideDuration?: number;
    type?: 'success' | 'error' | 'info';
}

const getBgColor = (type: string) => {
    switch (type) {
        case 'success': return '#43a047';
        case 'error': return '#d32f2f';
        case 'info': return '#1976d2';
        default: return '#323232';
    }
};

const Snackbar: React.FC<SnackbarProps> = ({ message, open, onClose, type, autoHideDuration = 3000 }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [open, autoHideDuration, onClose]);

    if (!open) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: getBgColor(type || 'info'),
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 9999,
            minWidth: 200,
            textAlign: 'center',
            fontSize: 18,
            transition: 'opacity 0.3s',
        }}>
            {message}
            <button
                onClick={onClose}
                style={{
                    marginLeft: 16,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 24,
                }}
                aria-label="Close"
            >
                ×
            </button>
        </div>
    );
};

export default Snackbar;