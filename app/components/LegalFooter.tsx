export default function LegalFooter(){
  return <div className="legalFooter" data-no-translate="true" style={{borderTop:"1px solid #d9dee8",background:"#f8fafc",padding:"18px 16px 96px",textAlign:"center",fontSize:13,lineHeight:1.6,color:"#475569"}}>
    <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
      <a href="/inventory" style={{fontWeight:800,color:"#0f172a"}}>Available Cars</a>
      <a href="/sell-car-ambala" style={{fontWeight:800,color:"#0f172a"}}>Sell Your Car</a>
      <a href="/car-services/ambala" style={{fontWeight:800,color:"#0f172a"}}>Vehicle Services</a>
    </div>
    <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
      <a href="/terms" style={{fontWeight:700,color:"#334155"}}>Terms</a>
      <a href="/privacy" style={{fontWeight:700,color:"#334155"}}>Privacy</a>
      <a href="/disclaimer" style={{fontWeight:700,color:"#334155"}}>Disclaimer</a>
    </div>
    <span>ROHILLA DRIVE • Rohilla Multibrand Cars • Ambala City • 7015260003</span>
  </div>;
}
