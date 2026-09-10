"use client";

import { usePathname } from "next/navigation";
import { CosmicRadio } from "./CosmicRadio";
import { InteractiveSky } from "./InteractiveSky";
import { PetCat } from "./PixelPet";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/os-joe/" || pathname === "/os-joe") return <>{children}</>;

  

  return (
    <div className="os-root">
      <InteractiveSky
        owner="Joe's"
        storageKey="os-joe-sky-preset"
        assetPrefix="/os-joe"
      />
      <CosmicRadio
        owner="Joe"
        storageKey="os-joe-cosmic-radio-volume"
        petSrc="/os-joe/radio-pet.png"
      />
      <SiteHeader />
      <div className="os-workspace">
        {children}
        {pathname !== "/os-joe/shelf" && <SiteFooter />}
      </div>
      <PetCat />
    </div>
  );
}
