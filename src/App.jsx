import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import ReceiptUpload from './components/ReceiptUpload';
import ItemEditor from './components/ItemEditor';
import FriendsManager from './components/FriendsManager';
import AssignmentGrid from './components/AssignmentGrid';
import ProgressBar from './components/ProgressBar';
import TaxToggle from './components/TaxToggle';
import SettlementCard from './components/SettlementCard';
import GroupSummaryCard from './components/GroupSummaryCard';
import MochiIcon from './components/MochiIcon';
import ScatterDots from './components/ScatterDots';
import { calculateSettlement, getAssignmentProgress, formatCurrency } from './utils/taxEngine';

const QUOTES = [
  "People who love to eat are always the best people. 🍡",
  "There is no 'we' in fries. But there's definitely 'us' in Mochi! 🍟",
  "Split the bill, not the friendship! 🌸",
  "Food tastes better when you don't have to pay for all of it. 😉",
  "Good food = Good mood. 🍕",
  "Laughter is brightest where food is best! ✨",
  "Count the memories, not just the calories. 🍛",
  "Families are like fudge - mostly sweet with a few nuts! 🥜"
];

function App() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [randomQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
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

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (step === 5) {
      const duration = 1.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [step]);

  const progress = getAssignmentProgress(items);
  const { settlements, grandTotal, totalSC, totalTax, billSubtotal } = calculateSettlement(items, friends, billMeta);

  return (
    <div className="min-h-[100dvh] bg-bg font-sans text-text">
      {/* Clean header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-[56px] flex items-center relative">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
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

        {/* Top Progress Line */}
        {step > 1 && step < 5 && !isProcessing && (
          <div className="absolute bottom-[-1px] left-0 w-full h-[2px]">
            <motion.div
              className="h-full bg-mint-dark"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="relative min-h-[calc(100dvh-56px)] flex flex-col app-layout">
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
              <div className="bg-white py-3.5 px-4 border-b border-gray-100 mb-4 rounded-b-2xl shadow-sm">
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
                {progress > 0 && (
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
              className="pt-12 pb-20 flex flex-col gap-6 relative"
            >
              <ScatterDots />

              {/* Single-line hero */}
              <div className="text-center mb-4 relative z-10">
                <MochiIcon size={56} dancing className="mx-auto mb-3" />
                <h1 className="text-hero text-text leading-tight">
                  All <span className="text-mint-dark">sorted!</span> 🌸
                </h1>

                {/* Totals summary - Clean single line */}
                <div className="mt-4 flex items-center justify-center gap-3 text-sm font-bold opacity-60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Receipt:</span>
                    <span className="text-text">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Assigned:</span>
                    <span className="text-mint-dark">{formatCurrency(settlements.reduce((s, p) => s + p.total, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Group Summary */}
              <GroupSummaryCard
                settlements={settlements}
                restaurantName={billMeta.restaurantName}
                grandTotal={grandTotal}
              />

              {/* Settlement cards */}
              {settlements.map((s) => (
                <SettlementCard
                  key={s.friend.id}
                  settlement={s}
                  restaurantName={billMeta.restaurantName}
                />
              ))}

              {/* Random fun quote at the bottom of the page */}
              <div className="mt-8 mb-4 text-center px-4">
                <p className="text-xs font-bold text-text-muted italic opacity-60">
                  "{randomQuote}"
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer */}
        <div className="w-full text-center shrink-0 mt-auto pt-16 pb-8">
          <p className="text-xs font-bold text-text-muted opacity-80">
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
