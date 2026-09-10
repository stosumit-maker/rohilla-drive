import type {Metadata} from "next";
import TranslatorDesk from "../../components/TranslatorDesk";
export const metadata:Metadata={title:"Language Operations",description:"Dealer multilingual communication and authorised interpretation workspace.",alternates:{canonical:"/dealer/language"}};
export default function DealerLanguage(){return <TranslatorDesk title="Dealer Language Support" defaultOperator="hi-IN" actorRole="dealer"/>}
