import { useEffect, useState, useRef } from "react";

interface AdSenseBannerProps {
  adSlot?: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AdSenseBanner = ({
  adSlot = "1234567890", // Default placeholder slot
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
  style = {},
}: AdSenseBannerProps) => {
  const [isDev, setIsDev] = useState(false);
  const [adStatus, setAdStatus] = useState<"loading" | "filled" | "unfilled" | "blocked">("loading");
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Check if we are running in localhost / local development
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    setIsDev(isLocal);

    if (isLocal) {
      setAdStatus("filled");
      return;
    }

    try {
      // Safely initialize the AdSense ad unit on mount
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.warn("AdSense push warning (expected in local dev/ad-blockers):", e);
    }

    const insElement = insRef.current;
    if (!insElement) return;

    // Observe changes to 'data-ad-status' attribute injected by AdSense
    const observer = new MutationObserver(() => {
      const status = insElement.getAttribute("data-ad-status");
      if (status === "filled") {
        setAdStatus("filled");
      } else if (status === "unfilled") {
        setAdStatus("unfilled");
      }
    });

    observer.observe(insElement, { attributes: true, attributeFilter: ["data-ad-status"] });

    // Fallback/Timeout for script blocking or unfilled ads
    const checkTimeout = setTimeout(() => {
      const adsbygoogle = (window as any).adsbygoogle;
      const status = insElement.getAttribute("data-ad-status");

      if (status === "filled") {
        setAdStatus("filled");
      } else if (status === "unfilled" || !adsbygoogle || insElement.offsetHeight === 0) {
        setAdStatus("unfilled");
      }
    }, 3000); // 3 seconds timeout limit

    return () => {
      observer.disconnect();
      clearTimeout(checkTimeout);
    };
  }, [adSlot]);

  // Hide the banner completely if it failed to load or is unfilled
  if (adStatus === "unfilled" || adStatus === "blocked") return null;

  // Dev mode placeholder
  if (isDev) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30 text-xs text-muted-foreground ${className}`}
        style={{ minHeight: 90, ...style }}
      >
        AdSense Placeholder [{adSlot}]
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
};
