import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "How it works | Taxman",
  description:
    "Connect your documents and bank accounts. Taxman organizes, extracts, and matches everything.",
};

const steps = [
  {
    number: 1,
    title: "Connect",
    description:
      "Upload receipts directly, link your Google Drive, and connect your bank accounts via Plaid. Taxman ingests documents and transactions securely.",
  },
  {
    number: 2,
    title: "AI organizes",
    description:
      "Documents are read and categorized automatically. Values are extracted (amount, date, vendor, category). Transactions are matched to receipts. You get a continuously maintained, organized record.",
  },
  {
    number: 3,
    title: "File with confidence",
    description:
      "Every claim links to evidence. Proactive deduction discovery surfaces likely deductible activity. Your tax readiness score shows progress. When filing time comes, you're prepared.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="pt-24 bg-tm-offwhite">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-tm-black">
              How Taxman works
            </h1>
            <p className="mt-4 text-tm-gray text-lg">
              Three steps to an audit-ready tax record.
            </p>
          </div>
        </section>
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-16">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-tm-blue-muted flex items-center justify-center text-tm-blue font-mono text-xl font-semibold">
                  {String(step.number).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-tm-black">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-tm-gray leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
