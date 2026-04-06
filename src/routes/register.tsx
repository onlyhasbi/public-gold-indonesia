import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send, ChevronDown, ChevronUp, AlertCircle, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { branchOptionsId, branchOptionsMy } from "../constant/branches";
import { dialCodeOptions } from "../constant/countries";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { labelsID, labelsMY } from "../lib/register-text";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { InputField, SelectField, AlertMessage, inputClass } from "../components/ui/form-elements";
import { ConfirmationModal, AgeSwitchModal } from "../components/RegisterModals";
import { NextStepModal } from "../components/NextStepModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ShieldCheck } from "lucide-react";

type RegisterSearch = {
  type?: "dewasa" | "anak";
  ref?: string;
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type: search.type === "anak" ? "anak" : "dewasa",
      ref: search.ref as string | undefined,
    };
  },
});

function RegisterPage() {
  const { type, ref } = Route.useSearch();
  const navigate = useNavigate();
  const isAnak = type === "anak";

  const { data: referralData, isLoading: isLoadingReferral, isError: isReferralError } = useQuery({
    queryKey: ['referral', ref],
    queryFn: async () => {
      if (!ref) return null;
      try {
        const res = await api.get(`/public/pgbo/${ref}`);
        return res.data.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          throw new Error('Agent not found');
        }
        throw err;
      }
    },
    enabled: !!ref,
    retry: false,
  });

  useEffect(() => {
    if (!ref) {
      const storedPageId = localStorage.getItem('ref_pageid');
      if (storedPageId) {
        // Auto-recovery: If ref is missing but we have it in storage, redirect to include it
        navigate({ 
          to: "/register", 
          search: (prev: any) => ({ ...prev, ref: storedPageId }), 
          replace: true 
        });
      } else {
        // No referral found anywhere, redirect to home
        navigate({ to: "/", replace: true });
      }
      return;
    }

    if (referralData) {
      // Sync the latest pageid to localStorage
      localStorage.setItem('ref_pageid', referralData.pageid);
    }

    if (isReferralError) {
      // If ref is invalid, go to not found page
      navigate({ to: '/$pgcode', params: { pgcode: 'not-found' }, replace: true });
    }
  }, [ref, referralData, isReferralError, navigate]);

  const { i18n } = useTranslation();
  const [countryMode, setCountryMode] = useState<"ID" | "MY" | "INTL">("ID");

  useEffect(() => {
    const lang = i18n.language || "";
    if (lang.startsWith("id")) {
      setCountryMode("ID");
    } else if (lang.startsWith("ms")) {
      setCountryMode("MY");
    } else {
      setCountryMode("INTL");
    }
  }, [i18n.language]);

  const isIndonesia = countryMode === "ID";
  const labels = isIndonesia ? labelsID : labelsMY;
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    touchedFields,
    setValue,
    watch,
    reset,
    isLoading,
    status,
    setStatus,
    message,
    isDobDisabled,
    showConfirm,
    setShowConfirm,
    confirmItems,
    phoneWarning,
    formKey,
    showAgeSwitch,
    setShowAgeSwitch,
    showNextStepModal,
    setShowNextStepModal,
    handleNikBlur,
    handlePhoneInput,
    confirmSubmit,
  } = useRegisterForm(isAnak, countryMode, referralData);

  const formContainerRef = useRef<HTMLDivElement>(null);

  // Post-success flow: scroll to top, wait 2s, show modal
  useEffect(() => {
    if (status === "success") {
      // Scroll to top of form container
      formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });

      const timer = setTimeout(() => {
        setShowNextStepModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, setShowNextStepModal]);

  const idTypeOptions = [
    { value: "newic", label: isIndonesia ? "KTP" : "NEW IC" },
    { value: "passportforeign", label: isIndonesia ? "PASPOR" : "PASSPORT / FOREIGN ID" }
  ];

  const activeBranchOptions = isIndonesia ? branchOptionsId : branchOptionsMy;
  const branchOptions = [
    { value: "", label: isIndonesia ? "Pilih Cabang" : "Select Branch", disabled: true },
    ...activeBranchOptions
  ];

  return (
    <div ref={formContainerRef} className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8">

      <div className="w-full max-w-[1320px] bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden border border-white/50">

        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 xl:px-20 flex flex-col justify-center relative bg-white">
          <div className="w-full max-w-lg mx-auto">

            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <Link 
                to={referralData?.pageid ? "/$pgcode" : "/"} 
                params={referralData?.pageid ? { pgcode: referralData.pageid } : undefined}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Link>

              <select
                value={countryMode}
                onChange={(e) => {
                  const val = e.target.value as "ID" | "MY" | "INTL";
                  setCountryMode(val);
                  if (val === 'ID') i18n.changeLanguage('id');
                  else if (val === 'MY') i18n.changeLanguage('ms');
                  else i18n.changeLanguage('en');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors cursor-pointer appearance-none pr-8 relative bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23475569%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center]"
              >
                <option value="ID">🇮🇩 Indonesia</option>
                <option value="MY">🇲🇾 Malaysia</option>
                <option value="INTL">🌏 International</option>
              </select>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {isAnak ? labels.titleAnak : labels.titleDewasa}
              </h1>
              <p className="text-slate-500 text-sm">
                {isAnak ? labels.descAnak : labels.descDewasa}
              </p>
            </div>

            {/* REFERRAL INFORMATION BAR */}
            {ref && (
              <div className="mb-6 relative group">
                {isLoadingReferral ? (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse">
                    <div className="w-5 h-5 bg-slate-200 rounded-full" />
                    <div className="h-4 bg-slate-200 rounded w-32" />
                  </div>
                ) : referralData ? (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">Direferensikan oleh</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="text-sm font-bold text-slate-800">{referralData.nama_panggilan || referralData.nama_lengkap}</span>
                        <span className="hidden sm:inline text-slate-300 mx-1">|</span>
                        <span className="text-xs font-mono font-medium text-slate-500 bg-white/50 px-1.5 py-0.5 rounded border border-emerald-100/50">{referralData.pgcode}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Tab Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  reset();
                  navigate({ to: "/register", search: { type: "dewasa" } });
                }}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer", !isAnak ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <img src="./dewasa.webp" alt="" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> {labels.tabDewasa}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  navigate({ to: "/register", search: { type: "anak" } });
                }}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer", isAnak ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <img src="./anak.webp" alt="" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> {labels.tabAnak}
              </button>
            </div>

            {isAnak && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  {labels.noteAnak}
                </p>
              </div>
            )}

            {status !== "idle" && (
              <AlertMessage type={status} message={message} onClose={() => setStatus("idle")} />
            )}

            <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <InputField
                label={labels.nameLabel(isAnak)}
                id="label-name"
                required
                placeholder={labels.namePlaceholder(isAnak)}
                {...register("label-name", {
                  onChange: (e) => e.target.value = e.target.value.toUpperCase()
                })}
                error={touchedFields["label-name"] && (errors["label-name"]?.message as string)}
              />

              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                <SelectField
                  label={labels.idTypeLabel}
                  id="idselect"
                  options={idTypeOptions}
                  {...register("idselect")}
                  error={touchedFields["idselect"] && (errors["idselect"]?.message as string)}
                />
                <InputField
                  label={<span>{labels.icLabel(isAnak)}</span>}
                  id="label-ic"
                  required
                  maxLength={20}
                  {...register("label-ic", {
                    onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                  })}
                  onBlur={handleNikBlur}
                  placeholder={labels.icPlaceholder(isAnak)}
                  error={touchedFields["label-ic"] && (errors["label-ic"]?.message as string)}
                />
              </div>

              {isIndonesia && (
                <InputField
                  label={<span>{labels.npwpLabel} <span className="text-slate-400 font-normal">{labels.npwpDesc}</span></span>}
                  id="label-individualgstid"
                  placeholder={labels.npwpPlaceholder}
                  {...register("label-individualgstid", {
                    onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                  })}
                  error={touchedFields["label-individualgstid"] && (errors["label-individualgstid"]?.message as string)}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label={labels.dobLabel(isAnak)}
                  id="label-dob"
                  type="date"
                  required
                  {...register("label-dob")}
                  readOnly={isDobDisabled}
                  className={cn(inputClass, isDobDisabled && "bg-slate-100/80 text-slate-500 cursor-not-allowed opacity-90")}
                  error={touchedFields["label-dob"] && (errors["label-dob"]?.message as string)}
                />
                <InputField
                  label={labels.emailLabel}
                  id="label-email"
                  type="email"
                  required
                  placeholder={labels.emailPlaceholder}
                  {...register("label-email")}
                  error={touchedFields["label-email"] && (errors["label-email"]?.message as string)}
                />
              </div>

              {/* CHILD-ONLY FIELDS */}
              {isAnak && (
                <>
                  <div className="relative py-2 mt-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{labels.parentSectionTitle}</span></div>
                  </div>

                  <InputField
                    label={labels.parentNameLabel}
                    id="label-parent-name"
                    required
                    placeholder={labels.parentNamePlaceholder}
                    {...register("label-parent-name", {
                      onChange: (e) => e.target.value = e.target.value.toUpperCase()
                    })}
                    error={touchedFields["label-parent-name"] && (errors["label-parent-name"]?.message as string)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                    <SelectField
                      label={labels.idTypeLabel}
                      id="parent_idselect"
                      options={idTypeOptions}
                      {...register("parent_idselect")}
                      error={touchedFields["parent_idselect"] && (errors["parent_idselect"]?.message as string)}
                    />
                    <InputField
                      label={labels.parentIcLabel}
                      id="label-parent-ic"
                      required
                      maxLength={20}
                      placeholder={labels.parentIcPlaceholder}
                      {...register("label-parent-ic", {
                        onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                      })}
                      error={touchedFields["label-parent-ic"] && (errors["label-parent-ic"]?.message as string)}
                    />
                  </div>
                </>
              )}

              <InputField
                label={labels.mobileLabel(isAnak)}
                id="label-mobile"
                required
                error={touchedFields["label-mobile"] && (errors["label-mobile"]?.message as string)}
              >
                <div className="relative pb-0.5">
                  <div className="flex gap-2 sm:gap-3">
                    <Select
                      name="label-mobile-dialcode"
                      options={dialCodeOptions}
                      value={dialCodeOptions.find((o) => o.value === watch("label-mobile-dialcode"))}
                      onChange={(opt) => setValue("label-mobile-dialcode", opt?.value, { shouldValidate: true })}
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
                      type="tel"
                      required
                      placeholder={labels.mobilePlaceholder}
                      {...register("label-mobile", { onChange: handlePhoneInput })}
                      className={cn(inputClass, touchedFields["label-mobile"] && errors["label-mobile"] && "border-red-500 focus:ring-red-500/30 focus:border-red-500", "flex-1 min-w-0")}
                    />
                  </div>
                  <div className="absolute top-full left-1 mt-1">
                    {phoneWarning && !errors["label-mobile"] && (
                      <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {labels.mobileWarning}
                      </p>
                    )}
                  </div>
                </div>
              </InputField>

              <SelectField
                label={labels.branchLabel}
                id="upreferredbranch"
                required
                options={branchOptions}
                description={labels.branchDesc}
                {...register("upreferredbranch")}
                error={touchedFields["upreferredbranch"] && (errors["upreferredbranch"]?.message as string)}
              />

              <div className="pt-8 pb-1 space-y-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold px-8 py-3.5 sm:py-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-xl shadow-red-200/50 hover:shadow-red-300/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {labels.submittingBtn}</> : <><Send className="w-5 h-5" /> {labels.submitBtn}</>}
                </button>

                <div className="space-y-3 text-[13px] text-left transition-all duration-300 text-slate-800">
                  <label className="flex items-start sm:items-center gap-3 cursor-pointer font-medium text-slate-800">
                    <input type="checkbox" className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 shrink-0 rounded border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer" {...register("newsletter")} />
                    <span>{isIndonesia ? "Berlangganan & Setujui Syarat dan Ketentuan" : "Subscribe to newsletter & Agree to terms"}</span>
                  </label>

                  <div className="relative pt-1">
                    <div className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out relative text-[12px] sm:text-[13px] text-slate-500 leading-relaxed font-medium",
                      isTermsExpanded ? "max-h-[600px]" : "max-h-[2.6rem] sm:max-h-[3.2rem]"
                    )}>
                      {isIndonesia ? (
                        <p className="leading-relaxed">
                          Dengan melanjutkan proses, saya menyetujui bahwa Public Gold Indonesia dapat mengumpulkan, menggunakan informasi yang telah saya bagikan sesuai dengan <a href="https://publicgold.co.id/index.php?route=information/information&information_id=41" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline transition-all">kebijakan kerahasiaan data</a> dan saya menyetujui serta memenuhi <a href="https://publicgold.co.id/index.php?route=information/information&information_id=5" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline transition-all">syarat dan ketentuan</a> yang telah saya baca dan pahami.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <p className="leading-relaxed">
                            I hereby declare that the information given above is true, accurate and complete. I understand that my account registration application is subject to approval. In the event of my application has been approved, I hereby undertake and agree to be bound in all respects by the company's regulation.
                          </p>
                          <p className="leading-relaxed">
                            By proceeding, I confirm that the information provided is true, accurate, and complete. I understand that this application is subject to approval by Public Gold. I agree to be bound by the company's regulations, <a href="https://publicgold.com.my/index.php?route=information/information&information_id=5" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Terms &amp; Conditions</a>, and <a href="https://publicgold.com.my/index.php?route=information/information&information_id=741" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Privacy Policy</a>.
                            <br /><br />
                            If this registration is completed with the assistance of an introducer, the introducer confirms that the registration is done with the full knowledge and consent of the customer, and that all information provided is accurate and authorized by the customer.
                          </p>
                        </div>
                      )}

                      {/* Blurry Fade-out Mask when Collapsed */}
                      <div className={cn(
                        "absolute inset-x-0 bottom-0 h-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-white via-white/80 to-transparent",
                        isTermsExpanded ? "opacity-0" : "opacity-100"
                      )}>
                        <div className="absolute inset-0 backdrop-blur-[1.5px] [mask-image:linear-gradient(to_top,black_20%,transparent_100%)]" style={{ WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)' }}></div>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={() => setIsTermsExpanded(!isTermsExpanded)} className="flex items-center justify-center w-full mt-0 text-slate-400 hover:text-slate-600 transition-colors py-1">
                    {isTermsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Image Banner */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0c0c0e] overflow-hidden border-l border-slate-100 group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[100px] pointer-events-none z-0 group-hover:bg-red-600/20 transition-all duration-1000" />
          <img src="https://penang.chinapress.com.my/wp-content/uploads/2023/05/Public-Gold-1.jpg" alt="Investasi Emas Public Gold" className="absolute inset-0 z-10 w-full h-full object-cover object-left grayscale opacity-80 group-hover:scale-105 group-hover:opacity-70 transition-all duration-1000" />

          {/* Centered Logo */}
          <div className="absolute top-[15%] inset-x-0 z-[15] flex justify-center pointer-events-none">
            <img src="./logo.svg" alt="Public Gold Logo" className="w-64 sm:w-80 md:w-96 h-auto drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105" />
          </div>

          {/* Floating Help CTA */}
          <div className="absolute bottom-10 right-10 z-20">
            <a href="https://wa.me/628979901844" target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-4 bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 pr-7 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(37,211,102,0.2)] cursor-pointer overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#1da851] flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:shadow-[#25D366]/60 group-hover:scale-110 transition-all duration-500 ease-out">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                {/* Online Indicator */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366] border-2 border-[#121212]"></span>
                </span>
              </div>
              
              <div className="text-left relative z-10 transition-transform duration-300 group-hover:translate-x-1 flex flex-col justify-center">
                <p className="text-[#25D366] text-xs font-medium mb-0.5 drop-shadow-sm">Perlu bantuan?</p>
                <p className="text-white font-bold text-base leading-none drop-shadow-md">Konsultasi Sekarang</p>
              </div>
            </a>
          </div>
        </div>

        {/* Mobile-only Floating WA Button */}
        <a href="https://wa.me/628979901844" target="_blank" rel="noopener noreferrer" className="lg:hidden group fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-[#25D366] to-[#1da851] text-white shadow-[0_8px_32px_rgba(37,211,102,0.4)] hover:shadow-[0_16px_48px_rgba(37,211,102,0.6)] hover:-translate-y-1.5 hover:scale-105 transition-all duration-500 active:scale-95">
          <MessageCircle className="w-6 h-6" />
          {/* Online Indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-400 border-2 border-white"></span>
          </span>
        </a>

      </div>

      {showConfirm && confirmItems.length > 0 && (
        <ConfirmationModal
          isAnak={isAnak}
          items={confirmItems}
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showAgeSwitch && (
        <AgeSwitchModal
          showSwitchTo={showAgeSwitch}
          onConfirm={() => {
            setShowAgeSwitch(null);
            reset();
            navigate({ to: "/register", search: { type: showAgeSwitch } });
          }}
          onCancel={() => setShowAgeSwitch(null)}
        />
      )}

      {showNextStepModal && (
        <NextStepModal refId={ref} onClose={() => setShowNextStepModal(false)} />
      )}
    </div>
  );
}
