'use client'

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, url, username }) => {
  const canvasRef = useRef(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) {
            console.error('Error generating QR code:', error);
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [isOpen, url]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `${username}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Card QR Code</h3>
        <p className="text-sm text-gray-600 mb-6">
          Share this QR code so others can view your digital card
        </p>

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-blue-900 mb-1">Card URL:</p>
          <p className="text-sm text-blue-700 break-all">{url}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!qrGenerated}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
