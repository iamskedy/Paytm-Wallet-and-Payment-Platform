import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "../provider";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import Link from "next/link";
import { AppbarClient } from "./components/AppbarClient";

export const metadata: Metadata = {
  title: "PayFlow — Wallet",
  description: "Send, receive and manage your money",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <Providers>
        <body>
          {session?.user ? (
            <div className="pf-shell">
              {/* Sidebar */}
              <aside className="pf-sidebar">
                {/* Logo */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "20px 20px 18px",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "linear-gradient(135deg,#2563EB,#60A5FA)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: "0 0 14px rgba(59,130,246,.3)"
                  }}>💳</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, letterSpacing: "-.4px" }}>PayFlow</div>
                    <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--text3)" }}>USER WALLET</div>
                  </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "12px 0" }}>
                  <div style={{ padding: "16px 14px 6px", fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Main
                  </div>
                  <Link href="/dashboard" className="pf-nav-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    Dashboard
                  </Link>
                  <Link href="/transfer" className="pf-nav-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12l4 4 4-4"/></svg>
                    Add Money
                  </Link>
                  <Link href="/p2p" className="pf-nav-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    Send Money
                  </Link>
                  <Link href="/transactions" className="pf-nav-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Transactions
                  </Link>
                </nav>

                {/* User chip at bottom */}
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 8px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0
                    }}>
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.user.name ?? "User"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                  <AppbarClient />
                </div>
              </aside>

              {/* Main content */}
              <main className="pf-main">
                {children}
              </main>
            </div>
          ) : (
            <main>{children}</main>
          )}
        </body>
      </Providers>
    </html>
  );
}
