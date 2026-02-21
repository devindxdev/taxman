"use client";

export function BackgroundActivity() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Floating blobs */}
      <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-tm-blue/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-tm-blue/8 blur-3xl animate-float-slow" />
      <div className="absolute left-1/3 top-2/3 h-48 w-48 rounded-full bg-tm-blue/5 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute right-1/3 top-1/3 h-40 w-40 rounded-full bg-tm-blue/6 blur-2xl animate-float-slow" style={{ animationDelay: "1s" }} />

      {/* Geometric shapes */}
      <div
        className="absolute top-20 left-[15%] h-16 w-16 rounded-2xl border-2 border-tm-blue/15 animate-float"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute top-40 right-[20%] h-12 w-12 rounded-full border-2 border-tm-blue/12 animate-float-slow"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-32 left-[25%] h-10 w-10 rounded-lg border border-tm-blue/10 animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-40 right-[30%] h-14 w-14 rounded-full border-2 border-tm-blue/15 animate-float-slow"
        style={{ animationDelay: "2.5s" }}
      />

      {/* Floating document/receipt icons */}
      <svg
        className="absolute top-32 right-[12%] h-8 w-8 text-tm-blue/25 animate-float"
        style={{ animationDelay: "4s" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <svg
        className="absolute bottom-48 left-[10%] h-6 w-6 text-tm-blue/20 animate-float-slow"
        style={{ animationDelay: "0.8s" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
