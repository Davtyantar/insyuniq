import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: "Անշարժ գույքի, ավտոմեքենաների, վարձակալության և աշխատանքի հայտարարություններ Սյունիքի մարզում։",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "hy",
    icons: [{ src: "/icon.png", sizes: "566x566", type: "image/png", purpose: "any" }],
  };
}
