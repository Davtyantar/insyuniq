// Listing photos uploaded through the API are served from Supabase storage (ruling R14).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePattern = supabaseUrl
  ? (() => {
      const { protocol, hostname } = new URL(supabaseUrl);
      return { protocol: protocol.replace(":", ""), hostname, pathname: "/storage/v1/object/public/**" };
    })()
  : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      ...(supabasePattern ? [supabasePattern] : []),
    ],
  },
};

export default nextConfig;
