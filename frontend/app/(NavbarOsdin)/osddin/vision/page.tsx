import Link from 'next/link';

const visionItems = [
  {
    number: '01',
    title: 'Computational Resources',
  },
  {
    number: '02',
    title: 'Open Source Promotion',
  },
  {
    number: '03',
    title: 'Human Resource Development',
    description: 'Training researchers and developers to contribute and innovate in drug discovery.',
  },
  {
    number: '04',
    title: 'Need-Based Research',
    description: 'Research driven by real healthcare needs and long-term societal impact.',
  },
];

function VisionDescription({ number }: { number: string }) {
  if (number === '01') {
    return (
      <>
        <Link href="/osddin/crdd" className="font-medium text-teal-600 hover:underline">CRDD</Link>
        {' '}provides computational tools and resources for in silico drug discovery.
      </>
    );
  }

  if (number === '02') {
    return (
      <>
        Open-source cheminformatics resources published on{' '}
        <a href="https://github.com/raghavagps" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">GitHub</a>
        {' '}and{' '}
        <a href="https://zenodo.org/communities/raghavagps/" target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">Zenodo</a>.
      </>
    );
  }

  return null;
}

export default function VisionPage() {
  return (
    <section className="bg-[#eef3f2] py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">

        <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-md font-medium tracking-[0.3em] text-slate-600 uppercase">
          Our Vision
        </div>

        <h1 className="mt-8 text-4xl font-medium tracking-tight text-slate-900">
          A unified ecosystem for{' '}
          <span className="text-teal-600">
            open
            drug discovery.
          </span>
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

        <p className="mx-auto mt-8 max-w-5xl text-xl leading-relaxed text-slate-500">
          OSDDIN is a web-based platform delivering curated biomedical data from hundreds of sources as a
          biomedical knowledge graph for open-source drug discovery. Backed by persistent GitHub & Zenodo
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
                  {item.description ?? <VisionDescription number={item.number} />}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}