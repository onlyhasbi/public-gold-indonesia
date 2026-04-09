import { AlertTriangle } from "lucide-react";
import type { FormSummaryItem } from "../hooks/useRegisterForm";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";

export function ConfirmationModal({ isAnak, items, onConfirm, onCancel }: { isAnak: boolean; items: FormSummaryItem[]; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden border-none sm:max-w-[520px] bg-white rounded-2xl shadow-2xl">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
          <DialogTitle className="text-lg font-bold text-white">Konfirmasi Data</DialogTitle>
          <DialogDescription className="text-red-100/90 text-[13px] mt-1 leading-relaxed">
            {isAnak ? "Pastikan data anak dan orang tua di bawah ini sudah benar" : "Pastikan data di bawah ini sudah benar"}
          </DialogDescription>
        </div>

        <div className="px-6 py-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {items.map((item) => (
            <div key={item.label} className="flex flex-row gap-3 py-2.5 border-b border-slate-100 last:border-b-0 items-baseline">
              <span className="text-[12px] md:text-sm text-slate-500 w-[35%] shrink-0 font-medium">{item.label}</span>
              <span className="text-[13px] md:text-sm font-semibold text-slate-800 text-left break-all flex-1">{item.value}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="px-8 pb-6 pt-2 bg-slate-50 flex flex-col-reverse sm:flex-row gap-3 rounded-b-2xl border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} className="w-full sm:flex-1 font-semibold text-slate-600 bg-white border-slate-200 hover:bg-slate-50 rounded-xl">
            Kembali
          </Button>
          <Button onClick={onConfirm} className="w-full sm:flex-1 font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border-none shadow-lg shadow-red-200/60 rounded-xl">
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AgeSwitchModal({ showSwitchTo, onConfirm, onCancel }: { showSwitchTo: "anak" | "dewasa"; onConfirm: () => void; onCancel: () => void }) {
  const isToDewasa = showSwitchTo === "dewasa";
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden border-none sm:max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-amber-800">Perhatian: Validasi Usia</DialogTitle>
        </div>

        <div className="px-6 py-5">
          <DialogDescription className="text-slate-600 leading-relaxed text-sm">
            {isToDewasa
              ? "Berdasarkan tanggal lahir yang dimasukkan, usia Anda sudah mencapai 18 tahun atau lebih. Form ini dikhususkan untuk akun Anak."
              : "Berdasarkan tanggal lahir yang dimasukkan, usia masih di bawah 18 tahun. Form ini dikhususkan untuk akun Dewasa."}
            <br className="mb-2" />
            <br />
            Apakah Anda ingin kami alihkan ke form pendaftaran <strong className="text-slate-800">Akun {isToDewasa ? "Dewasa" : "Anak"}</strong>?
          </DialogDescription>
        </div>

        <DialogFooter className="px-8 pb-6 pt-2 bg-slate-50 flex flex-col-reverse sm:flex-row gap-3 rounded-b-2xl border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} className="w-full sm:flex-1 font-semibold text-slate-600 bg-white border-slate-200 hover:bg-slate-50 rounded-xl">
            Batal
          </Button>
          <Button onClick={onConfirm} className="w-full sm:flex-1 font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 border-none shadow-lg shadow-amber-200/60 rounded-xl">
            Ya, Beralih
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
