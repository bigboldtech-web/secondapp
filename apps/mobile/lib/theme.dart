import 'package:flutter/material.dart';

/// Color tokens and typography, mirroring apps/web/app/globals.css.
/// Monochrome surface with a single warm-coral accent.
class AppColors {
  static const Color coral = Color(0xFFE8553D);
  static const Color coralLight = Color(0xFFFDF4F3);
  static const Color coralBorder = Color(0xFFF0D0CA);

  static const Color bg = Color(0xFFFAFAFA);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFEEEEEE);

  static const Color textPrimary = Color(0xFF222222);
  static const Color textSecondary = Color(0xFF555555);
  static const Color textMuted = Color(0xFF999999);
  static const Color textFaint = Color(0xFFBBBBBB);

  static const Color input = Color(0xFFF0F0F0);
  static const Color inputLight = Color(0xFFF5F5F5);
}

ThemeData buildTheme() {
  final base = ThemeData.light();
  return base.copyWith(
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: base.colorScheme.copyWith(
      primary: AppColors.coral,
      secondary: AppColors.coral,
      surface: AppColors.card,
      onSurface: AppColors.textPrimary,
    ),
    textTheme: base.textTheme.apply(
      bodyColor: AppColors.textPrimary,
      displayColor: AppColors.textPrimary,
      fontFamily: null, // use system font (matches web: -apple-system, Segoe UI, Roboto)
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.card,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: TextStyle(
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.3,
      ),
      iconTheme: IconThemeData(color: AppColors.textPrimary),
    ),
    cardTheme: const CardTheme(
      color: AppColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
        side: BorderSide(color: AppColors.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.coral, width: 1.5),
      ),
      labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.coral,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textPrimary,
        side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
  );
}
