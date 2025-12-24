'use client'

import { X } from 'lucide-react';
import { PaymentPlansGrid } from './PaystackPayment';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-5xl w-full mx-4 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
          <p className="text-gray-600">
            Select the perfect plan for your digital business card needs
          </p>
        </div>

        <PaymentPlansGrid 
          onPlanSelect={(plan, data) => {
            onPaymentSuccess(plan, data);
          }} 
        />
      </div>
    </div>
  );
};

export default PaymentModal;
