import Link from 'next/link';
import { getStartedLinks } from '@/lib/data';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto'>
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='mb-10 flex w-full flex-col gap-4'>
          <div className='container'>{children}</div>
        </div>
      </div>

      <section className='mt-10 flex flex-col items-center'>
        <h1 className='mt-4 font-semibold text-2xl tracking-tight md:text-4xl'>
          <b className='bg-linear-to-r from-teal-800 via-teal-600 to-teal-800 bg-clip-text text-transparent'>
            Get Started
          </b>{' '}
          with the Tool
        </h1>
        <div className='mt-4 flex justify-center gap-4'>
          {getStartedLinks.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className='group hover:-translate-y-1 relative flex flex-col items-center rounded-lg p-6 text-center transition-all duration-300'
            >
              <div className='relative'>
                <div className='absolute inset-0 rotate-45 scale-110 rounded-lg bg-teal-800/10 transition-all duration-300 group-hover:rotate-90 group-hover:scale-125' />
                <div className='relative rounded-lg bg-teal-800 p-4 text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-teal-800/20'>
                  {item.icon}
                </div>
              </div>
              <h3 className='mt-6 font-semibold text-gray-900 text-lg'>{item.title}</h3>
              <p className='mt-2 text-gray-600 text-sm'>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
