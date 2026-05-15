import type { Note } from "@/components/my-notes/types";

export function parseInline(text: string, notes: Note[], onLink?: (id: string) => void): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) {
      const linked = notes.find(n => n.title?.toLowerCase() === m![1].toLowerCase());
      parts.push(
        <span key={key++} className={linked ? "text-(--mn-link) border-b border-b-[rgba(90,110,138,.35)] cursor-pointer italic transition-colors duration-140 hover:text-[#3a4e6a]" : "text-(--mn-ink-3) border-b border-dashed border-(--mn-border2) cursor-default italic"}
          onClick={e => { e.stopPropagation(); if (linked) onLink?.(linked.id); }}>
          {m[1]}
        </span>
      );
    } else if (m[2] !== undefined) {
      parts.push(<strong key={key++}>{m[2]}</strong>);
    } else {
      parts.push(<em key={key++}>{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts.length ? parts : [text];
}
