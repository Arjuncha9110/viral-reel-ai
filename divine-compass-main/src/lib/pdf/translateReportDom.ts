import { lookupTranslation, shouldPreserveSourceText, translateStrings } from "./preTranslate";

const NON_TEXT_PATTERN = /^[\d°′″\s./,:;|()[\]{}\-–—+*%]+$/;

interface ReportTextNodeEntry {
  node: Text;
  original: string;
  leading: string;
  trailing: string;
  clean: string;
}

function collectReportTextNodes(root: HTMLElement): ReportTextNodeEntry[] {
  const entries: ReportTextNodeEntry[] = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node.nodeValue ?? "";
        const clean = text.trim();
        const parent = node.parentElement;

        if (!parent || !clean) {
          return NodeFilter.FILTER_REJECT;
        }

        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (parent.closest('[data-no-translate="true"]')) {
          return NodeFilter.FILTER_REJECT;
        }

        if (NON_TEXT_PATTERN.test(clean)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (shouldPreserveSourceText(clean)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    const original = textNode.nodeValue ?? "";
    const clean = original.trim();
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";

    entries.push({
      node: textNode,
      original,
      leading,
      trailing,
      clean,
    });

    current = walker.nextNode();
  }

  return entries;
}

export async function translateReportDom(
  root: HTMLElement,
  targetLang: "kn",
  onProgress?: (progress: number) => void
): Promise<void> {
  let entries = collectReportTextNodes(root);
  const missing = Array.from(
    new Set(
      entries
        .map((entry) => entry.clean)
        .filter((text) => !shouldPreserveSourceText(text) && !lookupTranslation(text))
    )
  );

  if (missing.length > 0) {
    await translateStrings(missing, targetLang, onProgress);
    // Re-read text nodes after async work in case React refreshed the DOM.
    entries = collectReportTextNodes(root);
  }

  for (const entry of entries) {
    if (shouldPreserveSourceText(entry.clean)) {
      continue;
    }

    const translated = lookupTranslation(entry.clean);
    if (!translated || translated === entry.clean) {
      continue;
    }

    entry.node.nodeValue = `${entry.leading}${translated}${entry.trailing}`;
  }
}
