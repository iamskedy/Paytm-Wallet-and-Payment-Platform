"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AppbarClient() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/");
      }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        marginTop: 4,
        borderRadius: 10,
        border: "none",
        background: "none",
        color: "var(--text3)",
        fontSize: 13,
        cursor: "pointer",
        transition: "all .18s",
        textAlign: "left",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,.08)";
        (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "none";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)";
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  );
}
