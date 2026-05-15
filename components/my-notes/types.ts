import type { NoteData, PrefsData, TagData } from "@/app/my-notes/actions";

export type Note     = NoteData;
export type Tag      = TagData;
export type Prefs    = PrefsData;
export type Position = { x: number; y: number };
export type Edge     = { from: string; to: string };
