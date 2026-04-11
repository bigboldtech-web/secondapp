import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../api/client.dart';
import '../main.dart';
import '../models/listing.dart';
import '../theme.dart';

class ListingDetailScreen extends StatefulWidget {
  final String listingId;

  const ListingDetailScreen({super.key, required this.listingId});

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  ListingDetail? _listing;
  bool _loading = true;
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  Future<void> _load() async {
    final api = AppScope.of(context).api;
    try {
      final l = await api.fetchListing(widget.listingId);
      if (!mounted) return;
      setState(() {
        _listing = l;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_listing?.product.displayName ?? "Listing",
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.coral));
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textMuted)),
        ),
      );
    }
    final listing = _listing!;
    final priceStr = NumberFormat.currency(locale: "en_IN", symbol: "₹", decimalDigits: 0)
        .format((listing.price / 100).round());
    final originalStr = listing.originalPrice != null
        ? NumberFormat.currency(locale: "en_IN", symbol: "₹", decimalDigits: 0)
            .format((listing.originalPrice! / 100).round())
        : null;
    final discount = listing.originalPrice != null && listing.originalPrice! > listing.price
        ? ((listing.originalPrice! - listing.price) / listing.originalPrice! * 100).round()
        : null;

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        if (listing.photos.isNotEmpty)
          AspectRatio(
            aspectRatio: 4 / 3,
            child: PageView(
              children: [
                for (final url in listing.photos)
                  CachedNetworkImage(
                    imageUrl: url,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(color: AppColors.input),
                    errorWidget: (_, __, ___) => Container(
                      color: AppColors.input,
                      child: const Icon(Icons.image_not_supported_outlined, color: AppColors.textFaint, size: 48),
                    ),
                  ),
              ],
            ),
          )
        else
          Container(
            height: 220,
            color: AppColors.input,
            child: const Center(
              child: Icon(Icons.inventory_2_outlined, color: AppColors.textFaint, size: 48),
            ),
          ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(priceStr, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  if (originalStr != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      originalStr,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                  ],
                ],
              ),
              if (discount != null)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      "$discount% off",
                      style: const TextStyle(color: Color(0xFF166534), fontSize: 11, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              Text(listing.product.displayName,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 2),
              Text(
                "${listing.product.categoryName} · ${listing.product.brandName} · ${listing.condition}",
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),
              _SectionTitle("Specifications"),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (final entry in listing.specs.entries)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.inputLight,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        "${entry.key}: ${entry.value}",
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                      ),
                    ),
                ],
              ),
              if (listing.description != null && listing.description!.isNotEmpty) ...[
                const SizedBox(height: 16),
                _SectionTitle("Description"),
                const SizedBox(height: 6),
                Text(
                  listing.description!,
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                ),
              ],
              const SizedBox(height: 16),
              _SectionTitle("Seller"),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.inputLight,
                      child: Text(
                        listing.vendor.storeName.substring(0, 1),
                        style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(listing.vendor.storeName,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          Text(
                            "${listing.vendor.ratingAvg.toStringAsFixed(1)} ★ · ${listing.vendor.totalSales} sales · ${listing.vendor.locationCity ?? "India"}",
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.chat_bubble_outline, size: 16),
                  label: const Text("Ask the seller"),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Chat is available on the web for now.")),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary));
  }
}
