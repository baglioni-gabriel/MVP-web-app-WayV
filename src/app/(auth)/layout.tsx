import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* ── Left: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-gold/10 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Image
            src="/Logo_Wayv.svg"
            alt="Wayv"
            width={200}
            height={72}
            className="w-48 h-auto"
            priority
          />
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white">
              Discover the world
              <br />
              <span className="gradient-text">one experience at a time</span>
            </h1>
            <p className="text-sm text-blue-200/70 max-w-sm leading-relaxed">
              Join a community of travelers and local businesses sharing 
              authentic experiences around the globe.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Auth Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-bg-dark">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2">
          <Image
            src="/Logo_Wayv.svg"
            alt="Wayv"
            width={120}
            height={44}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
