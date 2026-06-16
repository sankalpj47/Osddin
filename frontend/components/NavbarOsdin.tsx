import { MenuIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from './ui/banner';
import { Button, buttonVariants } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { navLinks } from '@/lib/data';

export default function NavbarOsdin() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal-800 text-white">
      <Banner>
        This website is for <b className="font-semibold">academic use</b> only. Please refer to the
        <Link href="/docs/LICENSE" className="ml-1 underline">
          LICENSE
        </Link>
      </Banner>

<div className="flex items-center justify-between px-16 py-3">

  <div className="flex-1 flex justify-start pl-8">
    <Link href="/" className="flex items-center gap-3">
      <Image src="/image/osddin-logo.png" alt="OSDDIN" width={250} height={28} />
    </Link>
  </div>

  <div className="flex-1 flex justify-end pr-8">
    <nav className="hidden md:flex  items-center gap-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={buttonVariants({
            variant: 'ghost',
            className: 'hover:bg-teal-700  flex items-center gap-2 ',
          })}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>


    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-teal-600 md:hidden">
          <MenuIcon className="size-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-black text-lg" align="end">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              {link.icon}
              <span>{link.label}</span>
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

</div>
    </header>
  );
}