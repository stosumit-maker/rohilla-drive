import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#08111F",borderRadius:"108px"}}>
      <div style={{width:"360px",height:"360px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"90px",background:"#0E1B2D",border:"18px solid #2F6BFF",color:"white",fontSize:"172px",fontWeight:900,letterSpacing:"-20px",paddingRight:"20px",position:"relative"}}>
        RD
        <div style={{position:"absolute",width:"12px",height:"210px",background:"#D6B25E",borderRadius:"999px",transform:"rotate(12deg)"}}/>
      </div>
    </div>,
    size,
  );
}
