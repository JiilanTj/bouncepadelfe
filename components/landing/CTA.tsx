import Image from "next/image";

interface CTAProps {
  businessPhone: string | null;
  heroImageUrl: string | null;
}

function getWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  const intl = cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${intl}?text=Hi,%20saya%20ingin%20booking%20lapangan%20padel`;
}

export function CTA({ businessPhone, heroImageUrl }: CTAProps) {
  const whatsappLink = getWhatsAppLink(businessPhone);
  const qrCodeUrl = whatsappLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappLink)}`
    : null;

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--lp-bg)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-16"
          style={{ background: "var(--lp-dark)" }}
        >
          {/* Background Image Overlay */}
          {heroImageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImageUrl}
                alt=""
                fill
                className="object-cover opacity-30 mix-blend-overlay"
                sizes="100vw"
              />
            </div>
          )}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(to right, var(--lp-dark) 0%, var(--lp-dark) 40%, transparent 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
            {/* Left: Text & Buttons */}
            <div className="max-w-lg text-center md:text-left">
              <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                Siap untuk{" "}
                <span style={{ color: "var(--lp-green-300)" }}>Bermain?</span>
              </h2>
              <p className="mb-8 text-lg font-medium text-gray-400">
                Jangan lewatkan keseruan bermain Padel. Booking lapangan sekarang
                via WhatsApp atau hubungi kami langsung.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-3 rounded-lg px-6 py-4 font-bold transition-all hover:opacity-90 sm:w-auto"
                    style={{
                      background: "var(--lp-green-400)",
                      color: "white",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Book via WhatsApp
                  </a>
                )}
                <a
                  href="#contact"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-transparent px-6 py-4 font-bold text-white transition-all hover:bg-white hover:text-gray-900 sm:w-auto"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="relative flex justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl bg-white p-4 shadow-2xl transition-transform hover:scale-105 md:h-72 md:w-72">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="WhatsApp QR Code"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-24 w-24" style={{ color: "var(--lp-dark)" }}>
                      <path d="M3 11h2v2H3v-2zm0-4h2v2H3V7zm4 4h2v2H7v-2zm0-4h2v2H7V7zm0-4h2v2H7V3zm4 8h2v2h-2v-2zm0-4h2v2h-2V7zm0-4h2v2h-2V3zm4 8h2v2h-2v-2zm0-4h2v2h-2V7zm4 4h2v2h-2v-2zm0-4h2v2h-2V7zm-8 8h2v2h-2v-2zm-4 0h2v2H7v-2zm-4 0h2v2H3v-2zm16 0h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 4h2v2h-2v-2z" />
                    </svg>
                    <span className="text-sm font-medium">QR Code</span>
                  </div>
                )}
                <div
                  className="absolute -bottom-4 rounded-full px-4 py-1.5 text-sm font-bold shadow-lg"
                  style={{
                    background: "var(--lp-green-400)",
                    color: "white",
                  }}
                >
                  {qrCodeUrl ? "Scan to Book via WA" : "Scan to Book"}
                </div>
              </div>
              {/* Decorative glow behind QR */}
              <div
                className="absolute -inset-4 -z-10 rounded-full blur-3xl"
                style={{ background: "rgba(46, 125, 50, 0.15)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
