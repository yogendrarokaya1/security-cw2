"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  Mountain,
  User,
  LogOut,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/guides", label: "Guides" },
  { href: "/plan", label: "Smart Planner" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav style={{
        background: "#0D1B2A",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}>
            <Mountain
              size={24}
              style={{ color: "var(--color-primary-container)" }}
            />
            <span style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "var(--color-primary-container)",
            }}>
              NepalWander
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }} id="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px",
                  fontWeight: isActive(link.href) ? "700" : "500",
                  color: isActive(link.href) ? "#ffffff" : "#B5D4F4",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  background: isActive(link.href)
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>

            {loading ? (
              <div style={{
                width: "80px",
                height: "36px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }} />
            ) : user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setDropdownOpen(!dropdownOpen)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    cursor: "pointer",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: "inherit",
                  }}
                >
                  <User size={15} />
                  {user.firstName}
                  <ChevronDown size={13} />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 10,
                      }}
                    />
                    {/* Dropdown */}
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                      minWidth: "210px",
                      padding: "8px",
                      zIndex: 20,
                    }}>
                      {/* User info */}
                      <div style={{
                        padding: "10px 12px 12px",
                        borderBottom: "1px solid var(--color-surface-container)",
                        marginBottom: "6px",
                      }}>
                        <p style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--color-on-surface)",
                        }}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p style={{
                          fontSize: "11px",
                          color: "var(--color-outline)",
                          marginTop: "2px",
                        }}>
                          {user.email}
                        </p>
                        <span style={{
                          display: "inline-block",
                          marginTop: "6px",
                          padding: "2px 10px",
                          background: "var(--color-primary)",
                          color: "white",
                          borderRadius: "9999px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          {user.role}
                        </span>
                      </div>

                      {/* Links */}
                      {[
                        {
                          href: "/dashboard",
                          icon: <BookOpen size={15} />,
                          label: "My Bookings",
                        },
                        {
                          href: "/dashboard/profile",
                          icon: <User size={15} />,
                          label: "Profile",
                        },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() =>
                            setDropdownOpen(false)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            color: "var(--color-on-surface)",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() =>
                            setDropdownOpen(false)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            color: "var(--color-primary)",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          <LayoutDashboard size={15} />
                          Admin Panel
                        </Link>
                      )}

                      <div style={{
                        height: "1px",
                        background: "var(--color-surface-container)",
                        margin: "6px 0",
                      }} />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          color: "var(--color-danger)",
                          fontSize: "13px",
                          fontWeight: "600",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          width: "100%",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                display: "flex",
                gap: "8px",
              }} id="auth-buttons">
                <Link href="/login">
                  <button style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    padding: "0 18px",
                    height: "38px",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button style={{
                    background: "var(--color-primary)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 18px",
                    height: "38px",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>
                    Register
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              id="mobile-btn"
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
                display: "none",
              }}
            >
              {menuOpen
                ? <X size={22} />
                : <Menu size={22} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background: "#0D1B2A",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 16px 20px",
          }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  color: isActive(link.href)
                    ? "#ffffff"
                    : "#B5D4F4",
                  fontWeight: isActive(link.href)
                    ? "700"
                    : "500",
                  fontSize: "14px",
                  textDecoration: "none",
                  borderRadius: "8px",
                  background: isActive(link.href)
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  marginBottom: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}>
                <Link
                  href="/login"
                  style={{ flex: 1 }}
                  onClick={() => setMenuOpen(false)}
                >
                  <button style={{
                    width: "100%",
                    height: "44px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                    Login
                  </button>
                </Link>
                <Link
                  href="/register"
                  style={{ flex: 1 }}
                  onClick={() => setMenuOpen(false)}
                >
                  <button style={{
                    width: "100%",
                    height: "44px",
                    background: "var(--color-primary)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          #desktop-nav { display: none !important; }
          #auth-buttons { display: none !important; }
          #mobile-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}