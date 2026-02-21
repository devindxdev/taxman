import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tm-offwhite">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-12 rounded-2xl border border-tm-blue/20 bg-white shadow-glow-blue-sm animate-pulse-glow">
          <h2 className="text-3xl font-bold text-tm-black">
            Ready to simplify your taxes?
          </h2>
          <p className="mt-4 text-tm-gray">
            Join the waitlist for early access. We&apos;ll notify you when Taxman
            is ready.
          </p>
          <Link
            href="/waitlist"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-tm-blue hover:bg-tm-blue-dark rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-blue-sm"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
