import { ImageResponse } from "next/og";

export const alt = "ROHILLA DRIVE — Buy, Sell & Find Cars in Ambala";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"64px 72px",background:"#08111F",color:"white",fontFamily:"Arial, Helvetica, sans-serif"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:28,fontWeight:800,color:"#D6B25E",letterSpacing:2}}>ROHILLA DRIVE • AMBALA</div>
          <div style={{fontSize:82,fontWeight:900,lineHeight:1}}>Buy. Sell. Find the right car.</div>
          <div style={{fontSize:34,fontWeight:700,color:"#DCE6F5"}}>Used Cars • New Cars • Vehicle Services</div>
          <div style={{fontSize:28,color:"#9FB4D1",marginTop:10}}>Meet CarMentor — smart car guidance by Rohilla Drive.</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",width:"100%"}}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:26,fontWeight:800}}>Rohilla Multibrand Cars • Ambala City</div>
            <div style={{fontSize:24,color:"#CBD5E1"}}>7015260003</div>
          </div>
          <div style={{fontSize:32,fontWeight:900,color:"#2F6BFF"}}>rohilladrive.com</div>
        </div>
      </div>
    ),
    size,
  );
}
