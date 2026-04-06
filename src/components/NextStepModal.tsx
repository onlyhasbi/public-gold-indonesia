import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Spinner } from "./ui/spinner";

export function NextStepModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 opacity-10 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative px-8 pt-10 pb-8 text-center">
          {/* Animated Success Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Consistent Spinner Rings */}
            <div className="absolute w-24 h-24 rounded-full bg-emerald-100 animate-ping opacity-20" />
            <Spinner size={84} className="absolute text-emerald-100/50 opacity-100" />
            {/* Icon circle */}
            <div className="relative w-18 h-18 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200/60"
              style={{ width: '72px', height: '72px' }}
            >
              <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold text-slate-800">
              Pendaftaran Berhasil!
            </h2>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          {/* Description */}
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Akun Anda sedang diproses. Ikuti langkah berikut agar Anda bisa mulai bertransaksi emas.
          </p>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/petunjuk" });
            }}
            className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-200/50 hover:shadow-emerald-300/60 active:scale-[0.98] cursor-pointer"
          >
            Lihat Petunjuk Selanjutnya
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* Skip link */}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer font-medium"
          >
            Lewati untuk sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
