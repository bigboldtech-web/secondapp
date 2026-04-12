// Thin email templates for transactional flows. No HTML templating library —
// just tagged template strings. Keeps the bundle tiny and the copy editable.

import { sendEmail } from "./notifications";

export async function emailOrderPlaced(args: {
  buyerEmail: string;
  buyerName: string;
  productName: string;
  amount: number; // paise
  orderId: string;
}): Promise<void> {
  const price = `₹${Math.round(args.amount / 100).toLocaleString("en-IN")}`;
  void sendEmail({
    to: args.buyerEmail,
    subject: `Order confirmed — ${args.productName}`,
    text: `Hi ${args.buyerName},\n\nYour order for ${args.productName} (${price}) has been placed. Your payment is held securely in escrow until you confirm delivery.\n\nOrder ID: ${args.orderId}\n\nTrack your order: https://gosecond.in/orders/${args.orderId}\n\n— Second App`,
  }).catch(() => {});
}

export async function emailOrderShipped(args: {
  buyerEmail: string;
  buyerName: string;
  productName: string;
  trackingNumber: string | null;
  orderId: string;
}): Promise<void> {
  const tracking = args.trackingNumber ? `\nTracking number: ${args.trackingNumber}` : "";
  void sendEmail({
    to: args.buyerEmail,
    subject: `Your order is on the way — ${args.productName}`,
    text: `Hi ${args.buyerName},\n\nThe seller has shipped your ${args.productName}.${tracking}\n\nPlease confirm delivery once you receive it so the payment can be released to the seller.\n\nTrack: https://gosecond.in/orders/${args.orderId}\n\n— Second App`,
  }).catch(() => {});
}

export async function emailVendorNewOrder(args: {
  vendorEmail: string;
  vendorName: string;
  productName: string;
  amount: number;
  buyerName: string;
}): Promise<void> {
  const price = `₹${Math.round(args.amount / 100).toLocaleString("en-IN")}`;
  void sendEmail({
    to: args.vendorEmail,
    subject: `New order received — ${args.productName}`,
    text: `Hi ${args.vendorName},\n\nYou have a new order!\n\nProduct: ${args.productName}\nAmount: ${price}\nBuyer: ${args.buyerName}\n\nPlease confirm within 24 hours: https://gosecond.in/vendor/orders\n\n— Second App`,
  }).catch(() => {});
}

export async function emailKycApproved(args: {
  vendorEmail: string;
  vendorName: string;
}): Promise<void> {
  void sendEmail({
    to: args.vendorEmail,
    subject: "KYC approved — start selling on Second App",
    text: `Hi ${args.vendorName},\n\nYour vendor account has been verified! You can now list products and start selling.\n\nGo to your dashboard: https://gosecond.in/vendor/dashboard\n\n— Second App`,
  }).catch(() => {});
}

export async function emailKycRejected(args: {
  vendorEmail: string;
  vendorName: string;
}): Promise<void> {
  void sendEmail({
    to: args.vendorEmail,
    subject: "KYC verification update — Second App",
    text: `Hi ${args.vendorName},\n\nYour vendor verification was not approved. Please re-submit with valid documents.\n\nRegister again: https://gosecond.in/vendor/register\n\n— Second App`,
  }).catch(() => {});
}

export async function emailWelcome(args: {
  email: string;
  name: string;
}): Promise<void> {
  void sendEmail({
    to: args.email,
    subject: "Welcome to Second App",
    text: `Hi ${args.name},\n\nWelcome to Second App — India's trusted marketplace for certified pre-owned products.\n\nBrowse listings: https://gosecond.in\nBecome a seller: https://gosecond.in/vendor/register\n\n— Second App`,
  }).catch(() => {});
}

export async function emailDealAlert(args: {
  email: string;
  name: string;
  productName: string;
  price: number;
  listingUrl: string;
}): Promise<void> {
  const priceStr = `₹${Math.round(args.price / 100).toLocaleString("en-IN")}`;
  void sendEmail({
    to: args.email,
    subject: `Deal alert: ${args.productName} at ${priceStr}`,
    text: `Hi ${args.name},\n\nA new listing matches your deal alert!\n\n${args.productName} — ${priceStr}\n\nView it: ${args.listingUrl}\n\n— Second App`,
  }).catch(() => {});
}
