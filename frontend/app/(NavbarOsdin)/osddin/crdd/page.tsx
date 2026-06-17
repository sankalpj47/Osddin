import { crddItems, resourceItems,databaseItems, webServiceItems, drugTargetItems } from "@/lib/data/crdd";

export default function CRDDPage() {
  return (
    <section className="bg-[#eef3f2] py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase">
           Computational Resources for Drug Discovery
        </div>

        <h1 className="mt-8 text-4xl font-medium tracking-tight text-slate-900">
          Affordable healthcare through{' '}
          <span className="text-teal-600">
            open source
            drug discovery.
          </span>
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

        <p className="mx-auto mt-8 max-w-5xl text-xl leading-relaxed text-slate-500">
          The OSDD Forum is an initiative with a vision to provide affordable healthcare to the
          developing world. The OSDD concept aims to synergize the power of genomics and
          computational technologies, and facilitate the participation of young and brilliant
          talent from universities and industry. It seeks to provide a global platform where the
          best brains can collaborate and collectively endeavor to solve the complex problems
          associated with discovering novel therapies for neglected diseases like tuberculosis.
        </p>

        <p className="mx-auto mt-6 max-w-5xl text-xl leading-relaxed text-slate-500">
          CRDD (Computational Resources for Drug Discovery) is an important module of the in
          silico module of OSDD. The CRDD web portal provides computer resources related to drug
          discovery on a single platform. Visit the{' '}
          <a href="https://webs.iiitd.edu.in/wiki" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">CRDD Wiki</a>
          {' '}to learn more about drug discovery resources.
        </p>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-4xl font-bold text-teal-600">100+</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
                Computational Tools
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-teal-600">3</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
                Core Research Areas
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-teal-600">OSDD</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
                Integrated Platform
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-10 text-left md:grid-cols-[280px_1fr] md:items-center">
          <div className="flex flex-col items-center text-center">
            <div className="h-48 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src="/image/gajendraraghava.png"
                alt="Gajendra P. S. Raghava"
                className="h-full w-full object-cover"
              />
            </div>
            <h4 className="mt-5 text-lg font-semibold text-slate-900">
              Gajendra P. S. Raghava
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Professor and Director,<br />
              Institute of Information Technology (IIIT), Delhi
            </p>
          </div>

          <div>
            <p className="text-lg leading-relaxed text-slate-600">
              This platform is developed in collaboration with the Indraprastha Institute of
              Information Technology (IIIT) Delhi, building on the resources and research
              maintained by the CRDD initiative. All datasets, tools, and software referenced here
              remain openly available through their official{' '}
              <a href="https://github.com/raghavagps" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">GitHub</a>{' '}
              and{' '}
              <a href="https://zenodo.org/communities/raghavagps/" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">Zenodo</a>{' '}
              repositories, ensuring full attribution and long-term accessibility for the
              research community. This effort is led by Professor Gajendra P. S. Raghava, whose
              work continues to drive open-source innovation in cheminformatics and
              pharmacoinformatics. We are proud to extend and showcase this work as part of our
              broader knowledge platform, in close coordination with the original team at IIIT
              Delhi.
            </p>

            <a href="https://webs.iiitd.edu.in/crdd/" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-base font-medium text-teal-700 transition-all duration-300 hover:gap-4">
              More info →
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {crddItems.map((item) => (
            <div
              key={item.number}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-teal-300 hover:shadow-xl"
            >
              <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-teal-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />

              <div className="absolute inset-0 bg-linear-to-br from-teal-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <p className="text-sm font-semibold text-teal-500 transition-colors duration-300 group-hover:text-teal-600">
                  {item.number}
                </p>

                <h3 className="mt-5 text-2xl font-semibold leading-snug text-slate-900">
                  {item.title}
                </h3>

                <div className="my-4 h-px w-8 bg-teal-200 transition-all duration-300 group-hover:w-16 group-hover:bg-teal-400" />

                <p className="text-lg leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Databases Table */}
        <div className="mx-auto mt-16 max-w-5xl text-left">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-slate-900">Databases  Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manually curated databases developed under the CRDD initiative
              </p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-slate-50 px-8 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Database name
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </span>
            </div>

            {/* Section Row */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-[#f1f5f4] px-8 py-3">
              <span className="text-sm font-bold text-slate-800">Databases developed</span>
              <span className="text-sm font-bold text-slate-800">{databaseItems.length}</span>
            </div>

            {/* Data Rows */}
            {databaseItems.map((db, index) => (
              <div
                key={db.name}
                className={`grid grid-cols-[240px_1fr] items-start px-8 py-4 transition-colors duration-150 hover:bg-teal-50/40 ${
                  index < databaseItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="pr-6 text-sm font-semibold text-teal-700">{db.name}</span>
                <span className="text-sm leading-relaxed text-slate-500">{db.description}</span>
              </div>
            ))}
          </div>
        </div>


        <div className="mx-auto mt-16 max-w-5xl text-left">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-slate-900">Resources  Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manually created resources under the CRDD initiative
              </p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-slate-50 px-8 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resources Name
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </span>
            </div>

            {/* Section Row */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-[#f1f5f4] px-8 py-3">
              <span className="text-sm font-bold text-slate-800">Resources created</span>
              <span className="text-sm font-bold text-slate-800">{resourceItems.length}</span>
            </div>

            {/* Data Rows */}
            {resourceItems.map((db, index) => (
              <div
                key={db.name}
                className={`grid grid-cols-[240px_1fr] items-start px-8 py-4 transition-colors duration-150 hover:bg-teal-50/40 ${
                  index < resourceItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="pr-6 text-sm font-semibold text-teal-700">{db.name}</span>
                <span className="text-sm leading-relaxed text-slate-500">{db.description}</span>
              </div>
            ))}
          </div>
        </div>





        <div className="mx-auto mt-16 max-w-5xl text-left">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-slate-900">Web services  Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                List of few servers created under the CRDD initiative
              </p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-slate-50 px-8 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Web services Name
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </span>
            </div>

            {/* Section Row */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-[#f1f5f4] px-8 py-3">
              <span className="text-sm font-bold text-slate-800">Resources created</span>
              <span className="text-sm font-bold text-slate-800">{webServiceItems.length}</span>
            </div>

            {/* Data Rows */}
            {webServiceItems.map((db, index) => (
              <div
                key={db.name}
                className={`grid grid-cols-[240px_1fr] items-start px-8 py-4 transition-colors duration-150 hover:bg-teal-50/40 ${
                  index < webServiceItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="pr-6 text-sm font-semibold text-teal-700">{db.name}</span>
                <span className="text-sm leading-relaxed text-slate-500">{db.description}</span>
              </div>
            ))}
          </div>
        </div>


        
        <div className="mx-auto mt-16 max-w-5xl text-left">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-slate-900">Drug Target Prediction Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                List of servers for prediction and analysis of drug targets
              </p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-slate-50 px-8 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tool Name
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </span>
            </div>

            {/* Section Row */}
            <div className="grid grid-cols-[240px_1fr] border-b border-slate-200 bg-[#f1f5f4] px-8 py-3">
              <span className="text-sm font-bold text-slate-800">Resources created</span>
              <span className="text-sm font-bold text-slate-800">{drugTargetItems.length}</span>
            </div>

            {/* Data Rows */}
            {drugTargetItems.map((db, index) => (
              <div
                key={db.name}
                className={`grid grid-cols-[240px_1fr] items-start px-8 py-4 transition-colors duration-150 hover:bg-teal-50/40 ${
                  index < drugTargetItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <span className="pr-6 text-sm font-semibold text-teal-700">{db.name}</span>
                <span className="text-sm leading-relaxed text-slate-500">{db.description}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}