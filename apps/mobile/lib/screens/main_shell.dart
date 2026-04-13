import 'package:flutter/material.dart';

import '../theme.dart';
import 'home_screen.dart';
import 'saved_screen.dart';
import 'inbox_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _screens = const [
    HomeScreen(),
    SavedScreen(),
    SizedBox(),
    InboxScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            if (index == 2) {
              Navigator.pushNamed(context, "/sell");
              return;
            }
            setState(() => _currentIndex = index);
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.coral,
          unselectedItemColor: AppColors.textMuted,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          iconSize: 22,
          elevation: 0,
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: "Home"),
            const BottomNavigationBarItem(icon: Icon(Icons.favorite_border), activeIcon: Icon(Icons.favorite), label: "Saved"),
            BottomNavigationBarItem(
              icon: Container(
                width: 40, height: 40,
                decoration: const BoxDecoration(color: AppColors.coral, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Color(0x40E8553D), blurRadius: 8, offset: Offset(0, 2))]),
                child: const Icon(Icons.add, color: Colors.white, size: 22),
              ),
              label: "Sell",
            ),
            const BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), activeIcon: Icon(Icons.chat_bubble), label: "Inbox"),
            const BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: "Me"),
          ],
        ),
      ),
    );
  }
}
