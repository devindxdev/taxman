const segments = [
  {
    title: "Freelancers & gig workers",
    description:
      "Mixed personal and business spending? Taxman separates and categorizes it automatically.",
  },
  {
    title: "Students & newcomers",
    description:
      "Struggling with tax documentation and rules? Get clear explanations and guided organization.",
  },
  {
    title: "Sole proprietors",
    description:
      "Save receipts inconsistently? Year-round organization means nothing falls through the cracks.",
  },
];

export function UserSegments() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tm-offwhite border-y border-tm-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-tm-black">
            Built for you
          </h2>
          <p className="mt-4 text-tm-gray max-w-2xl mx-auto">
            Taxman is designed for people who need year-round tax organization,
            not just a filing form.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {segments.map((segment) => (
              <div
                key={segment.title}
                className="p-6 rounded-2xl border border-tm-blue/20 bg-tm-blue-muted/30 hover:border-tm-blue/40 transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5 shadow-glow-blue-sm hover:shadow-glow-blue"
              >
                <h3 className="font-semibold text-tm-black text-lg">
                  {segment.title}
                </h3>
                <p className="mt-2 text-tm-gray text-sm leading-relaxed">
                  {segment.description}
                </p>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
