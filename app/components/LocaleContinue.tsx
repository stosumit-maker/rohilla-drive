"use client";
import {useRouter} from "next/navigation";
import {LANGUAGE_STORAGE_KEY} from "../lib/rohilla-languages";

const codes:Record<string,string>={en:"en-IN",hi:"hi-IN",pa:"pa-IN",kn:"kn-IN",ta:"ta-IN",te:"te-IN",ml:"ml-IN",mr:"mr-IN",gu:"gu-IN",bn:"bn-IN",or:"or-IN",ur:"ur-IN"};
export default function LocaleContinue({locale,label}:{locale:string;label:string}){const router=useRouter();return <button onClick={()=>{localStorage.setItem(LANGUAGE_STORAGE_KEY,codes[locale]||"en-IN");router.push("/")}}>{label}</button>}
