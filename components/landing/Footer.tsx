import Image from "next/image";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

interface FooterProps {
  businessName: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  businessMapLink: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  weekdayOpen: string | null;
  weekdayClose: string | null;
  weekendOpen: string | null;
  weekendClose: string | null;
}

export function Footer({
  businessName,
  businessPhone,
  businessEmail,
  businessAddress,
  businessMapLink,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  weekdayOpen,
  weekdayClose,
  weekendOpen,
  weekendClose,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const name = businessName || "Bounce Padel";

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Facilities", href: "#facilities" },
    { label: "Shop", href: "#shop" },
    { label: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    instagramUrl && { icon: Instagram, href: instagramUrl, label: "Instagram" },
    facebookUrl && { icon: Facebook, href: facebookUrl, label: "Facebook" },
    tiktokUrl && {
      icon: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z" />
        </svg>
      ),
      href: tiktokUrl,
      label: "TikTok",
    },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[];

  return (
    <footer id="contact" className="lp-footer pt-16 pb-8" style={{ background: "var(--lp-dark)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/logotypes.png"
              alt={name}
              width={140}
              height={35}
              className="mb-4 h-8 w-auto brightness-0 invert object-contain"
            />
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-gray-400">
              The premier padel destination offering world-class courts,
              professional coaching, and premium facilities.
            </p>
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="lp-social-icon flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="lp-footer-link text-sm text-gray-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/login"
                  className="lp-footer-link text-sm text-gray-400 transition-colors"
                >
                  Staff Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {businessAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--lp-green-400)" }} />
                  {businessMapLink ? (
                    <a
                      href={businessMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lp-footer-link text-sm text-gray-400 transition-colors"
                    >
                      {businessAddress}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">{businessAddress}</span>
                  )}
                </li>
              )}
              {businessPhone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: "var(--lp-green-400)" }} />
                  <a
                    href={`tel:${businessPhone}`}
                    className="lp-footer-link text-sm text-gray-400 transition-colors"
                  >
                    {businessPhone}
                  </a>
                </li>
              )}
              {businessEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: "var(--lp-green-400)" }} />
                  <a
                    href={`mailto:${businessEmail}`}
                    className="lp-footer-link text-sm text-gray-400 transition-colors"
                  >
                    {businessEmail}
                  </a>
                </li>
              )}
            </ul>

            {/* Hours */}
            <div className="mt-6 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                Operating Hours
              </h5>
              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Mon – Fri</span>
                  <span className="text-white">
                    {weekdayOpen && weekdayClose ? `${weekdayOpen} – ${weekdayClose}` : "07:00 – 23:00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sat – Sun</span>
                  <span className="text-white">
                    {weekendOpen && weekendClose ? `${weekendOpen} – ${weekendClose}` : "06:00 – 23:00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-8 text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-sm text-gray-500">
            © {currentYear} {name}. All rights reserved.
          </p>
          <p className="mt-2 text-[1px] opacity-0 absolute pointer-events-none -z-10 overflow-hidden w-0 h-0">
            Technology supported by{" "}
            <a
              href="https://sapacode.id"
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden="true"
              tabIndex={-1}
            >
              sapacode.id
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
