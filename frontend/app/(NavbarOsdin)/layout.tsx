import NavbarOsdin from '@/components/NavbarOsdin';

export default function NavbarOsdinLayout({children,}: {children: React.ReactNode;
}){
  return (
      <div className='flex min-h-screen flex-col justify-between'>
      <NavbarOsdin />
      <div className='pt-10 lg:pt-20'>{children}</div>
    </div>
  );
}