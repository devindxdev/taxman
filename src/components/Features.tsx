import Link from "next/link";

const features = [
  {
    title: "Audit-ready Evidence Graph",
    description:
      "Every claim links receipt, extracted values, bank transaction match, user confirmation, and classification reason.",
    highlight: true,
  },
  {
    title: "Proactive deduction discovery",
    description:
      "AI surfaces likely deductible transactions and asks targeted questions instead of waiting for user input.",
    highlight: true,
  },
  {
    title: "Year-round Tax Memory",
    description:
      "The system learns from your corrections and applies those decisions throughout the tax year.",
    highlight: true,
  },
  {
    title: "What-if simulator",
    description:
      "Test scenarios (e.g., business-use percentages) and see estimated effect on refund or taxes owed.",
    highlight: false,
  },
  {
    title: "Tax readiness score",
    description:
      "Gamifies progress and creates ongoing engagement beyond tax season.",
    highlight: false,
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-tm-black">
            Built for audit-ready filing
          </h2>
          <p className="mt-4 text-tm-gray max-w-2xl mx-auto">
            Five upgrades that make Taxman different from one-time tax software.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl border bg-white transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5 ${
                feature.highlight
                  ? "border-tm-blue/30 hover:border-tm-blue/50 shadow-glow-blue-sm hover:shadow-glow-blue"
                  : "border-tm-border hover:border-tm-gray-light"
              }`}
              >
              {feature.highlight && (
                <span className="inline-block px-2 py-0.5 text-xs font-mono text-tm-blue bg-tm-blue-muted rounded mb-4">
                  Key feature
                </span>
              )}
              <h3 className="font-semibold text-tm-black text-lg">
                {feature.title}
              </h3>
                <p className="mt-2 text-tm-gray text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/features"
            className="text-tm-blue hover:text-tm-blue-dark font-medium text-sm"
          >
            View all features →
          </Link>
        </div>
      </div>
    </section>
  );
}
