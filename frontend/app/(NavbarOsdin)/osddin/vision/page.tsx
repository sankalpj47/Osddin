import Link from 'next/link';
import Image from 'next/image';

// ─── Vision / pillars data ──────────────────────────────────────────────────
const visionItems = [
  { number: '01', title: 'Computational Resources' },
  { number: '02', title: 'Open Source Promotion' },
  { number: '03', title: 'Human Resource Development', description: 'Training researchers and developers to contribute and innovate in drug discovery.' },
  { number: '04', title: 'Need-Based Research', description: 'Research driven by real healthcare needs and long-term societal impact.' },
];

function VisionDescription({ number }: { number: string }) {
  if (number === '01') return (
    <><Link href="/osddin/crdd" className="font-medium text-teal-600 hover:underline">CRDD</Link>{' '}provides computational tools and resources for in silico drug discovery.</>
  );
  if (number === '02') return (
    <>Open-source cheminformatics resources published on{' '}<a href="https://github.com/raghavagps" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">GitHub</a>{' '}and{' '}<a href="https://zenodo.org/communities/raghavagps/" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">Zenodo</a>.</>
  );
  return null;
}

// ─── Objectives ─────────────────────────────────────────────────────────────
const objectives = [
  { title: 'Solving Real-World Problems', desc: 'Address real-world health problems by empowering students to apply data science skills.' },
  { title: 'Learning while Training', desc: 'Gain training on cutting-edge health data analytics while solving the health problem.' },
  { title: 'Interdisciplinary Collaboration', desc: 'Foster collaboration among students from diverse disciplines to tackle health challenges collectively.' },
  { title: 'Innovative Projects', desc: 'Support high-risk projects that push the boundaries of health data solutions while keeping it open source.' },
  { title: 'Dissemination', desc: 'Provide avenues for students to disseminate their findings through open-access journals and other channels.' },
  { title: 'IP & Commercialisation', desc: 'Closely monitor for patentable outcomes and pursue commercialisation opportunities in partnership with industry leaders.' },
];

// ─── Core team ──────────────────────────────────────────────────────────────
// ⬇ Replace the src strings with your actual image paths, e.g. '/team/brahmachari.jpg'
const coreTeam = [
  {
    name: 'Prof. Samir Brahmachari',
    role: 'CORE TEAM',
    src: '/image/team/samirbrahmachari.jpg',   // ← replace with real image path
  },
  {
    name: 'Dr. Gyan Srivastava',
    role: 'CORE TEAM',
    src: '/image/team/gpsrivastava.jpg',    // ← replace with real image path
  },
  {
    name: 'Prof. Vijay Tiwari',
    role: 'CORE TEAM',
    src: '/image/team/vijaytiwari.png',        // ← replace with real image path
  },
];

// ────────────────────────────────────────────────────────────────────────────
export default function VisionPage() {
  return (
    <div className="bg-[#eef3f2]">

      {/* ══════════════════════════════════════════
          1. ORIGINAL VISION SECTION
      ══════════════════════════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">

          <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase">
            Our Vision
          </div>

          <h1 className="mt-8 text-4xl font-medium tracking-tight text-slate-900">
            A unified ecosystem for{' '}
            <span className="text-teal-600">open drug discovery.</span>
          </h1>

          <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

          <p className="mx-auto mt-8 max-w-5xl text-xl leading-relaxed text-slate-500">
            OSDDIN is a web-based platform delivering curated biomedical data from hundreds of sources as a
            biomedical knowledge graph for open-source drug discovery. Backed by persistent GitHub &amp; Zenodo
            repositories, we ensure long-term, standalone access to datasets, databases and software for the
            global research community.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visionItems.map((item) => (
              <div
                key={item.number}
                className="group relative overflow-hidden border border-slate-200 hover:border-teal-300 rounded-2xl bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-teal-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <p className="text-sm font-semibold text-teal-500 transition-colors duration-300 group-hover:text-teal-600">{item.number}</p>
                  <h3 className="mt-5 text-2xl font-semibold leading-snug text-slate-900">{item.title}</h3>
                  <div className="my-4 h-px w-8 bg-teal-200 transition-all duration-300 group-hover:w-16 group-hover:bg-teal-400" />
                  <p className="text-lg leading-relaxed text-slate-500">
                    {item.description ?? <VisionDescription number={item.number} />}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. HEALTH DATA SCIENCE ACADEMY — INTRO
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">

          {/* Section badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-full border border-slate-300 bg-[#eef3f2] px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase">
              Health Data Science Academy
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase mb-3">
                A Non-Profit Initiative
              </p>
              <h2 className="text-3xl font-semibold text-slate-900 leading-snug mb-6">
                Transforming health data science through{' '}
                <span className="text-teal-600">innovative analytics research.</span>
              </h2>
              <p className="text-lg leading-relaxed text-slate-500">
                The exponential growth of health data — electronic health records, wearable devices, genomic sequencing,
                and digital health technologies generates vast data daily. While this holds the potential to
                revolutionise personalised medicine and improve patient outcomes, managing and analysing it effectively
                remains a significant challenge.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Addressing the data deluge requires coordinated efforts in data governance, advanced analytics, machine
                learning, and scalable infrastructure for storage, processing, and secure sharing of health data.
              </p>
            </div>

            {/* Right — Image 3: patient data circle (fits the data deluge context) */}
            <div className="relative w-full h-80 lg:h-96 rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
              <Image
                src="/image/dataCircle.png"
                alt="A single patient produces 80+ megabytes of medical data every year"
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. VISION STATEMENT
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-[#eef3f2]">
        <div className="mx-auto max-w-6xl px-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Image 2: Global Health Data Initiative Flow */}
            <div className="relative w-full h-80 lg:h-[480px] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm order-2 lg:order-1">
              <Image
                src="/image/healthFlow.png"
                alt="Global Health Data Initiative Flow: Audited Process and Metrics"
                fill
                className="object-contain p-4"
              />
            </div>

            {/* Right — vision text */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase mb-3">
                Our Vision
              </p>
              <h2 className="text-3xl font-semibold text-slate-900 leading-snug mb-6">
                Empowering the next generation of{' '}
                <span className="text-teal-600">health data scientists.</span>
              </h2>
              <p className="text-lg leading-relaxed text-slate-500 mb-6">
                Our vision is to solve complex health problems using data-driven approaches while empowering a new
                generation of health data scientists. Students will work collaboratively in interdisciplinary teams with
                internationally acclaimed scientists and use existing data to make impactful contributions to the field.
              </p>
              <p className="text-lg leading-relaxed text-slate-500">
                Our trainees will partner with local and top international universities, hospitals, and industries to
                tackle real-world problems — working hand in hand with the government to make the National Health
                Mission successful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. OBJECTIVES
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">

          <div className="text-center mb-14">
            <div className="inline-flex rounded-full border border-slate-300 bg-[#eef3f2] px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase mb-8">
              Objectives
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">
              What we set out to{' '}
              <span className="text-teal-600">achieve.</span>
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-teal-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((obj, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 hover:border-teal-300 bg-[#eef3f2] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-teal-500 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <p className="text-xs font-bold text-teal-500 mb-3 tracking-widest uppercase">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{obj.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

 
      <section className="py-20 bg-[#eef3f2]">
        <div className="mx-auto max-w-6xl px-6">

          <div className="text-center mb-14">
            <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase mb-8">
              Our Team
            </div>
            <h2 className="text-3xl font-semibold text-slate-900">
              The core team behind{' '}
              <span className="text-teal-600">Health Data Science Academy.</span>
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-teal-600" />
          </div>

          {/* Core team cards — style from reference image */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {coreTeam.map((member) => (
              <div
                key={member.name}
                className="group w-56 rounded-3xl border border-slate-200 hover:border-teal-300 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden text-center"
              >
                {/* Photo area */}
               {/* Photo area */}
<div className="relative w-full h-52 bg-slate-100">
  {member.src ? (
    <Image
      src={member.src}
      alt={member.name}
      fill
      className="object-cover object-top"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
      <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    </div>
  )}
</div>

                {/* Info */}
                <div className="px-4 py-5">
                  <p className="font-bold text-slate-900 text-base leading-snug">{member.name}</p>
                  <p className="mt-1 text-xs font-semibold tracking-widest text-teal-600 uppercase">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">

          {/* Image 1: Org chart — programme structure */}
          <div className="text-center mb-6">
            <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase mb-2">Programme Structure</p>
            <h3 className="text-2xl font-semibold text-slate-900">How the Academy is <span className="text-teal-600">organised.</span></h3>
            <div className="mx-auto mt-3 h-px w-24 bg-teal-600 mb-10" />
          </div>
          <div className="relative w-full h-[420px] lg:h-[540px] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm mb-12">
            <Image
              src="/image/orgChart.png"
              alt="Academy programme structure: Advisory Board → Leadership Team → Experts → Scientists → Programme Manager → Problem Groups"
              fill
              className="object-contain p-6"
            />
          </div>

          {/* Closing statement */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xl leading-relaxed text-slate-500">
              Guided by an international advisory board and a local leadership team of leading experts in
              Biology, Clinic, and Data Science we are committed to making data-driven healthcare
              a reality for all.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}