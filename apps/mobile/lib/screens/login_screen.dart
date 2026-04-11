import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../api/client.dart';
import '../main.dart';
import '../theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  bool _awaitingOtp = false;
  bool _loading = false;
  bool _devMode = false;
  String? _error;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final api = AppScope.of(context).api;
    final res = await api.sendOtp(_phoneCtrl.text);
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.ok) {
        _awaitingOtp = true;
        _devMode = res.devMode;
      } else {
        _error = res.error;
      }
    });
  }

  Future<void> _verifyOtp() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final scope = AppScope.of(context);
    try {
      final user = await scope.api.verifyOtp(_phoneCtrl.text, _otpCtrl.text);
      if (!mounted) return;
      scope.setUser(user);
      Navigator.of(context).pushNamedAndRemoveUntil("/", (_) => false);
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
      appBar: AppBar(title: const Text("Sign in")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            Text(
              _awaitingOtp ? "Enter the code we texted you" : "Welcome back",
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            Text(
              _awaitingOtp
                  ? "Sent to +91 ${_phoneCtrl.text}"
                  : "Enter your phone number to continue",
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 24),
            if (!_awaitingOtp) ...[
              TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                decoration: const InputDecoration(
                  prefixText: "+91  ",
                  labelText: "Phone number",
                  hintText: "10-digit number",
                ),
              ),
            ] else ...[
              TextField(
                controller: _otpCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: const InputDecoration(labelText: "OTP"),
              ),
              if (_devMode)
                const Padding(
                  padding: EdgeInsets.only(top: 6),
                  child: Text(
                    "Dev mode — OTP printed to the server console.",
                    style: TextStyle(color: Color(0xFF92400E), fontSize: 11),
                  ),
                ),
            ],
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(_error!, style: const TextStyle(color: Color(0xFF7F1D1D), fontSize: 12)),
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading
                  ? null
                  : _awaitingOtp
                      ? (_otpCtrl.text.length == 6 ? _verifyOtp : null)
                      : (_phoneCtrl.text.length == 10 ? _sendOtp : null),
              child: Text(_loading ? "Please wait…" : _awaitingOtp ? "Verify & sign in" : "Send OTP"),
            ),
            if (_awaitingOtp)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: TextButton(
                  onPressed: _loading ? null : () => setState(() {
                        _awaitingOtp = false;
                        _otpCtrl.clear();
                      }),
                  child: const Text("Use a different number", style: TextStyle(color: AppColors.textMuted)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
