import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/listing.dart';

/// Thin wrapper around the /api/public/* endpoints exposed by apps/web.
/// The base URL is injected at build time via --dart-define=API_BASE_URL=...
/// and defaults to the local dev server.
class ApiClient {
  static const String baseUrl = String.fromEnvironment(
    "API_BASE_URL",
    defaultValue: "http://localhost:3000",
  );

  static const String _tokenKey = "sa_token";

  String? _token;

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  bool get hasToken => _token != null;

  Map<String, String> authHeaders({bool json = false}) {
    return {
      if (json) "Content-Type": "application/json",
      if (_token != null) "Authorization": "Bearer $_token",
    };
  }

  Map<String, String> _headers({bool json = false}) => authHeaders(json: json);

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = Uri.parse(baseUrl);
    return base.replace(path: path, queryParameters: query);
  }

  // ------------------------------------------------------------------
  // Catalog
  // ------------------------------------------------------------------

  Future<List<ListingCard>> fetchListings({
    String? category,
    String? city,
    String? search,
    int limit = 20,
    int offset = 0,
  }) async {
    final res = await http.get(
      _uri("/api/public/listings", {
        if (category != null) "category": category,
        if (city != null) "city": city,
        if (search != null) "search": search,
        "limit": "$limit",
        "offset": "$offset",
      }),
      headers: _headers(),
    );
    if (res.statusCode != 200) throw ApiException("Listings ${res.statusCode}", res.body);
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final list = (body["listings"] as List).cast<Map<String, dynamic>>();
    return list.map(ListingCard.fromJson).toList();
  }

  Future<ListingDetail> fetchListing(String id) async {
    final res = await http.get(_uri("/api/public/listings/$id"), headers: _headers());
    if (res.statusCode == 404) throw ApiException("Not found", "Listing $id not found");
    if (res.statusCode != 200) throw ApiException("Listing ${res.statusCode}", res.body);
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return ListingDetail.fromJson(body["listing"] as Map<String, dynamic>);
  }

  Future<List<Category>> fetchCategories() async {
    final res = await http.get(_uri("/api/public/categories"), headers: _headers());
    if (res.statusCode != 200) throw ApiException("Categories ${res.statusCode}", res.body);
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    final list = (body["categories"] as List).cast<Map<String, dynamic>>();
    return list.map(Category.fromJson).toList();
  }

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------

  Future<OtpSendResult> sendOtp(String phone) async {
    final res = await http.post(
      _uri("/api/public/auth/otp/send"),
      headers: _headers(json: true),
      body: jsonEncode({"phone": phone}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      return OtpSendResult(ok: false, error: body["error"] as String? ?? "Failed to send OTP");
    }
    return OtpSendResult(ok: true, devMode: body["devMode"] as bool? ?? false);
  }

  Future<AppUser?> verifyOtp(String phone, String otp) async {
    final res = await http.post(
      _uri("/api/public/auth/otp/verify"),
      headers: _headers(json: true),
      body: jsonEncode({"phone": phone, "otp": otp}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      throw ApiException("Verify OTP ${res.statusCode}", body["error"]?.toString() ?? "Invalid OTP");
    }
    await setToken(body["token"] as String);
    return AppUser.fromJson(body["user"] as Map<String, dynamic>);
  }

  Future<AppUser?> fetchMe() async {
    if (_token == null) return null;
    final res = await http.get(_uri("/api/public/auth/me"), headers: _headers());
    if (res.statusCode != 200) {
      await clearToken();
      return null;
    }
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    return AppUser.fromJson(body["user"] as Map<String, dynamic>);
  }
}

class ApiException implements Exception {
  final String code;
  final String message;
  const ApiException(this.code, this.message);

  @override
  String toString() => "ApiException($code): $message";
}

class OtpSendResult {
  final bool ok;
  final String? error;
  final bool devMode;

  const OtpSendResult({required this.ok, this.error, this.devMode = false});
}
