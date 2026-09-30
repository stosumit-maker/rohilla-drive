export default function LegalFooter(){
  return <div className="legalFooter" data-no-translate="true" style={{borderTop:"1px solid #d9dee8",background:"#f8fafc",padding:"14px 14px 72px",textAlign:"center",fontSize:12,lineHeight:1.45,color:"#475569"}}>
    <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:7}}>
      <a href="/inventory" style={{fontWeight:800,color:"#0f172a"}}>Browse Cars</a>
      <a href="/sell-car-ambala" style={{fontWeight:800,color:"#0f172a"}}>Sell Your Car</a>
      <a href="/car-services/ambala" style={{fontWeight:800,color:"#0f172a"}}>Vehicle Services</a>
    </div>
    <div style={{marginBottom:7}}>
      <strong>Rohilla Multibrand Cars</strong> • Baldev Nagar, Ambala City • <a href="tel:+917015260003">7015260003</a>
    </div>
    <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
      <a href="/terms" style={{fontWeight:700,color:"#334155"}}>Terms</a>
      <a href="/privacy" style={{fontWeight:700,color:"#334155"}}>Privacy</a>
      <a href="/disclaimer" style={{fontWeight:700,color:"#334155"}}>Disclaimer</a>
      <a href="https://www.google.com/search?kgmid=/g/11v13gyn6y&q=Rohilla+Multibrand+Cars" target="_blank" rel="noopener noreferrer" style={{fontWeight:700,color:"#334155"}}>Google Profile</a>
    </div>
  </div>;
}
