import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Send, X } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import Select from "react-select";
import { dialCodeOptions } from "../constant/countries";
import { cn, extractDataFromNIK } from "../lib/utils";

type RegisterSearch = {
  type?: "dewasa" | "anak";
};

type FormSummaryItem = {
  label: string;
  value: string;
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type: search.type === "anak" ? "anak" : "dewasa",
    };
  },
});

function useRegisterForm(isAnak: boolean) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dob, setDob] = useState("");
  const [isDobDisabled, setIsDobDisabled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmItems, setConfirmItems] = useState<FormSummaryItem[]>([]);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const pendingFormData = useRef<string | null>(null);
  const pendingEndpoint = useRef<string | null>(null);

  const handleNikBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const nik = e.currentTarget.value;
    const { validFormat, dateOfBirth } = extractDataFromNIK(nik);

    if (validFormat && dateOfBirth) {
      setDob(dateOfBirth);
      setIsDobDisabled(true);
    } else {
      setDob("");
      setIsDobDisabled(false);
    }
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    setPhoneWarning(e.currentTarget.value.startsWith("0"));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    pendingFormData.current = new URLSearchParams(formData as any).toString();

    const baseUrl = "/api-proxy/index.php?route=account/register&intro_pgcode=PG01387609&is_dealer=1";
    pendingEndpoint.current = isAnak ? `${baseUrl}&form_type=ja` : baseUrl;

    const branchSelect = e.currentTarget.querySelector<HTMLSelectElement>("#upreferredbranch");
    const branchLabel = branchSelect?.selectedOptions[0]?.text || "-";

    const dialCodeValue = formData.get("label-mobile-dialcode") as string || "62";
    const dialOption = dialCodeOptions.find((o) => o.value === dialCodeValue);
    const dialLabel = dialOption ? `+${dialOption.value}` : `+${dialCodeValue}`;

    const idSelectValue = formData.get("idselect") as string;
    const idTypeLabel = idSelectValue === "passportforeign" ? "PASPOR" : "KTP";

    const items: FormSummaryItem[] = [
      { label: isAnak ? "Nama Anak" : "Nama Lengkap", value: (formData.get("label-name") as string) || "-" },
      { label: isAnak ? "Tipe Identitas Anak" : "Tipe Identitas", value: idTypeLabel },
      { label: isAnak ? "Nomor Identitas Anak" : "Nomor Identitas", value: (formData.get("label-ic") as string) || "-" },
      { label: "NPWP", value: (formData.get("label-individualgstid") as string) || "-" },
      { label: isAnak ? "Tanggal Lahir Anak" : "Tanggal Lahir", value: (formData.get("label-dob") as string) || "-" },
      { label: "Email", value: (formData.get("label-email") as string) || "-" },
    ];

    if (isAnak) {
      const parentIdSelectValue = formData.get("parent_idselect") as string;
      const parentIdTypeLabel = parentIdSelectValue === "passportforeign" ? "PASPOR" : "KTP";
      items.push(
        { label: "Nama Orang Tua", value: (formData.get("label-parent-name") as string) || "-" },
        { label: "Tipe Identitas Orang Tua", value: parentIdTypeLabel },
        { label: "No. Identitas Orang Tua", value: (formData.get("label-parent-ic") as string) || "-" },
      );
    }

    items.push(
      { label: "Nomor Handphone", value: `${dialLabel} ${(formData.get("label-mobile") as string) || "-"}` },
      { label: "Cabang Terdekat", value: branchLabel },
    );

    setConfirmItems(items);
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    if (!pendingFormData.current || !pendingEndpoint.current) return;

    setShowConfirm(false);
    setIsLoading(true);

    try {
      const response = await fetch(pendingEndpoint.current, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: pendingFormData.current,
        redirect: "manual",
      });

      // Handle the redirect to success page (which usually throws CORS if followed blindly)
      if (response.type === "opaqueredirect" || (response.status >= 300 && response.status < 400)) {
        setMessage("Pendaftaran berhasil! Silakan cek email Anda untuk langkah selanjutnya.");
        setStatus("success");
        setDob("");
        setIsDobDisabled(false);
        setPhoneWarning(false);
        setFormKey(prev => prev + 1);
        return;
      }

      const htmlText = await response.text();
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

      setMessage(successMessage);
      setStatus("success");
      setDob("");
      setIsDobDisabled(false);
      setPhoneWarning(false);
      setFormKey(prev => prev + 1);
    } catch (error: any) {
      console.error("Error:", error);
      setMessage(error.message || "Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
      setStatus("error");
    } finally {
      setIsLoading(false);
      pendingFormData.current = null;
      pendingEndpoint.current = null;
    }
  };

  return {
    formRef,
    isLoading,
    status,
    setStatus,
    message,
    dob,
    setDob,
    isDobDisabled,
    showConfirm,
    setShowConfirm,
    confirmItems,
    phoneWarning,
    formKey,
    handleNikBlur,
    handlePhoneInput,
    handleSubmit,
    confirmSubmit,
  };
}

const inputClass = "w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200";
const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

function InputField({ label, id, required = false, description, children, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string | ReactNode; description?: ReactNode }) {
  return (
    <div className="relative pb-0.5">
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || <input id={id} name={id} required={required} className={cn(inputClass, className)} {...props} />}
      {description && <div className="absolute top-full left-1 mt-1 text-[11px] font-medium text-slate-400/90">{description}</div>}
    </div>
  );
}

function SelectField({ label, id, required = false, description, options, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string | ReactNode; description?: ReactNode; options: { value: string; label: string; disabled?: boolean }[] }) {
  return (
    <div className="relative pb-0.5">
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select id={id} name={id} required={required} className={cn(inputClass, "appearance-none cursor-pointer", className)} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
        ))}
      </select>
      {description && <p className="absolute top-full left-1 mt-1 text-[11px] font-medium text-slate-400/90">{description}</p>}
    </div>
  );
}

function AlertMessage({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  const isSuccess = type === "success";
  const colors = isSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700";
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 border rounded-xl px-5 py-4 animate-in fade-in slide-in-from-top-2 ${colors}`}>
      <div className="flex gap-3 items-start">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className={`p-1 rounded-lg transition-colors shrink-0 ${isSuccess ? "hover:bg-emerald-100" : "hover:bg-red-100"}`} type="button" aria-label="Tutup">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConfirmationModal({ isAnak, items, onConfirm, onCancel }: { isAnak: boolean; items: FormSummaryItem[]; onConfirm: () => void; onCancel: () => void }) {
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

// ============================================================================
// Main Page Component
// ============================================================================

function RegisterPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const isAnak = type === "anak";

  const form = useRegisterForm(isAnak);

  const idTypeOptions = [
    { value: "newic", label: "KTP" },
    { value: "passportforeign", label: "PASPOR" }
  ];

  const branchOptions = [
    { value: "", label: "Pilih Cabang", disabled: true },
    { value: "153", label: "Makassar" },
    { value: "25", label: "Jakarta Selatan" },
    { value: "30", label: "Bandung" },
    { value: "31", label: "Banjarmasin" },
    { value: "32", label: "Yogyakarta" },
    { value: "36", label: "Surabaya" },
    { value: "265", label: "Bekasi" }
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8">

      <div className="w-full max-w-[1320px] bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden border border-white/50">

        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 xl:px-20 flex flex-col justify-center relative bg-white">
          <div className="w-full max-w-lg mx-auto">

            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm mb-6 lg:mb-8">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {isAnak ? "Pendaftaran Akun Anak" : "Pendaftaran Akun Dewasa"}
              </h1>
              <p className="text-slate-500 text-sm">
                {isAnak ? "Daftarkan anak Anda untuk memulai perjalanan investasi emas bersama Public Gold Indonesia." : "Daftar sekarang dan mulai perjalanan investasi emas Anda bersama Public Gold Indonesia."}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => navigate({ to: "/register", search: { type: "dewasa" } })}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer", !isAnak ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <img src="./dewasa.webp" alt="" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> Akun Dewasa
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/register", search: { type: "anak" } })}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer", isAnak ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <img src="./anak.webp" alt="" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> Akun Anak
              </button>
            </div>

            {isAnak && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Catatan:</strong> Anak di bawah 18 tahun harus didampingi orang tua atau wali. Setelah anak mencapai usia 18 tahun, akun bisa ditransfer ke nama mereka sendiri.
                </p>
              </div>
            )}

            {form.status !== "idle" && (
              <AlertMessage type={form.status} message={form.message} onClose={() => form.setStatus("idle")} />
            )}

            <form key={form.formKey} ref={form.formRef} onSubmit={form.handleSubmit} className="space-y-5">
              <input type="hidden" name="newsletter" value="1" />

              <InputField
                label={isAnak ? "Nama Anak" : "Nama Lengkap"}
                id="label-name"
                required
                placeholder={isAnak ? "Masukkan nama anak (sesuai kartu identitas)" : "Masukkan nama lengkap"}
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
              />

              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                <SelectField label="Tipe Identitas" id="idselect" defaultValue="newic" options={idTypeOptions} />
                <InputField
                  label={<span>{isAnak ? "NIK Anak" : "Nomor Identitas"}</span>}
                  id="label-ic"
                  required
                  maxLength={20}
                  onBlur={form.handleNikBlur}
                  placeholder={isAnak ? "Masukkan NIK anak (maks. 20 digit)" : "Masukkan nomor KTP/Paspor (maks. 20 digit)"}
                />
              </div>

              <InputField
                label={<span>NPWP <span className="text-slate-400 font-normal">(opsional)</span></span>}
                id="label-individualgstid"
                placeholder="Masukkan NPWP jika ada"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label={isAnak ? "Tanggal Lahir Anak" : "Tanggal Lahir"}
                  id="label-dob"
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => { if (!form.isDobDisabled) form.setDob(e.target.value); }}
                  readOnly={form.isDobDisabled}
                  className={cn(inputClass, form.isDobDisabled && "bg-slate-100/80 text-slate-500 cursor-not-allowed opacity-90")}
                />
                <InputField label="Email" id="label-email" type="email" required placeholder="contoh@email.com" />
              </div>

              {/* CHILD-ONLY FIELDS */}
              {isAnak && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Orang Tua / Wali</span></div>
                  </div>

                  <InputField
                    label="Nama Orang Tua"
                    id="label-parent-name"
                    required
                    placeholder="Masukkan nama orang tua (sesuai kartu identitas)"
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                    <SelectField label="Tipe Identitas" id="parent_idselect" defaultValue="newic" options={idTypeOptions} />
                    <InputField
                      label="No. Identitas Orang Tua"
                      id="label-parent-ic"
                      required
                      maxLength={20}
                      placeholder="Masukkan nomor identitas orang tua (maks. 20 digit)"
                    />
                  </div>
                </>
              )}

              <InputField label={isAnak ? "Nomor WhatsApp" : "Nomor Handphone"} id="label-mobile" required>
                <div className="relative pb-0.5">
                  <div className="flex gap-2 sm:gap-3">
                    <Select
                      name="label-mobile-dialcode"
                      options={dialCodeOptions}
                      defaultValue={dialCodeOptions.find((o) => o.value === "62")}
                      isSearchable={true}
                      formatOptionLabel={(option, { context }) => context === "value" ? option.label.split(" ").slice(0, 2).join(" ") : option.label}
                      classNames={{
                        control: (state) => `!min-h-[50px] !w-[100px] sm:!w-[120px] !bg-slate-50/80 !border-slate-200 !rounded-xl !shadow-none transition-all duration-200 cursor-pointer ${state.isFocused ? "!ring-2 !ring-red-500/30 !border-red-400" : ""}`,
                        menu: () => "!bg-white !rounded-xl !border !border-slate-100 !shadow-lg !overflow-hidden !z-50 !mt-2 !w-max !min-w-full",
                        option: (state) => `!px-3 !py-2.5 cursor-pointer transition-colors ${state.isSelected ? "!bg-red-50 !text-red-700 !font-medium" : state.isFocused ? "!bg-slate-50" : "!text-slate-600"}`,
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
                      onInput={form.handlePhoneInput}
                      className={cn(inputClass, "flex-1 min-w-0")}
                    />
                  </div>
                  <div className="absolute top-full left-1 mt-1">
                    {form.phoneWarning && (
                      <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Tidak perlu memasukkan angka 0 di depan. Contoh: 8123456789
                      </p>
                    )}
                  </div>
                </div>
              </InputField>

              <SelectField
                label="Kantor Cabang Terdekat"
                id="upreferredbranch"
                required
                defaultValue=""
                options={branchOptions}
                description="Pilih kantor cabang terdekat dari lokasi Anda"
              />

              <input type="hidden" name="label-intro-pgcode" value="PG01387609" />
              <input type="hidden" name="label-intro-name" value="A. MUH. HASBI HAERURRIJAL " />

              <button
                type="submit"
                disabled={form.isLoading}
                className="w-full mt-10 flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold px-8 py-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-200/60 hover:shadow-red-300/60 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
              >
                {form.isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : <><Send className="w-5 h-5" /> Kirim</>}
              </button>

              <p className="text-center text-xs text-slate-400">
                Dengan melanjutkan proses, saya menyetujui bahwa Public Gold Indonesia dapat mengumpulkan, menggunakan informasi yang telah saya bagikan sesuai dengan <a href="https://publicgold.co.id/index.php?route=information/information&information_id=41" target="_blank" rel="noopener noreferrer" className="font-semibold text-red-600 hover:text-red-700 hover:underline transition-all">kebijakan kerahasiaan data</a> dan saya menyetujui serta memenuhi syarat dan ketentuan yang telah saya baca dan pahami.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Image Banner */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0c0c0e] overflow-hidden border-l border-slate-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[100px] pointer-events-none z-0" />
          <img src="https://penang.chinapress.com.my/wp-content/uploads/2023/05/Public-Gold-1.jpg" alt="Investasi Emas Public Gold" className="absolute inset-0 z-10 w-full h-full object-cover object-left grayscale opacity-80" />
        </div>

      </div>

      {form.showConfirm && form.confirmItems.length > 0 && (
        <ConfirmationModal
          isAnak={isAnak}
          items={form.confirmItems}
          onConfirm={form.confirmSubmit}
          onCancel={() => form.setShowConfirm(false)}
        />
      )}
    </div>
  );
}
