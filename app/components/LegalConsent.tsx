export default function LegalConsent({regulated=false}:{regulated?:boolean}){
  return <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,lineHeight:1.5,color:"#475569",gridColumn:"1 / -1"}}>
    <input type="checkbox" required name="legal_consent" style={{marginTop:4,width:18,height:18,flex:"0 0 auto"}}/>
    <span>
      I confirm the information is accurate and accept the <a href="/terms" target="_blank" rel="noreferrer">Terms & Conditions</a>. I have read the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Notice</a> and <a href="/disclaimer" target="_blank" rel="noreferrer">Platform Disclaimer</a>.
      {regulated?" I also confirm that I hold and will maintain any licence, registration, OEM authorisation or statutory approval required for the services I offer.":""}
    </span>
  </label>;
}
