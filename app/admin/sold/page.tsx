import type {Metadata} from "next";
import SoldHistoryClient from "./SoldHistoryClient";

export const metadata:Metadata={title:"Sold History"};
export default function Page(){return <SoldHistoryClient/>}
