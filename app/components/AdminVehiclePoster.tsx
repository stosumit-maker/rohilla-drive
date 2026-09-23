"use client";

import {useEffect,useState} from "react";

type Props={
 fields:any;
 photoFile?:File|null;
};

function clean(value:any){return String(value??"").trim()}
function publicPrefix(value:any){
 const normalized=clean(value).toUpperCase().replace(/[^A-Z0-9]/g,"");
 const match=normalized.match(/^([A-Z]{2})(\d{2})/);
 return match?match[1]+match[2]:"";
}
function money(value:any){
 const n=Number(value||0);
 return n?new Intl.NumberFormat("en-IN").format(n):"—";
}
function cover(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number){
 const scale=Math.max(w/img.width,h/img.height);
 const sw=w/scale,sh=h/scale;
 const sx=(img.width-sw)/2,sy=(img.height-sh)/2;
 ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
function fitText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number,start:number,min=30){
 let size=start;
 while(size>min){ctx.font=`800 ${size}px Arial, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size-=2}
 return size;
}

export default function AdminVehiclePoster({fields,photoFile}:Props){
 const [preview,setPreview]=useState("");
 const enough=Boolean(photoFile&&fields?.brand&&fields?.model&&fields?.year&&fields?.price);

 useEffect(()=>{
  if(!photoFile||!enough){setPreview("");return}
  const objectUrl=URL.createObjectURL(photoFile);
  let cancelled=false;
  const img=new Image();
  img.onload=()=>{
   if(cancelled)return;
   const canvas=document.createElement("canvas");
   canvas.width=1080;canvas.height=1350;
   const ctx=canvas.getContext("2d");if(!ctx)return;
   ctx.fillStyle="#0d1117";ctx.fillRect(0,0,1080,1350);
   cover(ctx,img,0,0,1080,760);
   const gradient=ctx.createLinearGradient(0,520,0,790);
   gradient.addColorStop(0,"rgba(13,17,23,0)");
   gradient.addColorStop(1,"rgba(13,17,23,1)");
   ctx.fillStyle=gradient;ctx.fillRect(0,500,1080,310);

   ctx.fillStyle="#ffffff";ctx.font="800 40px Arial, sans-serif";ctx.fillText("ROHILLA DRIVE",54,66);
   ctx.font="600 21px Arial, sans-serif";ctx.fillText("by Rohilla Multibrand Cars • Ambala City",54,98);
   ctx.textAlign="right";ctx.font="700 23px Arial, sans-serif";ctx.fillText("FOR SALE",1026,68);ctx.textAlign="left";

   const title=[fields.year,fields.brand,fields.model,fields.variant].filter(Boolean).join(" ");
   const titleSize=fitText(ctx,title,972,58,38);
   ctx.font=`800 ${titleSize}px Arial, sans-serif`;ctx.fillStyle="#ffffff";ctx.fillText(title,54,830);

   const specs=[
    fields.fuel,
    fields.km?Number(fields.km).toLocaleString("en-IN")+" km": "",
    fields.owner_count?fields.owner_count+" Owner":"",
    publicPrefix(fields.registration_number)
   ].filter(Boolean).join("  •  ");
   ctx.font="600 28px Arial, sans-serif";ctx.fillStyle="#d7dde5";ctx.fillText(specs,54,885);

   ctx.fillStyle="#ffffff";ctx.font="800 70px Arial, sans-serif";ctx.fillText("₹"+money(fields.price),54,990);
   ctx.font="600 27px Arial, sans-serif";ctx.fillStyle="#d7dde5";ctx.fillText(clean(fields.city)||"Ambala City",54,1040);

   ctx.fillStyle="#ffffff";ctx.fillRect(54,1090,972,2);
   ctx.font="700 32px Arial, sans-serif";ctx.fillText("Call / WhatsApp  7015260003",54,1160);
   ctx.font="500 23px Arial, sans-serif";ctx.fillStyle="#c7cdd6";ctx.fillText("Real vehicle photo • Details subject to verification",54,1210);
   ctx.font="700 24px Arial, sans-serif";ctx.fillStyle="#ffffff";ctx.fillText("www.rohilladrive.com",54,1275);

   setPreview(canvas.toDataURL("image/png"));
  };
  img.src=objectUrl;
  return()=>{cancelled=true;URL.revokeObjectURL(objectUrl)};
 },[photoFile,enough,fields?.brand,fields?.model,fields?.variant,fields?.year,fields?.km,fields?.fuel,fields?.owner_count,fields?.price,fields?.city,fields?.registration_number]);

 function download(){
  if(!preview)return;
  const a=document.createElement("a");
  const name=[fields?.year,fields?.brand,fields?.model].filter(Boolean).join("-").replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-");
  a.href=preview;a.download=(name||"rohilla-drive-vehicle")+"-poster.png";a.click();
 }

 return <div className="adminAutoPoster">
  <div className="adminAutoPosterHead"><div><b>Auto Poster</b><small>Generated automatically from the first selected real photo and vehicle details.</small></div>{preview&&<button type="button" onClick={download}>Download Poster PNG</button>}</div>
  {preview?<img src={preview} alt="Automatically generated vehicle sale poster preview"/>:<p>Select the first vehicle photo and fill Year, Brand, Model and Price. The poster will appear here automatically.</p>}
 </div>
}
