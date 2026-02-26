import React from 'react';
import { motion } from 'framer-motion';

export default function TaxToggle({ serviceChargePercent, taxPercent, setServiceChargePercent, setTaxPercent }) {
    const scPresets = [0, 5, 10];
    const taxPresets = [0, 6, 7, 8, 10, 11];

    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Service Charge */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-base font-extrabold text-text">
                            Sneaky Service Charge? 🍡
                        </h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">Some restaurants sneak this in</p>
                    </div>
                    <span className="text-2xl font-extrabold text-peach-dark">{serviceChargePercent}%</span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                    {scPresets.map((val) => (
                        <motion.button
                            key={val}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setServiceChargePercent(val)}
                            className={`pill ${serviceChargePercent === val ? 'pill-active' : 'pill-outline'}`}
                        >
                            {val === 0 ? 'Nope!' : `${val}%`}
                        </motion.button>
                    ))}
                    <input
                        type="number"
                        min="0"
                        max="30"
                        value={scPresets.includes(serviceChargePercent) ? '' : serviceChargePercent}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && v >= 0 && v <= 30) setServiceChargePercent(v);
                        }}
                        placeholder="Custom %"
                        className={`pill text-center w-36 ${!scPresets.includes(serviceChargePercent)
                            ? 'pill-active'
                            : 'pill-outline'
                            }`}
                    />
                </div>
            </div>

            {/* Tax */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-base font-extrabold text-text">
                            GST / VAT / SST? 🏦
                        </h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">Government tax on the bill</p>
                    </div>
                    <span className="text-2xl font-extrabold text-lavender">{taxPercent}%</span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                    {taxPresets.map((val) => (
                        <motion.button
                            key={val}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTaxPercent(val)}
                            className={`pill ${taxPercent === val ? 'pill-active' : 'pill-outline'}`}
                        >
                            {val === 0 ? 'None' : `${val}%`}
                        </motion.button>
                    ))}
                    <input
                        type="number"
                        min="0"
                        max="30"
                        value={taxPresets.includes(taxPercent) ? '' : taxPercent}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && v >= 0 && v <= 30) setTaxPercent(v);
                        }}
                        placeholder="Custom %"
                        className={`pill text-center w-36 ${!taxPresets.includes(taxPercent)
                            ? 'pill-active'
                            : 'pill-outline'
                            }`}
                    />
                </div>
            </div>
        </div>
    );
}
