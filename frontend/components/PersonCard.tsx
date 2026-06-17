'use client';

import { useState } from 'react';

interface PersonCardProps {
  name: string;
  role: string;
  affiliation: string;
  image: string;
  size?: 'lg' | 'sm';
}

export default function PersonCard({ name, role, affiliation, image, size = 'sm' }: PersonCardProps) {
  const [imgError, setImgError] = useState(false);
  const imgSize = size === 'lg' ? 'h-56 w-56' : 'h-44 w-44';
  const initial = name.charAt(0);

  return (
    <div className={`flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-md ${size === 'lg' ? 'p-8' : 'p-6'}`}>
      <div className={`${imgSize} overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center`}>
        {imgError ? (
          <span className={`font-bold text-slate-300 ${size === 'lg' ? 'text-5xl' : 'text-4xl'}`}>
            {initial}
          </span>
        ) : (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h4 className={`mt-4 font-semibold text-slate-900 ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
        {name}
      </h4>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-teal-600">{role}</p>
      <p className={`mt-1 leading-relaxed text-slate-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
        {affiliation}
      </p>
    </div>
  );
}