"use client";
 
import { useRouter } from "next/navigation";

const schemaData = [
  { section: "Node types", count: "10", isHeader: true },
  { section: "Gene (GEN) attributes", count: "24" },
  { section: "Drug (DRG) attributes", count: "38" },
  { section: "Disease (DIS) attributes", count: "18" },
  { section: "Phenotype (PHE) attributes", count: "17" },
  { section: "Anatomy (ANA) attributes", count: "4" },
  { section: "Pathway (PWY) attributes", count: "2" },
  { section: "Biological process (BPO) attributes", count: "4" },
  { section: "Cellular component (CCO) attributes", count: "4" },
  { section: "Molecular function (MFN) attributes", count: "4" },
  { section: "Exposure (EXP) attributes", count: "3" },
  { section: "Edge types", count: "26", isHeader: true },
  { section: "Anatomy-gene (ANA-GEN) properties", count: "2" },
  { section: "Anatomy-anatomy (ANA-ANA) properties", count: "0" },
  { section: "Disease-gene (DIS-GEN) properties", count: "10" },
  { section: "Disease-disease (DIS-DIS) properties", count: "0" },
  { section: "Disease-phenotype (DIS-PHE) properties", count: "8" },
  { section: "Phenotype-gene (PHE-GEN) properties", count: "10" },
  { section: "Phenotype-phenotype (PHE-PHE) properties", count: "0" },
  { section: "Drug-gene (DRG-GEN) properties", count: "3" },
  { section: "Drug-disease (DRG-DIS) properties", count: "4" },
  { section: "Drug-phenotype (DRG-PHE) properties", count: "4" },
  { section: "Drug-drug (DRG-DRG) properties", count: "1" },
  { section: "Gene-gene (GEN-GEN) properties", count: "0" },
  { section: "Biological process-gene (BPO-GEN) properties", count: "3" },
  { section: "Molecular function-gene (MFN-GEN) properties", count: "3" },
  { section: "Cellular component-gene (CCO-GEN) properties", count: "3" },
  { section: "Biological process-biological process (BPO-BPO)", count: "0" },
  { section: "Cellular component-cellular component (CCO-CCO)", count: "0" },
  { section: "Molecular function-molecular function (MFN-MFN)", count: "0" },
  { section: "Pathway-gene (PWY-GEN)", count: "0" },
  { section: "Pathway-pathway (PWY-PWY)", count: "0" },
  { section: "Exposure-gene (EXP-GEN)", count: "11+" },
];

export default function SchemaPage() {
      const router = useRouter();
  return (
    <section className="bg-[#eef3f2] py-20">
                <button
          onClick={() => router.back()}
          className="absolute left-6 top-6 flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition-colors duration-150 hover:bg-[#eaf2f0] hover:text-slate-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      <div className="mx-auto max-w-6xl px-6 text-center">

        <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-xs tracking-[0.3em] text-slate-600 uppercase">
         Schema overview
        </div>

        <h1 className="mt-8 text-5xl font-medium tracking-tight text-slate-900">
          Every node, every edge {' '}
          <br/>
          <span className="text-teal-600">
            the anatomy of our knowledge base.
          </span>
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

      </div>
         <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Card header */}
          <div className="bg-[#eaf2f0] px-8 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              Knowledge base — Schema overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Node &amp; edge types contained in the biomedical knowledge base
            </p>
          </div>
 
          {/* Column labels */}
          <div className="grid grid-cols-[1fr_200px] gap-4 border-b border-slate-200 bg-[#f4faf8] px-8 py-3">
            <span className="text-xs font-semibold text-slate-700">
              Section title
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Number of types / items listed
            </span>
          </div>
 
          {/* Rows */}
          <div>
            {schemaData.map((row, i) => (
              <div
                key={i}
                className={[
                  "grid grid-cols-[1fr_200px] gap-4 border-b border-slate-100 px-8 py-3 last:border-b-0",
                  row.isHeader
                    ? "bg-[#eaf2f0]"
                    : "transition-colors duration-150 hover:bg-[#f4faf8]",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-sm",
                    row.isHeader
                      ? "font-semibold text-slate-900"
                      : "pl-5 text-slate-500",
                  ].join(" ")}
                >
                  {row.section}
                </span>
                <span
                  className={[
                    "text-sm",
                    row.isHeader
                      ? "font-semibold text-slate-900"
                      : "text-slate-700",
                  ].join(" ")}
                >
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}