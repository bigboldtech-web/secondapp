import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../main.dart';
import '../models/listing.dart';
import '../theme.dart';

class CheckoutScreen extends StatefulWidget {
  final ListingDetail listing;

  const CheckoutScreen({super.key, required this.listing});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  String _payment = "upi";
  bool _placing = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _pincodeCtrl.dispose();
    super.dispose();
  }

  String _formatPrice(int paise) {
    return NumberFormat.currency(locale: "en_IN", symbol: "₹", decimalDigits: 0)
        .format((paise / 100).round());
  }

  bool get _formValid =>
      _nameCtrl.text.trim().isNotEmpty &&
      _phoneCtrl.text.length == 10 &&
      _addressCtrl.text.trim().isNotEmpty &&
      _cityCtrl.text.trim().isNotEmpty &&
      _pincodeCtrl.text.length == 6;

  Future<void> _placeOrder() async {
    setState(() => _placing = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Checkout is available on the web for now. Opening...")),
    );
    setState(() => _placing = false);
  }

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;
    final deliveryFee = listing.price > 5000000 ? 0 : 9900;
    final total = listing.price + deliveryFee;

    return Scaffold(
      appBar: AppBar(title: const Text("Checkout", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.card,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(color: AppColors.input, borderRadius: BorderRadius.circular(8)),
                  child: listing.photos.isNotEmpty
                      ? ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(listing.photos.first, fit: BoxFit.cover))
                      : const Icon(Icons.inventory_2_outlined, color: AppColors.textFaint),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(listing.product.displayName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(_formatPrice(listing.price), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.coral)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text("Delivery address", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: "Full name")),
          const SizedBox(height: 8),
          TextField(controller: _phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: "Phone", prefixText: "+91 ")),
          const SizedBox(height: 8),
          TextField(controller: _addressCtrl, decoration: const InputDecoration(labelText: "Address"), maxLines: 2),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: TextField(controller: _cityCtrl, decoration: const InputDecoration(labelText: "City"))),
              const SizedBox(width: 8),
              Expanded(child: TextField(controller: _pincodeCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: "PIN code"))),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.card,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                _Row("Price", _formatPrice(listing.price)),
                _Row("Delivery", deliveryFee == 0 ? "FREE" : _formatPrice(deliveryFee)),
                const Divider(),
                _Row("Total", _formatPrice(total), bold: true),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Icon(Icons.shield_outlined, size: 14, color: Color(0xFF166534)),
                SizedBox(width: 6),
                Expanded(child: Text("Payment protected by escrow", style: TextStyle(fontSize: 11, color: Color(0xFF166534), fontWeight: FontWeight.w600))),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _formValid && !_placing ? _placeOrder : null,
            child: Text(_placing ? "Placing order…" : "Place order · ${_formatPrice(total)}"),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  const _Row(this.label, this.value, {this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: bold ? AppColors.textPrimary : AppColors.textSecondary, fontWeight: bold ? FontWeight.w700 : FontWeight.w400)),
          Text(value, style: TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: bold ? FontWeight.w700 : FontWeight.w500)),
        ],
      ),
    );
  }
}
