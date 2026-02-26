/**
 * Tax Logic Engine for MochiSplit
 * Pro-rates Service Charge and Tax based on each person's share of the subtotal.
 * Ensures sum(personTotal) === grandTotal via rounding adjustment.
 */

export function calculateSettlement(items, friends, billMeta) {
    const { serviceChargePercent = 0, taxPercent = 0 } = billMeta;

    // Calculate billSubtotal from items
    const billSubtotal = items.reduce((sum, item) => sum + item.price, 0);

    if (billSubtotal === 0 || friends.length === 0) {
        return { settlements: [], grandTotal: 0, totalSC: 0, totalTax: 0, billSubtotal: 0 };
    }

    const totalSC = roundTwo(billSubtotal * (serviceChargePercent / 100));
    const totalTax = roundTwo((billSubtotal + totalSC) * (taxPercent / 100));
    const grandTotal = roundTwo(billSubtotal + totalSC + totalTax);

    // Calculate each person's subtotal from assigned items
    const settlements = friends.map((friend) => {
        let personSubtotal = 0;
        const personItems = [];

        items.forEach((item) => {
            if (item.assignedTo.includes(friend.id)) {
                const splitCount = item.assignedTo.length;
                const share = roundTwo(item.price / splitCount);
                personSubtotal += share;
                personItems.push({
                    name: item.name,
                    fullPrice: item.price,
                    share,
                    splitWith: splitCount > 1 ? splitCount : null,
                });
            }
        });

        personSubtotal = roundTwo(personSubtotal);
        const ratio = billSubtotal > 0 ? personSubtotal / billSubtotal : 0;
        const personSC = roundTwo(totalSC * ratio);
        const personTax = roundTwo(totalTax * ratio);
        const personTotal = roundTwo(personSubtotal + personSC + personTax);

        return {
            friend,
            items: personItems,
            subtotal: personSubtotal,
            serviceCharge: personSC,
            tax: personTax,
            total: personTotal,
        };
    });

    // Rounding adjustment: distribute any difference to the last person
    const sumTotals = settlements.reduce((s, p) => s + p.total, 0);
    const diff = roundTwo(grandTotal - sumTotals);
    if (diff !== 0 && settlements.length > 0) {
        const last = settlements[settlements.length - 1];
        last.total = roundTwo(last.total + diff);
    }

    return { settlements, grandTotal, totalSC, totalTax, billSubtotal };
}

export function getAssignmentProgress(items) {
    const total = items.length;
    if (total === 0) return 0;
    const assigned = items.filter((item) => item.assignedTo.length > 0).length;
    return Math.round((assigned / total) * 100);
}

function roundTwo(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}
