import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../main.dart';
import '../models/listing.dart';
import '../theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Category> _categories = const [];
  List<ListingCard> _listings = const [];
  String? _activeCategory;
  bool _loading = true;
  String? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  Future<void> _load() async {
    final api = AppScope.of(context).api;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        api.fetchCategories(),
        api.fetchListings(category: _activeCategory),
      ]);
      if (!mounted) return;
      setState(() {
        _categories = results[0] as List<Category>;
        _listings = results[1] as List<ListingCard>;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.toString();
      });
    }
  }

  void _pickCategory(String? slug) {
    setState(() => _activeCategory = slug);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final user = AppScope.of(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const _LogoText(),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline, size: 22),
            onPressed: () => Navigator.pushNamed(context, user == null ? "/login" : "/profile"),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              children: [
                _CategoryPill(label: "All", active: _activeCategory == null, onTap: () => _pickCategory(null)),
                for (final c in _categories)
                  _CategoryPill(
                    label: c.name,
                    active: _activeCategory == c.slug,
                    onTap: () => _pickCategory(c.slug),
                  ),
              ],
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.coral,
        onRefresh: _load,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.coral),
      );
    }
    if (_error != null) {
      return ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 60),
          Text(
            "Couldn't load listings",
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 6),
          Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          const SizedBox(height: 16),
          Center(
            child: OutlinedButton(onPressed: _load, child: const Text("Retry")),
          ),
        ],
      );
    }
    if (_listings.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 120),
          Center(child: Text("No listings yet", style: TextStyle(color: AppColors.textMuted))),
        ],
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      physics: const AlwaysScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.72,
      ),
      itemCount: _listings.length,
      itemBuilder: (_, i) => _ProductCard(item: _listings[i]),
    );
  }
}

class _LogoText extends StatelessWidget {
  const _LogoText();

  @override
  Widget build(BuildContext context) {
    return const Text.rich(
      TextSpan(
        children: [
          TextSpan(text: "Second ", style: TextStyle(color: AppColors.textPrimary)),
          TextSpan(text: "App", style: TextStyle(color: AppColors.coral)),
        ],
      ),
      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: -0.5),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _CategoryPill({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: ActionChip(
        label: Text(label, style: TextStyle(
          color: active ? AppColors.coral : AppColors.textSecondary,
          fontWeight: active ? FontWeight.w600 : FontWeight.w500,
          fontSize: 12,
        )),
        onPressed: onTap,
        backgroundColor: active ? AppColors.coralLight : AppColors.card,
        side: BorderSide(color: active ? AppColors.coralBorder : AppColors.border, width: 1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final ListingCard item;

  const _ProductCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final priceStr = NumberFormat.currency(locale: "en_IN", symbol: "₹", decimalDigits: 0)
        .format((item.price / 100).round());

    return InkWell(
      onTap: () => Navigator.pushNamed(context, "/listing/${item.id}"),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (item.thumbnail != null)
                      CachedNetworkImage(
                        imageUrl: item.thumbnail!,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(color: AppColors.input),
                        errorWidget: (_, __, ___) => Container(
                          color: AppColors.input,
                          child: const Icon(Icons.image_not_supported_outlined, color: AppColors.textFaint),
                        ),
                      )
                    else
                      Container(
                        color: AppColors.input,
                        child: const Icon(Icons.inventory_2_outlined, color: AppColors.textFaint),
                      ),
                    Positioned(
                      left: 6,
                      bottom: 6,
                      child: _Badge(label: item.condition),
                    ),
                    if (item.adminCertified)
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.coral,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: const Text(
                            "CERTIFIED",
                            style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    priceStr,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "${item.location} · ${item.vendorName}",
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  const _Badge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
      ),
    );
  }
}
