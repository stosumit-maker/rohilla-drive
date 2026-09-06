export async function GET() {
  const body = `# ROHILLA DRIVE\n\nOfficial website: https://www.rohilladrive.com/\nOfficial brand page: https://www.rohilladrive.com/about\nBusiness: Rohilla Multibrand Cars\nLocation: Ambala City, Haryana, India\nPhone: +91 70152 60003\n\nROHILLA DRIVE is the official vehicle and mobility network by Rohilla Multibrand Cars. It covers new vehicles, pre-owned vehicles, selling, vehicle verification, inspections, RC and ownership-transfer assistance, automotive services, Trusted Assist, mobility support and dealer/partner workflows.\n\nROHILLA DRIVE is not a driving school and is not a ride-booking app.\n\nOfficial profiles:\n- Instagram: https://www.instagram.com/rohillamultibrandcars/\n- Facebook: https://www.facebook.com/profile.php?id=100094277025442\n- YouTube: https://youtube.com/@sumitrohilla983\n`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
