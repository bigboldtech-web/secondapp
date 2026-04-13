import 'package:flutter/material.dart';

import 'api/client.dart';
import 'models/listing.dart';
import 'screens/home_screen.dart';
import 'screens/listing_detail_screen.dart';
import 'screens/login_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/saved_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/inbox_screen.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiClient();
  await api.loadToken();
  final currentUser = api.hasToken ? await api.fetchMe() : null;
  runApp(SecondApp(api: api, initialUser: currentUser));
}

/// The whole app lives behind an [InheritedWidget] that exposes the
/// [ApiClient] and the current user. Simple enough for an MVP — swap for
/// Riverpod/Provider later when we grow.
class SecondApp extends StatefulWidget {
  final ApiClient api;
  final AppUser? initialUser;

  const SecondApp({super.key, required this.api, this.initialUser});

  @override
  State<SecondApp> createState() => _SecondAppState();
}

class _SecondAppState extends State<SecondApp> {
  late AppUser? _user;

  @override
  void initState() {
    super.initState();
    _user = widget.initialUser;
  }

  void _setUser(AppUser? user) {
    setState(() => _user = user);
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      api: widget.api,
      user: _user,
      setUser: _setUser,
      child: MaterialApp(
        title: "Second App",
        theme: buildTheme(),
        debugShowCheckedModeBanner: false,
        initialRoute: "/",
        routes: {
          "/": (_) => const HomeScreen(),
          "/login": (_) => const LoginScreen(),
          "/profile": (_) => const ProfileScreen(),
          "/saved": (_) => const SavedScreen(),
          "/inbox": (_) => const InboxScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name?.startsWith("/listing/") ?? false) {
            final id = settings.name!.substring("/listing/".length);
            return MaterialPageRoute(
              builder: (_) => ListingDetailScreen(listingId: id),
              settings: settings,
            );
          }
          return null;
        },
      ),
    );
  }
}

/// InheritedWidget that gives every child access to the shared [ApiClient]
/// and the current session user. [setUser] lets login/logout re-render the
/// tree when auth state changes.
class AppScope extends InheritedWidget {
  final ApiClient api;
  final AppUser? user;
  final void Function(AppUser?) setUser;

  const AppScope({
    super.key,
    required this.api,
    required this.user,
    required this.setUser,
    required super.child,
  });

  static AppScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, "AppScope not found in widget tree");
    return scope!;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) => user != oldWidget.user;
}
