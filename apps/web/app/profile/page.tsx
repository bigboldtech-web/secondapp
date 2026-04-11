import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@second-app/database";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session.user;

  // Get counts
  const [orderCount, savedCount, alertCount, vendor] = await Promise.all([
    prisma.order.count({ where: { buyerId: user.id } }),
    prisma.collectionItem.count({
      where: { collection: { userId: user.id } },
    }),
    prisma.alert.count({ where: { userId: user.id, isActive: true } }),
    prisma.vendor.findFirst({ where: { userId: user.id } }),
  ]);

  const menuItems = [
    { label: "My Orders", href: "/orders", count: orderCount, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { label: "Saved Items", href: "/saved", count: savedCount, icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" },
    { label: "Deal Alerts", href: "/alerts", count: alertCount, icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" },
    { label: "Notifications", href: "/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { label: "Messages", href: "/inbox", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  ];

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="bg-white border-b border-border">
        <div className="mx-auto max-w-[600px] px-4 sm:px-6 h-[52px] flex items-center">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-text-primary no-underline">Second <span className="text-coral">App</span></Link>
        </div>
      </header>

      <main className="mx-auto max-w-[600px] px-4 sm:px-6 py-6">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-[12px] px-5 py-5 mb-5 text-center">
          <div className="w-16 h-16 rounded-full bg-coral-light flex items-center justify-center mx-auto mb-3 text-xl font-bold text-coral">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-lg font-bold text-text-primary">{user.name}</h1>
          <p className="text-[12px] text-text-muted">{user.phone || user.email}</p>
          {user.locationCity && <p className="text-[11px] text-text-faint mt-0.5">{user.locationCity}</p>}

          <Link href="/profile/settings" className="inline-block mt-3 px-4 py-1.5 rounded-md border border-border text-[11px] font-medium text-text-secondary no-underline hover:bg-bg">
            Edit Profile
          </Link>
        </div>

        {/* Vendor section */}
        {vendor && (
          <Link href="/vendor/dashboard" className="block bg-coral-light border border-coral-border rounded-[10px] px-4 py-3 mb-4 no-underline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-coral">Vendor Dashboard</p>
                <p className="text-[11px] text-coral/70">{vendor.storeName} · {vendor.certificationLevel}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8553D" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </Link>
        )}

        {!vendor && (
          <Link href="/vendor/register" className="block bg-card border border-border rounded-[10px] px-4 py-3 mb-4 no-underline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Become a Seller</p>
                <p className="text-[11px] text-text-muted">Register as a vendor and start listing products</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </Link>
        )}

        {/* Menu */}
        <div className="bg-card border border-border rounded-[10px] overflow-hidden">
          {menuItems.map((item, i) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-3 no-underline ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span className="flex-1 text-[14px] font-medium text-text-primary">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[11px] text-text-muted bg-input px-1.5 py-0.5 rounded-full">{item.count}</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <form action={async () => { "use server"; const { clearSessionCookie } = await import("@/lib/auth"); await clearSessionCookie(); redirect("/"); }}>
          <button type="submit" className="w-full mt-4 py-2.5 rounded-[10px] border border-border bg-white text-condition-rough-text text-[13px] font-semibold cursor-pointer">
            Log Out
          </button>
        </form>
      </main>
    </div>
  );
}
