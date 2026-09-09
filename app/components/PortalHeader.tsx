"use client";

import {usePathname} from "next/navigation";
import type {ReactNode} from "react";

type Item={href:string;label:string;exact?:boolean};

export default function PortalHeader({workspace,subtitle,homeHref,items,utilities,ops}:{workspace:string;subtitle:string;homeHref:string;items:Item[];utilities?:ReactNode;ops?:ReactNode}){
 const path=usePathname();
 return <div className="rdPortalTopbar" data-no-translate="true">
  <div className="rdPortalTopbarInner">
   <a className="rdPortalIdentity" href={homeHref} aria-label={`${workspace} home`}>
    <span className="rdPortalMonogram">RD</span>
    <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>{workspace} • {subtitle}</small></span>
   </a>
   <nav className="rdPortalNav" aria-label={`${workspace} navigation`}>
    {items.map(item=>{const active=item.exact?path===item.href:path===item.href||path.startsWith(`${item.href}/`);return <a key={item.href} className={active?"active":undefined} href={item.href}>{item.label}</a>})}
   </nav>
   <div className="rdPortalUtilities">
    {utilities}
    <a className="premium" href="/" target="_self">Customer Site</a>
   </div>
  </div>
  {ops&&<div className="rdPortalOps"><div className="rdPortalOpsInner">{ops}</div></div>}
 </div>;
}
