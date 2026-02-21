import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-tm-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-semibold text-tm-black tracking-tight">
            Taxman
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/features"
              className="text-sm font-medium text-tm-gray hover:text-tm-black transition-all duration-200 hover:-translate-y-0.5"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-tm-gray hover:text-tm-black transition-all duration-200 hover:-translate-y-0.5"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-tm-gray hover:text-tm-black transition-all duration-200 hover:-translate-y-0.5"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-tm-blue hover:bg-tm-blue-dark px-4 py-2 rounded transition-all duration-200 hover:shadow-glow-blue-sm hover:scale-105"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
