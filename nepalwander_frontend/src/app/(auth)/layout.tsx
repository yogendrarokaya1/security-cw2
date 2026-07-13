import Link from "next/link";
import { Mountain } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-surface)",
      display: "flex",
      flexDirection: "column",
    }}>
      <header style={{
        background: "#0D1B2A",
        padding: "0 16px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
        }}>
          <Mountain
            size={22}
            style={{ color: "var(--color-primary-container)" }}
          />
          <span style={{
            fontSize: "16px",
            fontWeight: "800",
            color: "var(--color-primary-container)",
          }}>
            NepalWander
          </span>
        </Link>
      </header>

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}>
        {children}
      </div>
    </div>
  );
}