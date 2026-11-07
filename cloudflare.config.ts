import { bindings, defineConfig, defineWorker, exports } from "cf/config";

export default defineConfig({
  accountId: "5a9069051aee785c5e4aa92aea40f27d",
  worker: defineWorker({
    name: "mahato-net-cafe",
    entrypoint: "./worker/index.ts",
    exports: {
      SiteRenderer: exports.durableObject({ storage: "sqlite" }),
    },
    compatibilityDate: "2026-11-07",
    compatibilityFlags: ["nodejs_compat"],
    domains: ["mahatocafe.tech", "www.mahatocafe.tech"],
    workersDev: false,
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      RENDERER: bindings.durableObject({ worker: "mahato-net-cafe", exportName: "SiteRenderer" }),
      DB: bindings.d1({ name: "mahato-net-cafe" }),
      ADMIN_MOBILE: bindings.text("7870499793"),
      GITHUB_REPO: bindings.text("mahatonetcafe/mahato-documents"),
      GITHUB_BRANCH: bindings.text("main"),
    },
  }),
});
