import React, { useState } from 'react';
import { CreditCard, AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';

/**
 * Dedicated DEMO Payment Modal
 * Displayed when live Razorpay API keys are not present.
 * Clearly labelled: "Demo Payment — No real money will be charged."
 * Sets payment_mode = 'DEMO' in database records.
 */
export default function RazorpayDemoModal({ isOpen, onClose, orderDetails, onDemoPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      await onDemoPaymentSuccess({
        razorpay_order_id: orderDetails.razorpay_order_id || 'demo_rzp_ord_' + Date.now(),
        razorpay_payment_id: 'demo_rzp_pay_' + Date.now(),
        razorpay_signature: 'demo_sig_' + Date.now(),
        payment_method: 'upi_demo',
        payment_mode: 'DEMO'
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden text-left space-y-0">
        
        {/* Header Strip */}
        <div className="bg-amber-500 text-slate-950 p-4 px-6 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="font-extrabold tracking-wide uppercase">DEMO PAYMENT MODE</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-950 hover:bg-amber-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed space-y-1">
            <p className="font-extrabold text-amber-950">Demo Payment — No real money will be charged.</p>
            <p className="text-[11px] text-amber-800 font-medium">
              Live Razorpay API keys (`VITE_RAZORPAY_KEY_ID`) are not set in environment variables. This order will be recorded in database with <strong className="font-black">payment_mode = DEMO</strong>.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Order Reference:</span>
              <span className="font-bold text-purple-950">{orderDetails.order_code || 'HEX-ORD-DEMO'}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Patient Name:</span>
              <span className="font-bold text-slate-900">{orderDetails.customer_name}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Phone Number:</span>
              <span className="font-bold text-slate-900">{orderDetails.customer_phone}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900">Total Demo Payable:</span>
              <span className="text-xl font-black text-purple-900">₹{orderDetails.total_amount}</span>
            </div>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-950 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Demo Payment...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Complete Demo Payment (₹{orderDetails.total_amount})
              </span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Health Express Transaction System • Mode: DEMO</span>
          </div>
        </div>

      </div>
    </div>
  );
}
