import Link from "next/link";
import { BackgroundActivity } from "./BackgroundActivity";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/jakub-zerdzicki-8wLZi9OhsWU-unsplash.jpg')" }}
      />
      <div className="absolute inset-0 bg-tm-black/40" />
      <BackgroundActivity />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tm-blue/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-tm-blue/5 via-transparent to-transparent" />
      <div className="relative z-10 max-w-4xl mx-auto text-center p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl">
        <p className="text-tm-blue font-mono text-sm tracking-wider uppercase mb-6">
          AI Tax Copilot by Taxman
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-tm-black leading-tight tracking-tight">
          Tax season,{" "}
          <span className="text-tm-blue">every season.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-tm-gray max-w-2xl mx-auto leading-relaxed">
          Continuously build an audit-ready tax record using document intelligence,
          bank transaction matching, and explainable automation.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-tm-blue hover:bg-tm-blue-dark rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm"
          >
            Get early access
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-tm-black border border-tm-black hover:bg-tm-border-light rounded-lg transition-all duration-200 hover:scale-[1.02]"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
