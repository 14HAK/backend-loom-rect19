// ─────────────────────────────────────────────
//  ORDER TOTALS CALCULATOR
//
//  Rules (locked in at Phase 5):
//    Tax Rate      → 15% of itemsPrice
//    Shipping      → FREE if itemsPrice >= $100
//                    $10 flat rate otherwise
//    Total         → itemsPrice + shippingPrice + taxPrice - discount
//
//  All values returned as numbers rounded to
//  2 decimal places.
// ─────────────────────────────────────────────

const TAX_RATE          = 0.15; // 15%
const SHIPPING_COST     = 10;   // $10 flat
const FREE_SHIPPING_MIN = 100;  // free shipping threshold

/**
 * Calculates full order pricing breakdown.
 *
 * @param {Array}  items    - cart items [{ price, qty }]
 * @param {Number} discount - discount amount from coupon (default 0)
 * @returns {{ itemsPrice, shippingPrice, taxPrice, discount, totalPrice }}
 */
const calculateOrderTotals = (items = [], discount = 0) => {
  // Sum of all item prices × quantities
  const itemsPrice = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
  );

  // Free shipping over threshold, else flat rate
  const shippingPrice = itemsPrice >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;

  // 15% tax on items price only (not on shipping)
  const taxPrice = parseFloat((itemsPrice * TAX_RATE).toFixed(2));

  // Ensure discount never exceeds itemsPrice
  const appliedDiscount = parseFloat(
    Math.min(discount, itemsPrice).toFixed(2)
  );

  // Final total
  const totalPrice = parseFloat(
    (itemsPrice + shippingPrice + taxPrice - appliedDiscount).toFixed(2)
  );

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discount: appliedDiscount,
    totalPrice,
  };
};

export default calculateOrderTotals;
