/**
 * Safely copies text to the clipboard across regular browsers, restricted iframes,
 * and mobile WebViews without throwing unhandled rejections.
 */
export async function copyTextSafe(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern Clipboard API first when available in secure context
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below for iframe / permission-restricted contexts
    }
  }

  // Fallback using a temporary off-screen textarea and execCommand('copy')
  try {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
