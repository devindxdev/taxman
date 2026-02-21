import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-tm-border-light border-t border-tm-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-semibold text-tm-black">
              Taxman
            </Link>
            <p className="mt-3 text-tm-gray text-sm max-w-md leading-relaxed">
              Your year-round AI tax copilot. Continuously building an audit-ready
              tax record so filing is faster, more accurate, and less stressful.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-tm-black mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  Join waitlist
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-tm-black mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-tm-gray hover:text-tm-black text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-tm-border">
          <p className="text-tm-gray text-sm">
            Bank-level encryption. Your data stays yours. We never sell your
            information.
          </p>
          <p className="text-tm-gray text-xs mt-2">
            © {new Date().getFullYear()} Taxman. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
