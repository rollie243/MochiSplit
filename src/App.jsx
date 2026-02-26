import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import ReceiptUpload from './components/ReceiptUpload';
import ItemEditor from './components/ItemEditor';
import FriendsManager from './components/FriendsManager';
import AssignmentGrid from './components/AssignmentGrid';
import ProgressBar from './components/ProgressBar';
import TaxToggle from './components/TaxToggle';
import SettlementCard from './components/SettlementCard';
import MochiIcon from './components/MochiIcon';
import ScatterDots from './components/ScatterDots';
import { calculateSettlement, getAssignmentProgress, formatCurrency } from './utils/taxEngine';

function App() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState([]);
  const [friends, setFriends] = useState([]);
  const [billMeta, setBillMeta] = useState({
    restaurantName: '',
    serviceChargePercent: 0,
    taxPercent: 0,
    subtotal: 0,
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const resetFlow = () => {
    setStep(1);
    setItems([]);
    setFriends([]);
    setBillMeta({ restaurantName: '', serviceChargePercent: 0, taxPercent: 0, subtotal: 0 });
  };

  const handleItemsExtracted = (result) => {
    setItems(result.items || []);
    setBillMeta({
      restaurantName: result.restaurantName || '',
      serviceChargePercent: result.serviceChargePercent || 10,
      taxPercent: result.taxPercent || 0,
      subtotal: result.subtotal || 0,
    });
    nextStep();
  };

  const progress = getAssignmentProgress(items);
  const { settlements, grandTotal, totalSC, totalTax, billSubtotal } = calculateSettlement(items, friends, billMeta);

  return (
    <div className="min-h-[100dvh] bg-bg font-sans text-text">
      {/* Clean header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && !isProcessing && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={prevStep}
                className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={22} />
              </motion.button>
            )}
            <button onClick={resetFlow} className="flex items-center gap-2">
              <MochiIcon size={28} />
              <h1 className="text-xl font-extrabold text-text">MochiSplit</h1>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && step < 5 && !isProcessing && (
              <div className="flex gap-1.5 items-center mr-1">
                {[2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${step >= s ? 'w-6 bg-dark' : 'w-2 bg-gray-200'
                      }`}
                  />
                ))}
              </div>
            )}

            {step === 5 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetFlow}
                className="btn-secondary !py-2 !px-3 !text-xs !gap-1"
              >
                <RotateCcw size={13} /> New
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto relative min-h-[calc(100dvh-56px)] px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" exit={{ opacity: 0, x: -40 }}>
              <ReceiptUpload
                onItemsExtracted={handleItemsExtracted}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" exit={{ opacity: 0, x: -40 }}>
              <ItemEditor items={items} setItems={setItems} billMeta={billMeta} setBillMeta={setBillMeta} onNext={nextStep} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" exit={{ opacity: 0, x: -40 }}>
              <FriendsManager friends={friends} setFriends={setFriends} onNext={nextStep} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" exit={{ opacity: 0, x: -40 }}>
              {/* Summary bar */}
              <div className="bg-white -mx-4 px-4 py-3.5 border-b border-gray-100 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-text">Grand Total</span>
                  <span className="text-xl font-extrabold text-mint-dark">{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted font-bold mt-0.5">
                  <span>Items: {formatCurrency(billSubtotal)}</span>
                  <span>Tax/SC: {formatCurrency(totalSC + totalTax)}</span>
                </div>
              </div>



              <AssignmentGrid items={items} setItems={setItems} friends={friends} />


              {/* Settle Up button */}
              <AnimatePresence>
                {progress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="fixed bottom-8 left-0 right-0 pointer-events-none z-50 flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={nextStep}
                      className="pointer-events-auto btn-primary !text-lg !py-4 !px-10 shadow-xl"
                    >
                      Time to Settle Up! ✨
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 pb-20 flex flex-col gap-6 relative"
            >
              <ScatterDots />

              {/* Single-line hero */}
              <div className="text-center mb-4 relative z-10">
                <MochiIcon size={56} dancing className="mx-auto mb-3" />
                <h1 className="text-hero text-text leading-tight">
                  All <span className="text-mint-dark">sorted!</span> 🌸
                </h1>

                {/* Totals summary */}
                <div className="mt-5 inline-flex flex-col gap-1 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100">
                  <div className="flex justify-between gap-8 text-sm font-bold">
                    <span className="text-text-muted">Receipt Total</span>
                    <span className="text-text">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm font-bold">
                    <span className="text-text-muted">Assigned Total</span>
                    <span className="text-mint-dark">{formatCurrency(settlements.reduce((s, p) => s + p.total, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Settlement cards */}
              {settlements.map((s) => (
                <SettlementCard
                  key={s.friend.id}
                  settlement={s}
                  restaurantName={billMeta.restaurantName}
                />
              ))}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer */}
        <div className="w-full text-center py-6 mt-4">
          <p className="text-xs font-bold text-text-muted opacity-70">
            Made with curiosity IG:{' '}
            <a
              href="https://www.instagram.com/rolandtey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-peach-dark hover:text-mint-dark transition-colors font-extrabold ml-1"
            >
              rolandtey
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
