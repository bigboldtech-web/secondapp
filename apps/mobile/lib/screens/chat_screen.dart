import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../main.dart';
import '../api/client.dart';
import '../theme.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  const ChatScreen({super.key, required this.chatId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  Map<String, dynamic>? _chatInfo;
  bool _loading = true;
  bool _sending = false;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _load();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) => _poll());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final api = AppScope.of(context).api;
    final res = await http.get(
      Uri.parse("${ApiClient.baseUrl}/api/public/chat/${widget.chatId}"),
      headers: api.authHeaders(),
    );
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      setState(() {
        _chatInfo = body["chatInfo"] as Map<String, dynamic>?;
        _messages = ((body["messages"] as List?) ?? []).cast<Map<String, dynamic>>();
        _loading = false;
      });
      _scrollDown();
    }
  }

  Future<void> _poll() async {
    if (_loading) return;
    final api = AppScope.of(context).api;
    try {
      final res = await http.get(
        Uri.parse("${ApiClient.baseUrl}/api/public/chat/${widget.chatId}"),
        headers: api.authHeaders(),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        final fresh = ((body["messages"] as List?) ?? []).cast<Map<String, dynamic>>();
        if (fresh.length != _messages.length) {
          setState(() => _messages = fresh);
          _scrollDown();
        }
      }
    } catch (_) {}
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent, duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send() async {
    final text = _inputCtrl.text.trim();
    if (text.isEmpty || _sending) return;

    setState(() {
      _sending = true;
      _messages.add({"id": "opt-${DateTime.now().millisecondsSinceEpoch}", "content": text, "senderName": "You", "isMe": true, "createdAt": DateTime.now().toIso8601String()});
    });
    _inputCtrl.clear();
    _scrollDown();

    final api = AppScope.of(context).api;
    final res = await http.post(
      Uri.parse("${ApiClient.baseUrl}/api/public/chat"),
      headers: {...api.authHeaders(), "Content-Type": "application/json"},
      body: jsonEncode({"chatId": widget.chatId, "content": text}),
    );

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      setState(() {
        _messages = ((body["messages"] as List?) ?? []).cast<Map<String, dynamic>>();
        _sending = false;
      });
    } else {
      setState(() => _sending = false);
    }
    _scrollDown();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_chatInfo?["otherPartyName"] as String? ?? "Chat", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            if (_chatInfo?["listingTitle"] != null)
              Text(_chatInfo!["listingTitle"] as String, style: const TextStyle(fontSize: 11, color: AppColors.coral)),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.coral))
          : Column(
              children: [
                Expanded(
                  child: _messages.isEmpty
                      ? const Center(child: Text("Start the conversation", style: TextStyle(color: AppColors.textMuted, fontSize: 12)))
                      : ListView.builder(
                          controller: _scrollCtrl,
                          padding: const EdgeInsets.all(12),
                          itemCount: _messages.length,
                          itemBuilder: (_, i) {
                            final msg = _messages[i];
                            final isMe = msg["isMe"] as bool? ?? false;
                            final isOpt = (msg["id"] as String? ?? "").startsWith("opt-");
                            return Align(
                              alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                                decoration: BoxDecoration(
                                  color: isMe ? AppColors.coral : AppColors.card,
                                  border: isMe ? null : Border.all(color: AppColors.border),
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(16),
                                    topRight: const Radius.circular(16),
                                    bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                                    bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                                  ),
                                ),
                                child: Opacity(
                                  opacity: isOpt ? 0.6 : 1.0,
                                  child: Text(
                                    msg["content"] as String? ?? "",
                                    style: TextStyle(fontSize: 13, color: isMe ? Colors.white : AppColors.textPrimary),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _inputCtrl,
                          onSubmitted: (_) => _send(),
                          decoration: InputDecoration(
                            hintText: "Type a message...",
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: AppColors.border)),
                            filled: true,
                            fillColor: AppColors.inputLight,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: _send,
                        child: Container(
                          width: 40, height: 40,
                          decoration: const BoxDecoration(color: AppColors.coral, shape: BoxShape.circle),
                          child: const Icon(Icons.send, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
