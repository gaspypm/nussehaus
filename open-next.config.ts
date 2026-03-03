import { defineConfig } from "open-next";
import cloudflare from "@opennextjs/cloudflare";

export default defineConfig({
    adapters: [cloudflare()],
});