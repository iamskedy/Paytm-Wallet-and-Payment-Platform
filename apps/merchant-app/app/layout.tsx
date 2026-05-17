import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "../provider";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import Link from "next/link";
import { SignOutButton } from "./components/SignOutButton";

export const metadata: Metadata = {
  title: "PayFlow Merchant",
  description: "Merchant dashboard — payments, settlements & analytics",
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
            <div className="m-shell">
              {/* Sidebar */}
              <aside className="m-sidebar">
                {/* Logo */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "18px 18px 16px",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "linear-gradient(135deg,#059669,#0D9488)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: "0 0 16px rgba(16,185,129,.3)",
                    flexShrink: 0
                  }}>🏢</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, letterSpacing: "-.3px" }}>
                      PayFlow
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      MERCHANT PORTAL
                    </div>
                  </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "12px 0" }}>
                  <div style={{ padding: "14px 14px 5px", fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Overview
                  </div>
                  <Link href="/" className="m-nav-item">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    Dashboard
                  </Link>
                  <Link href="/transactions" className="m-nav-item">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Transactions
                  </Link>
                  <div style={{ padding: "14px 14px 5px", fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Tools
                  </div>
                  <Link href="/payment-link" className="m-nav-item">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Payment Links
                  </Link>
                </nav>

                {/* User chip */}
                <div style={{ borderTop: "1px solid var(--border)", padding: "12px 8px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                  }}>
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: "linear-gradient(135deg,#059669,#0D9488)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0
                      }}>
                        {session.user.name?.[0]?.toUpperCase() ?? "M"}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.user.name ?? "Merchant"}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                  <SignOutButton />
                </div>
              </aside>

              {/* Main */}
              <main className="m-main">{children}</main>
            </div>
          ) : (
            <main>{children}</main>
          )}
        </body>
      </Providers>
    </html>
  );
}
