import PersonCard from '@/components/PersonCard';
import { osddItems, phaseOnePackages, phaseTwoPackages, mentors, chiefMentor, achievements } from "@/lib/data/osdd";

export default function OSDDPage() {
  return (
    <section className="bg-[#eef3f2] py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">

        {/* Hero */}
        <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase">
          Open Source Drug Discovery
        </div>

        <h1 className="mt-8 text-4xl font-medium tracking-tight text-slate-900">
          Collaborative science for{' '}
          <span className="text-teal-600">affordable drug discovery.</span>
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

        <p className="mx-auto mt-8 max-w-5xl text-xl leading-relaxed text-slate-500">
          Open Source Drug Discovery (OSDD) is a CSIR-led Team India Consortium with global
          participation, bringing together researchers, academia, students, industries, and
          institutions to collaboratively discover affordable treatments for neglected tropical
          diseases. The initiative operates through an open-source model that enables contributors
          from around the world to share knowledge, resources, and expertise in the pursuit of
          accessible healthcare solutions.
        </p>

        {/* Stats */}
        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-4xl font-bold text-teal-600">7500+</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">Contributors</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-teal-600">130+</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">Countries</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-teal-600">CSIR</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">Led Initiative</p>
            </div>
          </div>
        </div>

             {/* Organisation Section */}
        <div className="mt-24">
          <div className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-600">
            Organisation
          </div>
          <h2 className="mt-6 text-3xl font-medium tracking-tight text-slate-900">
            Leadership & Governance
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-teal-600" />
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-500">
            OSDD is a collaborative project under CSIR. Individual projects are taken up by
            participating bodies and managed by a Principal Investigator, centrally supervised
            by the OSDD project director at CSIR.
          </p>
        </div>

        {/* Chief Mentor */}
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="rounded-full bg-teal-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Chief Mentor
            </span>
          </div>
          <div className="flex justify-center">
            <PersonCard
              name={chiefMentor.name}
              role={chiefMentor.role}
              affiliation={chiefMentor.affiliation}
              image={chiefMentor.image}
              size="lg"
            />
          </div>
        </div>

        {/* Mentors & Project Director */}
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="rounded-full bg-slate-700 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Mentors & Leadership
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {mentors.map((person) => (
              <PersonCard
                key={person.name}
                name={person.name}
                role={person.role}
                affiliation={person.affiliation}
                image={person.image}
                size="sm"
              />
            ))}
          </div>
        </div>
 
<div className="mt-24">
  <div className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-600">
    Highlights
  </div>

  {/* Feature Cards */}
  <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {osddItems.map((item) => (
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
          <p className="text-lg leading-relaxed text-slate-500">{item.description}</p>
          {item.link && (
              <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-base font-medium text-teal-600 underline-offset-2 hover:underline"
            >
              Learn more →
            </a>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Process Section */}
        <div className="mt-24">
          <div className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-600">
            Operational Methodology
          </div>
          <h2 className="mt-6 text-3xl font-medium tracking-tight text-slate-900">
            How OSDD works
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-teal-600" />
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-500">
            OSDD operates through a Wiki-based web portal where participating agencies contribute
            and modify content, which is then peer-reviewed. Drugs developed remain in the public
            domain, with generic versions commercialised at reasonable prices by pharmaceutical
            companies. The discovery process is divided into ten structured work packages across
            two phases.
          </p>
        </div>

        {/* Phase I */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="rounded-full bg-teal-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Phase I
            </span>
            <span className="text-lg text-slate-500">Work Packages 1 – 8</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phaseOnePackages.map((wp) => (
              <div
                key={wp.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
              >
                <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-teal-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <div className="absolute inset-0 bg-linear-to-br from-teal-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <p className="text-sm font-bold tracking-widest text-teal-500 uppercase">{wp.id}</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug text-slate-900">{wp.title}</h3>
                  <div className="my-4 h-px w-8 bg-teal-200 transition-all duration-300 group-hover:w-16 group-hover:bg-teal-400" />
                  <p className="text-lg leading-relaxed text-slate-500">{wp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase II */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="rounded-full bg-slate-700 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Phase II
            </span>
            <span className="text-lg text-slate-500">Work Packages 9 – 10</span>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {phaseTwoPackages.map((wp) => (
              <div
                key={wp.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-slate-600 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <div className="absolute inset-0 bg-linear-to-br from-slate-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <p className="text-sm font-bold tracking-widest text-slate-500 uppercase">{wp.id}</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug text-slate-900">{wp.title}</h3>
                  <div className="my-4 h-px w-8 bg-slate-200 transition-all duration-300 group-hover:w-16 group-hover:bg-slate-400" />
                  <p className="text-lg leading-relaxed text-slate-500">{wp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

   

        {/* Funding Section */}
        <div className="mt-24">
          <div className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-600">
            Funding
          </div>
          <h2 className="mt-6 text-3xl font-medium tracking-tight text-slate-900">
            Government-backed Research
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-teal-600" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-4xl font-bold text-teal-600">₹45.96 Cr</h3>
            <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">Core Funding (2008–2012)</p>
            <div className="mx-auto my-4 h-px w-8 bg-teal-100" />
            <p className="text-lg leading-relaxed text-slate-500">
              Approximately $12 million earmarked by the Government of India for the period
              September 2008 to March 2012.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-4xl font-bold text-teal-600">12th Plan</h3>
            <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">Continued Support (2013–2017)</p>
            <div className="mx-auto my-4 h-px w-8 bg-teal-100" />
            <p className="text-lg leading-relaxed text-slate-500">
              The Planning Commission approved continuation of OSDD under CSIR's Scheme for
              Open Innovation for the 12th five-year plan.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-4xl font-bold text-teal-600">CSIR</h3>
            <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">National Laboratories Scheme</p>
            <div className="mx-auto my-4 h-px w-8 bg-teal-100" />
            <p className="text-lg leading-relaxed text-slate-500">
              Funds support scientific projects, infrastructure setup, and ongoing activities.
              Up to 2012 OSDD operated under CSIR's National Laboratories Scheme.
            </p>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-24">
          <div className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-600">
            Achievements
          </div>
          <h2 className="mt-6 text-3xl font-medium tracking-tight text-slate-900">
            Impact & Milestones
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-teal-600" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {achievements.map((a) => (
            <div key={a.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-4xl font-bold text-teal-600">{a.stat}</h3>
              <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">{a.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xl leading-relaxed text-slate-500">
            The consortium's first international publication appeared in 2009, presenting an
            integrative genomics map of M. tuberculosis. Since then, more than a dozen research
            papers have been published. OSDD currently operates the{' '}
            <span className="font-medium text-slate-700">OSDD Chemistry Outreach Programme (OSDDChem)</span>,
            which trains students in synthetic chemistry. Compounds synthesised at universities,
            institutes, and colleges are submitted to the OSDDChem database and sent to CSIR-CDRI
            for screening against anti-TB and anti-malarial activity.
          </p>
        </div>

      </div>
    </section>
  );
}