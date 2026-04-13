import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../main.dart';
import '../api/client.dart';
import '../theme.dart';
import 'chat_screen.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  List<Map<String, dynamic>> _chats = [];
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  Future<void> _load() async {
    final api = AppScope.of(context).api;
    if (!api.hasToken) {
      setState(() => _loading = false);
      return;
    }

    try {
      final res = await http.get(
        Uri.parse("${ApiClient.baseUrl}/api/public/chat"),
        headers: api.authHeaders(),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        setState(() {
          _chats = ((body["chats"] as List?) ?? []).cast<Map<String, dynamic>>();
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AppScope.of(context).user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Inbox")),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.chat_bubble_outline, size: 48, color: AppColors.textFaint),
              const SizedBox(height: 12),
              const Text("Log in to see your messages", style: TextStyle(color: AppColors.textMuted)),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: () => Navigator.pushNamed(context, "/login"), child: const Text("Log in")),
            ],
          ),
        ),
      );
    }

    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text("Inbox")),
        body: const Center(child: CircularProgressIndicator(color: AppColors.coral)),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Inbox")),
      body: _chats.isEmpty
          ? const Center(child: Text("No conversations yet", style: TextStyle(color: AppColors.textMuted)))
          : ListView.separated(
              itemCount: _chats.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final chat = _chats[i];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.inputLight,
                    child: Text(
                      (chat["otherPartyName"] as String? ?? "?").substring(0, 1),
                      style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w700),
                    ),
                  ),
                  title: Text(chat["otherPartyName"] as String? ?? "", style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text(chat["lastMessage"] as String? ?? "", maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  trailing: Text(chat["listingTitle"] as String? ?? "", style: const TextStyle(fontSize: 10, color: AppColors.coral)),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(chatId: chat["id"] as String))),
                );
              },
            ),
    );
  }
}
