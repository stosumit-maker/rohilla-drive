const privateNoIndex=["/admin/:path*","/dealer/:path*","/partner/:path*","/reset-password","/deal-room/:path*"];

const nextConfig={
  async headers(){
    return privateNoIndex.map(source=>({
      source,
      headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]
    }));
  }
};

export default nextConfig;
