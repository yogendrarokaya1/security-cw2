import Link from "next/link";
import { Mountain, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  PRODUCT: [
    { label: "Explore", href: "/explore" },
    { label: "Destinations", href: "/destinations" },
    { label: "Packages", href: "/packages" },
    { label: "Guides", href: "/guides" },
    { label: "Smart Planner", href: "/plan" },
  ],
  COMPANY: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  SUPPORT: [
    { label: "FAQ", href: "/faq" },
    { label: "Help Center", href: "/help" },
    { label: "Cancellation Policy", href: "/cancellation" },
    { label: "Safety Guidelines", href: "/safety" },
  ],
  LEGAL: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = ["Facebook", "Instagram", "Twitter", "YouTube"];

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="container-main px-4 pt-14 pb-10">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Mountain size={22} className="text-primary-container" />
              <span className="text-[17px] font-extrabold text-primary-container">
                NepalWander
              </span>
            </Link>

            <p className="text-[13px] text-white/50 leading-relaxed max-w-[200px]">
              Your smart travel companion for Himalayan adventures.
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-primary-container shrink-0" />
                <span className="text-[12px] text-white/50">
                  hello@nepalwander.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-primary-container shrink-0" />
                <span className="text-[12px] text-white/50">
                  +977 1-4XXXXXX
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-primary-container shrink-0" />
                <span className="text-[12px] text-white/50">
                  Thamel, Kathmandu, Nepal
                </span>
              </div>
            </div>

            {/* Social text links */}
            <div className="flex gap-3 flex-wrap">
              {socials.map((s) => (
                <Link
                  key={s}
                  href="#"
                  className="text-[11px] text-white/30 hover:text-primary-container transition-colors font-semibold uppercase tracking-wider"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">
                {section}
              </h4>
              <div className="flex flex-col gap-2.5">
                {links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[13px] text-white/45 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom bar */}
      <div className="container-main px-4 py-5 flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12px] text-white/30">
          © 2026 NepalWander. All rights reserved. Made with ❤️ for Nepal.
        </p>
        <div className="flex items-center gap-5">
          <span className="text-[11px] text-white/20 uppercase tracking-widest font-semibold">
            Follow us
          </span>
          {socials.map((s) => (
            <Link
              key={s}
              href="#"
              className="text-[11px] text-white/30 hover:text-white transition-colors uppercase tracking-widest font-semibold"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}