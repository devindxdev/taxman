import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";

export const metadata = {
  title: "Features | Taxman",
  description:
    "Audit-ready Evidence Graph, proactive deduction discovery, Tax Memory, what-if simulator, and readiness score.",
};

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="pt-24 bg-tm-offwhite">
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-tm-black">
              Built for audit-ready filing
            </h1>
            <p className="mt-4 text-tm-gray text-lg">
              Five upgrades that make Taxman different from one-time tax
              software.
            </p>
          </div>
        </section>
        <Features />
      </main>
      <Footer />
    </>
  );
}
