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

export const pages: PageEntry[] = [
  {
    slug: "lucas",
    author: "Lucas",
    title: "Jesus na Praça",
    description: "Landing urbana e grunge, amarelo e preto, do encontro de jovens de 31/10 às 19h00.",
    accent: "#ffe500",
  },
  {
    slug: "luiz-correia",
    author: "Luiz Correia",
    title: "Brasil no Servidor",
    description: "Hall da Fama gamer do Counter-Strike brasileiro, com os momentos históricos no rodapé.",
    accent: "#00ff6a",
  },
];

export function pageHref(slug: string) {
  return `/paginas/${slug}`;
}
