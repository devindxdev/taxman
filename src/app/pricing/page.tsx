import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Pricing | Taxman",
  description: "Early access pricing for Taxman.",
};

const tiers = [
  {
    name: "Early Access",
    price: "Free",
    description: "Join the waitlist and get early access when we launch.",
    features: [
      "Document upload & Google Drive",
      "Bank connection via Plaid",
      "AI categorization & extraction",
      "Transaction matching",
      "Evidence graph",
      "Tax readiness score",
    ],
    cta: "Join waitlist",
    href: "/waitlist",
    highlighted: true,
  },
  {
    name: "Pro (Coming soon)",
    price: "TBD",
    description: "For freelancers and sole proprietors who need full power.",
    features: [
      "Everything in Early Access",
      "Proactive deduction discovery",
      "What-if simulator",
      "Tax Memory (learns from corrections)",
      "Priority support",
    ],
    cta: "Get notified",
    href: "/waitlist",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pt-24 bg-tm-offwhite">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-tm-black">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-tm-gray text-lg">
              Start with early access. More tiers coming soon.
            </p>
          </div>
        </section>
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 rounded-2xl border bg-white ${
                  tier.highlighted
                    ? "border-tm-blue/40 bg-tm-blue-muted/30"
                    : "border-tm-border"
                }`}
              >
                <h2 className="text-xl font-semibold text-tm-black">
                  {tier.name}
                </h2>
                <p className="mt-2 text-3xl font-bold text-tm-blue">
                  {tier.price}
                </p>
                <p className="mt-2 text-tm-gray text-sm">
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-tm-gray"
                    >
                      <span className="text-tm-blue">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    tier.highlighted
                      ? "bg-tm-blue text-white hover:bg-tm-blue-dark"
                      : "bg-tm-border text-tm-black hover:bg-tm-gray-light"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
