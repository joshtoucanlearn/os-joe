"use client";

import { usePathname } from "next/navigation";
import { PetCat } from "./PixelPet";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  

  return (
    <div className="os-root">
      <div className="os-space" aria-hidden="true">
        <span className="os-nebula" />
        <span className="pixel-galaxy os-starfield" />
      </div>
      <SiteHeader />
      <div className="os-workspace">
        {children}
        {pathname !== "/os-joe/shelf" && <SiteFooter />}
      </div>
      <PetCat />
    </div>
  );
}
