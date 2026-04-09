"use client";

/**
 * Copia texto para a área de transferência com fallback para ambientes restritos
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Tenta usar a API moderna do Clipboard primeiro
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Se falhar, usa o fallback
      console.warn('Clipboard API falhou, usando fallback', err);
    }
  }

  // Fallback: usar textarea oculta
  if (typeof document === "undefined") return false;
  
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Tornar o textarea invisível mas acessível
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Selecionar o texto
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Executar comando de cópia
    const successful = document.execCommand('copy');
    
    // Limpar
    document.body.removeChild(textarea);
    
    return successful;
  } catch (err) {
    console.error('Erro ao copiar texto:', err);
    return false;
  }
}
