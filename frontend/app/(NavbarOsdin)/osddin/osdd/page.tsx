const osddItems = [
  {
    number: '01',
    title: 'Global Community',
    description:
      'A worldwide network of over 7,500 researchers, students, and professionals from more than 130 countries.',
  },
  {
    number: '02',
    title: 'Open Collaboration',
    description:
      'An open-source platform where academia, industry, and institutions work together to accelerate drug discovery.',
  },
  {
    number: '03',
    title: 'Neglected Diseases',
    description:
      'Focused on tropical and neglected diseases such as leishmaniasis that receive limited commercial research attention.',
  },
  {
    number: '04',
    title: 'Affordable Innovation',
    description:
      'Developing accessible and cost-effective medicines through transparent, community-driven scientific research.',
  },
];

export default function OSDDPage() {
  return (
    <section className="bg-[#eef3f2] py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex rounded-full border border-slate-300 bg-white px-6 py-2 text-xs uppercase tracking-[0.3em] text-slate-600">
          Open Source Drug Discovery
        </div>

        <h1 className="mt-8 text-5xl font-medium tracking-tight text-slate-900">
          Collaborative science for{' '}
          <span className="text-teal-600">
            affordable
            <br />
            drug discovery.
          </span>
        </h1>

        <div className="mx-auto mt-6 h-px w-24 bg-teal-600" />

        <p className="mx-auto mt-8 max-w-5xl text-xl leading-relaxed text-slate-500">
          Open Source Drug Discovery (OSDD) is a CSIR-led Team India Consortium
          with global participation, bringing together researchers, academia,
          students, industries, and institutions to collaboratively discover
          affordable treatments for neglected tropical diseases. The initiative
          operates through an open-source model that enables contributors from
          around the world to share knowledge, resources, and expertise in the
          pursuit of accessible healthcare solutions.
        </p>

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
  <div className="grid gap-6 md:grid-cols-3">
    <div>
      <h3 className="text-4xl font-bold text-teal-600">7500+</h3>
      <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
        Contributors
      </p>
    </div>

    <div>
      <h3 className="text-4xl font-bold text-teal-600">130+</h3>
      <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
        Countries
      </p>
    </div>

    <div>
      <h3 className="text-4xl font-bold text-teal-600">CSIR</h3>
      <p className="mt-2 text-sm uppercase tracking-wider text-slate-500">
        Led Initiative
      </p>
    </div>
  </div>
</div>

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

                <p className="text-lg leading-relaxed text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}