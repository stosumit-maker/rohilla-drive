export type RohillaLanguage={code:string;translationCode:string;name:string;nativeName:string;speechCode:string;operatorLabel:string};

export const ROHILLA_LANGUAGES:RohillaLanguage[]=[
 {code:"en-IN",translationCode:"en",name:"English",nativeName:"English",speechCode:"en-IN",operatorLabel:"English"},
 {code:"hi-IN",translationCode:"hi",name:"Hindi",nativeName:"हिन्दी",speechCode:"hi-IN",operatorLabel:"Hindi"},
 {code:"pa-IN",translationCode:"pa",name:"Punjabi",nativeName:"ਪੰਜਾਬੀ",speechCode:"pa-IN",operatorLabel:"Punjabi"},
 {code:"kn-IN",translationCode:"kn",name:"Kannada",nativeName:"ಕನ್ನಡ",speechCode:"kn-IN",operatorLabel:"Kannada"},
 {code:"ta-IN",translationCode:"ta",name:"Tamil",nativeName:"தமிழ்",speechCode:"ta-IN",operatorLabel:"Tamil"},
 {code:"te-IN",translationCode:"te",name:"Telugu",nativeName:"తెలుగు",speechCode:"te-IN",operatorLabel:"Telugu"},
 {code:"ml-IN",translationCode:"ml",name:"Malayalam",nativeName:"മലയാളം",speechCode:"ml-IN",operatorLabel:"Malayalam"},
 {code:"mr-IN",translationCode:"mr",name:"Marathi",nativeName:"मराठी",speechCode:"mr-IN",operatorLabel:"Marathi"},
 {code:"gu-IN",translationCode:"gu",name:"Gujarati",nativeName:"ગુજરાતી",speechCode:"gu-IN",operatorLabel:"Gujarati"},
 {code:"bn-IN",translationCode:"bn",name:"Bengali",nativeName:"বাংলা",speechCode:"bn-IN",operatorLabel:"Bengali"},
 {code:"or-IN",translationCode:"or",name:"Odia",nativeName:"ଓଡ଼ିଆ",speechCode:"or-IN",operatorLabel:"Odia"},
 {code:"ur-IN",translationCode:"ur",name:"Urdu",nativeName:"اردو",speechCode:"ur-IN",operatorLabel:"Urdu"}
];

export const DEFAULT_CUSTOMER_LANGUAGE="en-IN";
export const DEFAULT_OPERATOR_LANGUAGE="hi-IN";
export const LANGUAGE_STORAGE_KEY="rohilla_drive_language";
export function languageByCode(code?:string|null){return ROHILLA_LANGUAGES.find(x=>x.code===code)||ROHILLA_LANGUAGES[0]}
