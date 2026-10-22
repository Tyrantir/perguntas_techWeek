/**
 * Páginas criadas pelos participantes. Cada uma mora em `src/app/paginas/<slug>/page.tsx`
 * e precisa de uma entrada aqui para aparecer na home. Mais recentes no fim da lista.
 */
export type PageEntry = {
  slug: string;
  author: string;
  title: string;
  description: string;
  /** Cor de destaque do card na home (qualquer cor CSS). */
  accent: string;
};

export const pages: PageEntry[] = [];

export function pageHref(slug: string) {
  return `/paginas/${slug}`;
}
