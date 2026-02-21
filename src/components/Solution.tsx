export function Solution() {
  const steps = [
    {
      num: "01",
      title: "Connect",
      description:
        "Upload receipts, link Google Drive, and connect your bank via Plaid.",
    },
    {
      num: "02",
      title: "AI organizes",
      description:
        "Documents are read, categorized, and matched to transactions automatically.",
    },
    {
      num: "03",
      title: "File with confidence",
      description:
        "Audit-ready records, proactive deduction discovery, and a readiness score.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tm-offwhite">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-tm-black">
            Your AI tax copilot, year-round
          </h2>
          <p className="mt-4 text-tm-gray max-w-2xl mx-auto">
            Connect your documents and bank accounts. Taxman organizes, extracts,
            and matches everything—so you file with confidence.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
              <div key={step.num} className="text-center p-6 rounded-2xl border border-tm-border bg-white hover:border-tm-blue/30 transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5">
                <span className="font-mono text-tm-blue text-2xl font-semibold">
                  {step.num}
                </span>
                <h3 className="mt-4 font-semibold text-tm-black text-lg">{step.title}</h3>
                <p className="mt-2 text-tm-gray text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
