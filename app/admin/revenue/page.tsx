import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Revenue & Collections",description:"Track ROHILLA DRIVE revenue opportunities, agreed fees, invoicing and receipts.",alternates:{canonical:"/admin/revenue"}};
export default function Page(){return <PageClient/>}
