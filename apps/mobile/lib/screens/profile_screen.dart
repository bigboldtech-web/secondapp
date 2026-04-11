import 'package:flutter/material.dart';

import '../main.dart';
import '../theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    final user = scope.user;

    if (user == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed("/login");
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.coral)));
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Profile")),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: CircleAvatar(
              radius: 36,
              backgroundColor: AppColors.coralLight,
              child: Text(
                user.name.isNotEmpty ? user.name.substring(0, 1).toUpperCase() : "?",
                style: const TextStyle(color: AppColors.coral, fontSize: 26, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(user.name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          ),
          const SizedBox(height: 2),
          Center(
            child: Text("+91 ${user.phone ?? ""}",
                style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
          ),
          const SizedBox(height: 24),
          _Section(
            title: "Account",
            children: [
              _Row(label: "Role", value: user.role),
              if (user.email != null) _Row(label: "Email", value: user.email!),
              if (user.locationCity != null) _Row(label: "City", value: user.locationCity!),
            ],
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout, size: 16),
            label: const Text("Sign out"),
            onPressed: () async {
              await scope.api.clearToken();
              scope.setUser(null);
              if (!context.mounted) return;
              Navigator.of(context).pushNamedAndRemoveUntil("/", (_) => false);
            },
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _Section({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          ...children,
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
