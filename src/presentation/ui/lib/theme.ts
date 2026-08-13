export type Tema = "light" | "dark" | "system";

const CHAVE_STORAGE = "painel:tema";
const EVENTO_MUDANCA = "painel:tema-mudou";

export function aplicarTema(tema: Tema): void {
  const root = document.documentElement;
  const escuro = tema === "dark" || (tema === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", escuro);
  root.setAttribute("data-theme", tema);
}

export function salvarTema(tema: Tema): void {
  localStorage.setItem(CHAVE_STORAGE, tema);
  aplicarTema(tema);
  window.dispatchEvent(new Event(EVENTO_MUDANCA));
}

export function lerTemaSalvo(): Tema {
  if (typeof window === "undefined") return "system";
  const salvo = localStorage.getItem(CHAVE_STORAGE);
  return salvo === "light" || salvo === "dark" || salvo === "system" ? salvo : "system";
}

/** Para useSyncExternalStore: reage a mudanças feitas nesta aba (evento próprio), em outra aba
 * (storage) e a mudanças do tema do SO quando o modo é "system" (matchMedia). */
export function inscreverMudancaDeTema(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO_MUDANCA, callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO_MUDANCA, callback);
  };
}

/** Script inline injetado no <head> — evita flash de tema errado antes da hidratação. */
export const SCRIPT_TEMA = `
(function () {
  try {
    var tema = localStorage.getItem("${CHAVE_STORAGE}") || "system";
    var escuro = tema === "dark" || (tema === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
    document.documentElement.setAttribute("data-theme", tema);
  } catch (e) {}
})();
`;
