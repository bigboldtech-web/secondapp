import 'package:flutter/material.dart';

import '../main.dart';
import '../models/listing.dart';
import '../theme.dart';
import 'home_screen.dart';

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  @override
  Widget build(BuildContext context) {
    final user = AppScope.of(context).user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Saved")),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.favorite_border, size: 48, color: AppColors.textFaint),
              const SizedBox(height: 12),
              const Text("Log in to see your saved items", style: TextStyle(color: AppColors.textMuted)),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, "/login"),
                child: const Text("Log in"),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Saved items")),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.favorite, size: 48, color: AppColors.coral),
              SizedBox(height: 12),
              Text(
                "Your wishlist syncs with the web",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              ),
              SizedBox(height: 4),
              Text(
                "Items you save on the website appear here. Tap the heart on any listing to save it.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
