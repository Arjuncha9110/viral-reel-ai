import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContent } from "./App";
import { getCollectedSeo, resetCollectedSeo, type CollectedSeo } from "./seo/seoCollector";
import { AuthContext } from "./context/AuthContext";

export { seoRoutes } from "./seo/routes";

export interface RenderResult {
  html: string;
  seo: CollectedSeo | null;
}

/**
 * Build-time prerender entry. scripts/prerender.mjs calls render() for every
 * route in seoRoutes and writes the result as static HTML into dist/, so
 * crawlers receive full content and correct per-page metadata without
 * executing JavaScript.
 */
export function render(url: string): RenderResult {
  resetCollectedSeo();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StaticRouter location={url}>
          <AuthContext.Provider value={{ 
            currentUser: null, 
            loading: false, 
            login: async () => { throw new Error("SSR"); }, 
            logout: async () => {}, 
            register: async () => { throw new Error("SSR"); }, 
            googleLogin: async () => { throw new Error("SSR"); }, 
            forgotPassword: async () => {} 
          }}>
            <AppContent />
          </AuthContext.Provider>
        </StaticRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );

  return { html, seo: getCollectedSeo() };
}
