import { AlertTriangle } from "lucide-react";
import type { FormSummaryItem } from "../hooks/useRegisterForm";

export function ConfirmationModal({ isAnak, items, onConfirm, onCancel }: { isAnak: boolean; items: FormSummaryItem[]; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Konfirmasi Data</h3>
          <p className="text-red-100 text-sm mt-0.5">
            {isAnak ? "Pastikan data anak dan orang tua di bawah ini sudah benar" : "Pastikan data di bawah ini sudah benar"}
          </p>
        </div>
        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-sm text-slate-500 shrink-0">{item.label}</span>
              <span className="text-sm font-medium text-slate-800 text-right break-all">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-slate-50 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            Kembali
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-200/60 cursor-pointer">
            Konfirmasi & Kirim
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgeSwitchModal({ showSwitchTo, onConfirm, onCancel }: { showSwitchTo: "anak" | "dewasa"; onConfirm: () => void; onCancel: () => void }) {
  const isToDewasa = showSwitchTo === "dewasa";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-bold text-amber-800">Perhatian: Validasi Usia</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-slate-600 leading-relaxed text-sm">
            {isToDewasa
              ? "Berdasarkan tanggal lahir yang dimasukkan, usia Anda sudah mencapai 18 tahun atau lebih. Form ini dikhususkan untuk akun Anak."
              : "Berdasarkan tanggal lahir yang dimasukkan, usia masih di bawah 18 tahun. Form ini dikhususkan untuk akun Dewasa."}
            <br className="mb-2" />
            <br />
            Apakah Anda ingin kami alihkan ke form pendaftaran <strong className="text-slate-800">Akun {isToDewasa ? "Dewasa" : "Anak"}</strong>?
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-4 py-3 text-sm font-bold text-amber-900 bg-amber-400 rounded-xl hover:bg-amber-500 transition-all shadow-lg shadow-amber-200/60 cursor-pointer">
            Ya, Beralih ke {isToDewasa ? "Dewasa" : "Anak"}
          </button>
        </div>
      </div>
    </div>
  );
}
