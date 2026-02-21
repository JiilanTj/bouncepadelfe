import Image from "next/image";
import { Calendar, Sparkles } from "lucide-react";

const FALLBACK_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOnW-epr9MoxJ8I2Ta3O1prVPte_4rqrgYc8AMuKLSx6bopyZoIXWaZwfgVpMWwcXP9t4yg8lioRTIQ4oq7SqIWz9uwcm5D20A_aal3lfQ7jBhgTZFg6ZvQ05QJXDMOjtukj6rLBZ-p8VSdryj9qXl8-p7wQfMOBwcj08B1y1GaFYHFZBS4Bb1Q3FyJV8nLkRE2HvhYcYCSkRK1GwJ0MJaOmnbdkrOpyrZuxAcDlziK25GV2A7DaxtOimKc1yO0nIaPcjDIU9bBG0";

interface HeroProps {
  heroImageUrl: string | null;
  businessName: string;
}

export function Hero({ heroImageUrl, businessName }: HeroProps) {
  const bgImage = heroImageUrl || FALLBACK_HERO_IMAGE;

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src={bgImage}
        alt={`${businessName} Hero`}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Decorative Circles */}
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(46, 125, 50, 0.08)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(46, 125, 50, 0.08)" }}
      />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium backdrop-blur-sm"
          style={{
            borderColor: "rgba(46, 125, 50, 0.3)",
            background: "rgba(46, 125, 50, 0.1)",
            color: "var(--lp-green-200)",
          }}
        >
          <Sparkles className="h-4 w-4" />
          <span>Premium Padel Experience</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Elevate Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--lp-green-300), var(--lp-green-200))",
            }}
          >
            Padel Game
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
          Experience world-class courts, premium facilities, and a vibrant community
          at {businessName}. Your journey to becoming a padel champion starts here.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all"
            style={{
              background: "var(--lp-green-500)",
              boxShadow: "0 8px 30px rgba(46, 125, 50, 0.35)",
            }}
          >
            <Calendar className="h-5 w-5" />
            Book Your Court
          </a>
          <a
            href="#facilities"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            Explore Facilities
          </a>
        </div>
      </div>
    </section>
  );
}
