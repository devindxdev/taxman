export function SocialProof() {
  const testimonials = [
    {
      quote:
        "Finally, I don't have to dig through my inbox in April. Taxman has everything organized.",
      role: "Freelance designer",
    },
    {
      quote:
        "As an international student, tax rules were confusing. Taxman explains everything clearly.",
      role: "Graduate student",
    },
    {
      quote:
        "My receipts used to live in a shoebox. Now they're linked to my transactions and ready for filing.",
      role: "Sole proprietor",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-tm-black">
            Trusted by early adopters
          </h2>
          <p className="mt-4 text-tm-gray max-w-2xl mx-auto">
            Join freelancers, students, and sole proprietors who are building
            audit-ready records year-round.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
              <blockquote key={i} className="p-6 rounded-2xl border border-tm-border bg-white hover:border-tm-blue/30 transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5">
                <p className="text-tm-gray italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <cite className="mt-4 block text-sm text-tm-blue not-italic font-medium">
                  — {testimonial.role}
                </cite>
              </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
