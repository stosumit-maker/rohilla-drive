import {notFound,redirect} from "next/navigation";

const locales=new Set(["en","hi","pa","kn","ta","te","ml","mr","gu","bn","or","ur"]);

export function generateStaticParams(){
  return [...locales].map(locale=>({locale}));
}

export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!locales.has(locale))notFound();
  redirect("/");
}
