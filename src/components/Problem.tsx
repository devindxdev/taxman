export function Problem() {
  const pains = [
    {
      title: "Scattered receipts",
      description:
        "Receipts live in your wallet, email, and photos. Nothing is organized when tax time comes.",
    },
    {
      title: "Missed deductions",
      description:
        "You forget what was deductible because you didn't track expenses in real time.",
    },
    {
      title: "Last-minute scramble",
      description:
        "Tax filing becomes a once-a-year panic instead of a smooth, prepared process.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-tm-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-tm-black">
            Tax filing shouldn&apos;t be a scramble
          </h2>
          <p className="mt-4 text-tm-gray max-w-2xl mx-auto">
            Most products reduce filing friction, but not the year-round
            recordkeeping problem. AI can change that.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {pains.map((pain) => (
              <div
                key={pain.title}
                className="p-6 rounded-2xl border border-tm-border bg-white hover:border-tm-blue/30 transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5"
              >
                <h3 className="font-semibold text-tm-black">{pain.title}</h3>
                <p className="mt-2 text-tm-gray text-sm leading-relaxed">{pain.description}</p>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
