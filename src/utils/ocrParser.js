/**
 * OCR Parser for MochiSplit
 * Extracts item names, prices, subtotal, service charge, and tax from receipt text.
 */

export function parseReceiptText(rawText) {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    const items = [];
    let subtotal = null;
    let serviceChargePercent = null;
    let taxPercent = null;
    let restaurantName = '';

    // Try to extract restaurant name from the first few non-empty lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        const line = lines[i];
        if (line.length > 2 && !hasPricePattern(line)) {
            restaurantName = line;
            break;
        }
    }

    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        // Skip headers, footers, dates, and non-item lines
        if (isSkippableLine(lowerLine)) continue;

        // Detect service charge
        if (lowerLine.includes('service') || lowerLine.includes('svc') || lowerLine.includes('s/c') || lowerLine.includes('srv chg')) {
            const percent = extractPercent(line);
            if (percent) {
                serviceChargePercent = percent;
                continue;
            }
        }

        // Detect tax (GST / VAT / SST)
        if (lowerLine.includes('gst') || lowerLine.includes('vat') || lowerLine.includes('tax') || lowerLine.includes('sst')) {
            const percent = extractPercent(line);
            if (percent) {
                taxPercent = percent;
                continue;
            }
        }

        // Detect subtotal
        if (lowerLine.includes('subtotal') || lowerLine.includes('sub total') || lowerLine.includes('sub-total')) {
            const price = extractPrice(line);
            if (price !== null) {
                subtotal = price;
                continue;
            }
        }

        // Detect total (skip it to avoid adding as item)
        if (/^total/i.test(lowerLine) || lowerLine === 'total' || lowerLine.includes('grand total') || lowerLine.includes('amount due') || lowerLine.includes('balance due')) {
            continue;
        }

        // Try to extract item line (name + price)
        const itemMatch = extractItemLine(line);
        if (itemMatch) {
            items.push({
                id: crypto.randomUUID(),
                name: itemMatch.name,
                price: itemMatch.price,
                assignedTo: [],
            });
        }
    }

    // If no subtotal found, calculate from items
    if (subtotal === null) {
        subtotal = items.reduce((sum, item) => sum + item.price, 0);
    }

    return {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        serviceChargePercent,
        taxPercent,
        restaurantName: cleanRestaurantName(restaurantName),
    };
}

function hasPricePattern(line) {
    return /\d+[.,]\d{2}/.test(line);
}

function extractPrice(line) {
    // Match various price formats: $12.50, 12.50, 12,50, RM 12.50, SGD 12.50
    const matches = line.match(/[$¥₹₱RM SGD IDR THB VND]*\s*(\d+[.,]\d{2})\b/g);
    if (matches && matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const numStr = lastMatch.replace(/[^0-9.,]/g, '').replace(',', '.');
        return parseFloat(numStr);
    }
    return null;
}

function extractPercent(line) {
    const match = line.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) return parseFloat(match[1]);
    // Common SE Asia percentages
    if (line.toLowerCase().includes('10%') || line.toLowerCase().includes('10 %')) return 10;
    return null;
}

function extractItemLine(line) {
    // Pattern: item name followed by quantity and price, or just item name and price
    // Examples: "Nasi Goreng          1   12.50"
    //           "Iced Latte          $5.90"
    //           "2x Tom Yum Soup    25.00"

    const price = extractPrice(line);
    if (price === null || price <= 0) return null;

    // Remove the price part from the end to get the name
    let name = line.replace(/[$¥₹₱RM SGD IDR THB VND]*\s*\d+[.,]\d{2}\s*$/, '').trim();

    // Remove quantity prefix like "2x", "3 x", leading numbers
    name = name.replace(/^\d+\s*[xX×]\s*/, '').trim();

    // Remove trailing quantity indicators
    name = name.replace(/\s+\d+\s*$/, '').trim();

    // Remove trailing dots/dashes used as separator
    name = name.replace(/[\s.\-_]+$/, '').trim();

    if (name.length < 1) return null;

    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return { name, price };
}

function isSkippableLine(line) {
    const skipPatterns = [
        /^date/i, /^time/i, /^table/i, /^server/i, /^cashier/i,
        /^receipt/i, /^invoice/i, /^order/i, /^bill\s*no/i, /^ref/i,
        /^tel/i, /^phone/i, /^fax/i, /^address/i, /^thank/i,
        /^welcome/i, /^have a/i, /^please/i, /^www\./i, /^http/i,
        /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // dates
        /^\d{1,2}:\d{2}/, // times
        /^-{3,}/, /^={3,}/, /^\*{3,}/, // separators
        /^qty/i, /^item/i, /^description/i, /^amount/i, /^price/i,
        /^cash/i, /^change/i, /^card/i, /^visa/i, /^master/i,
        /^payment/i, /^tender/i, /^rounding/i, /^discount/i,
    ];
    return skipPatterns.some((p) => p.test(line));
}

function cleanRestaurantName(name) {
    return name
        .replace(/[^a-zA-Z0-9\s&'.\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50);
}
