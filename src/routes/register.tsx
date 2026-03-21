import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Select from "react-select";
import { dialCodeOptions } from "../constant/countries";
import { extractDataFromNIK, cn } from "../lib/utils";
import { Loader2, UserPlus, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dob, setDob] = useState("");
  const [isDobDisabled, setIsDobDisabled] = useState(false);

  const handleNikBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const nik = e.currentTarget.value;
    const { validFormat, dateOfBirth } = extractDataFromNIK(nik);

    // Only auto-fill if user actually selected KTP (newic) - although backend uses label-ic for both.
    // If it's a valid 16 digit NIK, let's just auto-fill the DOB.
    if (validFormat && dateOfBirth) {
      setDob(dateOfBirth);
      setIsDobDisabled(true);
    } else {
      setDob(""); // Clear DOB when NIK is invalid or deleted
      setIsDobDisabled(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const urlEncodedData = new URLSearchParams(formData as any).toString();

    try {
      const endpointUrl =
        "/api-proxy/index.php?route=account/register&intro_pgcode=PG01387609&is_dealer=1";

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncodedData,
      });

      // Parse the response as text (HTML)
      const htmlText = await response.text();

      // Use DOMParser to extract the error message from the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");
      const errorAlert = doc.querySelector(".alert-danger p");
      const successAlert = doc.querySelector(".alert-success p");

      if (errorAlert && errorAlert.textContent) {
        throw new Error(errorAlert.textContent.trim());
      }

      if (!response.ok) {
        throw new Error("Terjadi kesalahan pada jaringan.");
      }

      const successMessage = successAlert?.textContent?.trim() || "Pendaftaran berhasil! Silakan cek email Anda untuk langkah selanjutnya.";

      console.log("Success!");
      setMessage(successMessage);
      setStatus("success");

      // Optional: reset form after success
      e.currentTarget.reset();
    } catch (error: any) {
      console.error("Error:", error);
      setMessage(error.message || "Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8">
      
      {/* The Unified Floating Card */}
      <div className="w-full max-w-[1320px] bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden border border-white/50">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 xl:px-20 flex flex-col justify-center relative bg-white">
          <div className="w-full max-w-lg mx-auto">
            
            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm mb-6 lg:mb-8">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>

            {/* Header (Only visible on Mobile since image column is hidden) */}
            <div className="mb-8 lg:hidden">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Pendaftaran
              </h1>
              <p className="text-slate-500 text-sm">
                Daftar sekarang dan mulai perjalanan investasi emas Anda bersama Public Gold Indonesia.
              </p>
            </div>

          {/* Status Alerts */}
          {status === "success" && (
            <div className="mt-6 flex items-start justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>
              <button onClick={() => setStatus("idle")} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors shrink-0" type="button" aria-label="Tutup">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {status === "error" && (
            <div className="mt-6 flex items-start justify-between gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>
              <button onClick={() => setStatus("idle")} className="p-1 hover:bg-red-100 rounded-lg transition-colors shrink-0" type="button" aria-label="Tutup">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* Hidden fields */}
            <input type="hidden" name="newsletter" value="1" />

            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="label-name"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="label-name"
                name="label-name"
                type="text"
                required
                placeholder="Masukkan nama lengkap"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200"
              />
            </div>

            {/* Tipe Identitas & Nomor Identitas */}
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
              <div>
                <label
                  htmlFor="idselect"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Tipe Identitas
                </label>
                <select
                  id="idselect"
                  name="idselect"
                  defaultValue="newic"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="newic">KTP</option>
                  <option value="passportforeign">PASPOR</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="label-ic"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nomor Identitas <span className="text-red-500">*</span>
                </label>
                <input
                  id="label-ic"
                  name="label-ic"
                  type="text"
                  required
                  onBlur={handleNikBlur}
                  placeholder="Masukkan nomor KTP / Paspor"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* NPWP */}
            <div>
              <label
                htmlFor="label-individualgstid"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                NPWP{" "}
                <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                id="label-individualgstid"
                name="label-individualgstid"
                type="text"
                placeholder="Masukkan NPWP jika ada"
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200"
              />
            </div>

            {/* Tanggal Lahir & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="label-dob"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  id="label-dob"
                  name="label-dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => {
                    if (!isDobDisabled) setDob(e.target.value);
                  }}
                  readOnly={isDobDisabled}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200",
                    isDobDisabled && "bg-slate-100/80 text-slate-500 cursor-not-allowed opacity-90"
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor="label-email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="label-email"
                  name="label-email"
                  type="email"
                  required
                  placeholder="contoh@email.com"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Nomor HP */}
            <div>
              <label
                htmlFor="label-mobile"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Nomor Handphone <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 sm:gap-3">
                <Select
                  name="label-mobile-dialcode"
                  options={dialCodeOptions}
                  defaultValue={dialCodeOptions.find((o) => o.value === "62")}
                  isSearchable={true}
                  formatOptionLabel={(option, { context }) => {
                    if (context === "value") {
                      // Only show Flag and Code (e.g. "🇮🇩 +62") in the input box
                      return option.label.split(" ").slice(0, 2).join(" ");
                    }
                    // Show full label in the dropdown menu
                    return option.label;
                  }}
                  classNames={{
                    control: (state) =>
                      `!min-h-[50px] !w-[100px] sm:!w-[120px] !bg-slate-50/80 !border-slate-200 !rounded-xl !shadow-none transition-all duration-200 cursor-pointer ${state.isFocused ? "!ring-2 !ring-red-500/30 !border-red-400" : ""
                      }`,
                    menu: () => "!bg-white !rounded-xl !border !border-slate-100 !shadow-lg !overflow-hidden !z-50 !mt-2 !w-max !min-w-full",
                    option: (state) =>
                      `!px-3 !py-2.5 cursor-pointer transition-colors ${state.isSelected ? "!bg-red-50 !text-red-700 !font-medium" : state.isFocused ? "!bg-slate-50" : "!text-slate-600"
                      }`,
                    singleValue: () => "!text-slate-800 !font-medium",
                    dropdownIndicator: () => "!text-slate-400",
                    indicatorSeparator: () => "hidden",
                  }}
                />
                <input
                  id="label-mobile"
                  name="label-mobile"
                  type="tel"
                  required
                  placeholder="8123456789"
                  className="flex-1 px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Cabang Terdekat */}
            <div>
              <label
                htmlFor="upreferredbranch"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Kantor Cabang Terdekat <span className="text-red-500">*</span>
              </label>
              <select
                id="upreferredbranch"
                name="upreferredbranch"
                defaultValue=""
                required
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>Pilih Cabang</option>
                <option value="153">Makassar</option>
                <option value="25">Jakarta Selatan</option>
                <option value="30">Bandung</option>
                <option value="31">Banjarmasin</option>
                <option value="32">Yogyakarta</option>
                <option value="36">Surabaya</option>
                <option value="265">Bekasi</option>
              </select>
            </div>

            {/* Hidden Referral Fields */}
            <input type="hidden" name="label-intro-pgcode" value="PG01387609" />
            <input type="hidden" name="label-intro-name" value="A. MUH. HASBI HAERURRIJAL " />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold px-8 py-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-200/60 hover:shadow-red-300/60 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Daftar Sekarang
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang
              berlaku di Public Gold Indonesia.
            </p>
          </form>
        </div>
      </div>
      
      {/* Right Column: Hero Image Banner */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0c0c0e] overflow-hidden border-l border-slate-100">
        
        {/* Subtle red ambient glow behind the image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[100px] pointer-events-none z-0" />
        
        {/* The Hero Image */}
        <img
          src="/public_gold_hero.png"
          alt="Investasi Emas Public Gold"
          className="absolute inset-0 z-10 w-full h-full object-cover object-left grayscale opacity-80"
        />
        
      </div>
      
    </div>
    </div>
  );
}
