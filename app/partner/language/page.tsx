import type {Metadata} from "next";
import TranslatorDesk from "../../components/TranslatorDesk";
export const metadata:Metadata={title:"Language Operations",description:"Partner multilingual communication and authorised interpretation workspace.",alternates:{canonical:"/partner/language"}};
export default function PartnerLanguage(){return <TranslatorDesk title="Partner Language Support" defaultOperator="hi-IN" actorRole="partner"/>}
