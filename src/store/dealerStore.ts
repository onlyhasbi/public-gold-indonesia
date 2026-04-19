import { atom } from "jotai";

export interface PgboData {
  foto_profil_url?: string | null;
  nama_lengkap?: string | null;
  nama_panggilan?: string | null;
  no_telpon?: string | null;
  link_group_whatsapp?: string | null;
  pgcode?: string | null;
  pageid?: string | null;
  [key: string]: any;
}

export const activeDealerAtom = atom<PgboData | null>(null);
export const goldPricesAtom = atom<any>(null);
