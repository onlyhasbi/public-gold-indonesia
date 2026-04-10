import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send, ChevronDown, ChevronUp, AlertCircle, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { branchOptionsId, branchOptionsMy } from "../constant/branches";
import { dialCodeOptions } from "../constant/countries";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { labelsID, labelsMY } from "../lib/register-text";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { AlertMessage } from "../components/ui/form-elements";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmationModal, AgeSwitchModal } from "../components/RegisterModals";
import { NextStepModal } from "../components/NextStepModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

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

  const { data: referralData, isError: isReferralError } = useQuery({
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
        navigate({
          to: "/register",
          search: (prev: any) => ({ ...prev, ref: storedPageId }),
          replace: true
        });
      } else {
        navigate({ to: "/", replace: true });
      }
      return;
    }

    if (referralData) {
      localStorage.setItem('ref_pageid', referralData.pageid);
    }

    if (isReferralError) {
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

  const [dialCodeSearch, setDialCodeSearch] = useState("");
  const filteredDialCodes = useMemo(() => {
    if (!dialCodeSearch) return dialCodeOptions;
    const term = dialCodeSearch.toLowerCase();
    return dialCodeOptions.filter(opt =>
      opt.label.toLowerCase().includes(term) ||
      opt.value.includes(term)
    );
  }, [dialCodeSearch]);

  useEffect(() => {
    if (status === "success") {
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

  const [branchSearch, setBranchSearch] = useState("");
  const filteredBranchOptions = useMemo(() => {
    if (!branchSearch) return activeBranchOptions;
    const term = branchSearch.toLowerCase();
    return activeBranchOptions.filter(opt =>
      opt.label.toLowerCase().includes(term)
    );
  }, [branchSearch, activeBranchOptions]);

  return (
    <div ref={formContainerRef} className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8">

      <Card className="w-full max-w-[1320px] rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden border-white/50 bg-white p-0">

        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 xl:px-20 flex flex-col justify-center relative bg-white lg:min-h-[900px]">
          <div className="w-full max-w-lg mx-auto">

            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <Link
                to={referralData?.pageid ? "/$pgcode" : "/"}
                params={referralData?.pageid ? { pgcode: referralData.pageid } : undefined}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Link>

              <Combobox
                value={countryMode}
                onValueChange={(val: string | null) => {
                  if (val) {
                    setCountryMode(val as "ID" | "MY" | "INTL");
                    // Delay language change slightly more to let the popup close and release scroll lock
                    setTimeout(() => {
                      if (val === 'ID') i18n.changeLanguage('id');
                      else if (val === 'MY') i18n.changeLanguage('ms');
                      else i18n.changeLanguage('en');
                    }, 200);
                  }
                }}
              >
                <ComboboxTrigger className="w-fit min-w-[145px] bg-slate-50 border-slate-200">
                  <ComboboxValue placeholder="Pilih Negara" className="truncate">
                    {countryMode === 'ID' ? '🇮🇩 Indonesia' : countryMode === 'MY' ? '🇲🇾 Malaysia' : '🌏 International'}
                  </ComboboxValue>
                </ComboboxTrigger>
                <ComboboxContent align="end">
                  <ComboboxItem value="ID">🇮🇩 Indonesia</ComboboxItem>
                  <ComboboxItem value="MY">🇲🇾 Malaysia</ComboboxItem>
                  <ComboboxItem value="INTL">🌏 International</ComboboxItem>
                </ComboboxContent>
              </Combobox>
            </div>

            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {isAnak ? labels.titleAnak : labels.titleDewasa}
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                {isAnak ? labels.descAnak : labels.descDewasa}
              </CardDescription>
            </CardHeader>

            <Tabs
              value={isAnak ? "anak" : "dewasa"}
              onValueChange={(val) => {
                reset();
                navigate({ to: "/register", search: { type: val as "dewasa" | "anak" } });
              }}
              className="mb-6"
            >
              <TabsList variant="line" className="w-full bg-transparent p-0 flex gap-8 border-b border-slate-100">
                <TabsTrigger
                  value="dewasa"
                  className="flex-1 flex items-center justify-center gap-2 pt-5 pb-4 rounded-none border-none data-[active]:bg-transparent data-[active]:text-slate-900 data-[active]:shadow-none transition-all"
                >
                  <img src="/dewasa.webp" alt="" className="w-[22px] h-[22px] object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> {labels.tabDewasa}
                </TabsTrigger>
                <TabsTrigger
                  value="anak"
                  className="flex-1 flex items-center justify-center gap-2 pt-5 pb-4 rounded-none border-none data-[active]:bg-transparent data-[active]:text-slate-900 data-[active]:shadow-none transition-all"
                >
                  <img src="/anak.webp" alt="" className="w-[22px] h-[22px] object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> {labels.tabAnak}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div
                key={isAnak ? "anak" : "dewasa"}
                initial={{ opacity: 0, x: isAnak ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAnak ? 20 : -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {isAnak && (
                  <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {labels.noteAnak}
                    </p>
                  </div>
                )}

                {status !== "idle" && (
                  <AlertMessage type={status} message={message} onClose={() => setStatus("idle")} />
                )}

                <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="label-name" className={labels.nameLabel(isAnak).includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                      {labels.nameLabel(isAnak).replace('*', '')}
                    </Label>
                    <Input
                      id="label-name"
                      placeholder={labels.namePlaceholder(isAnak)}
                      {...register("label-name", {
                        onChange: (e) => e.target.value = e.target.value.toUpperCase()
                      })}
                      className={cn(errors["label-name"] && "border-red-500 focus-visible:ring-red-500/30")}
                    />
                    {errors["label-name"] && (
                      <p className="text-[11px] font-medium text-red-500">{errors["label-name"]?.message as string}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idselect">{labels.idTypeLabel}</Label>
                      <Combobox
                        key={countryMode}
                        value={watch("idselect") || "newic"}
                        onValueChange={(val: string | null) => val && setValue("idselect", val, { shouldValidate: true })}
                      >
                        <ComboboxTrigger id="idselect">
                          <ComboboxValue className="truncate">
                            {idTypeOptions.find(opt => opt.value === watch("idselect"))?.label}
                          </ComboboxValue>
                        </ComboboxTrigger>
                        <ComboboxContent>
                          {idTypeOptions.map((opt) => (
                            <ComboboxItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxContent>
                      </Combobox>
                      {errors["idselect"] && (
                        <p className="text-[11px] font-medium text-red-500">{errors["idselect"]?.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="label-ic" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        {labels.icLabel(isAnak)}
                      </Label>
                      <Input
                        id="label-ic"
                        maxLength={20}
                        placeholder={labels.icPlaceholder(isAnak)}
                        {...register("label-ic", {
                          onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                        })}
                        onBlur={handleNikBlur}
                        className={cn(errors["label-ic"] && "border-red-500 focus-visible:ring-red-500/30")}
                      />
                      {errors["label-ic"] && (
                        <p className="text-[11px] font-medium text-red-500">{errors["label-ic"]?.message as string}</p>
                      )}
                    </div>
                  </div>

                  {isIndonesia && (
                    <div className="space-y-2">
                      <Label htmlFor="label-individualgstid">
                        {labels.npwpLabel} <span className="text-slate-400 font-normal">{labels.npwpDesc}</span>
                      </Label>
                      <Input
                        id="label-individualgstid"
                        placeholder={labels.npwpPlaceholder}
                        {...register("label-individualgstid", {
                          onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                        })}
                        className={cn(errors["label-individualgstid"] && "border-red-500 focus-visible:ring-red-500/30")}
                      />
                      {errors["label-individualgstid"] && (
                        <p className="text-[11px] font-medium text-red-500">{errors["label-individualgstid"]?.message as string}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="label-dob" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        {labels.dobLabel(isAnak)}
                      </Label>
                      <Input
                        id="label-dob"
                        type="date"
                        {...register("label-dob")}
                        readOnly={isDobDisabled}
                        className={cn(isDobDisabled && "bg-slate-100/80 text-slate-500 cursor-not-allowed opacity-90", errors["label-dob"] && "border-red-500 focus-visible:ring-red-500/30")}
                      />
                      {errors["label-dob"] && (
                        <p className="text-[11px] font-medium text-red-500">{errors["label-dob"]?.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="label-email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        {labels.emailLabel}
                      </Label>
                      <Input
                        id="label-email"
                        type="email"
                        placeholder={labels.emailPlaceholder}
                        {...register("label-email")}
                        className={cn(errors["label-email"] && "border-red-500 focus-visible:ring-red-500/30")}
                      />
                      {errors["label-email"] && (
                        <p className="text-[11px] font-medium text-red-500">{errors["label-email"]?.message as string}</p>
                      )}
                    </div>
                  </div>

                  {isAnak && (
                    <>
                      <div className="relative py-2 mt-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{labels.parentSectionTitle}</span></div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="label-parent-name" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          {labels.parentNameLabel}
                        </Label>
                        <Input
                          id="label-parent-name"
                          placeholder={labels.parentNamePlaceholder}
                          {...register("label-parent-name", {
                            onChange: (e) => e.target.value = e.target.value.toUpperCase()
                          })}
                          className={cn(errors["label-parent-name"] && "border-red-500 focus-visible:ring-red-500/30")}
                        />
                        {errors["label-parent-name"] && (
                          <p className="text-[11px] font-medium text-red-500">{errors["label-parent-name"]?.message as string}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent_idselect">{labels.idTypeLabel}</Label>
                          <Combobox
                            key={countryMode}
                            value={watch("parent_idselect") || "newic"}
                            onValueChange={(val: string | null) => val && setValue("parent_idselect", val, { shouldValidate: true })}
                          >
                            <ComboboxTrigger id="parent_idselect">
                              <ComboboxValue className="truncate">
                                {idTypeOptions.find(opt => opt.value === watch("parent_idselect"))?.label}
                              </ComboboxValue>
                            </ComboboxTrigger>
                            <ComboboxContent>
                              {idTypeOptions.map((opt) => (
                                <ComboboxItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxContent>
                          </Combobox>
                          {errors["parent_idselect"] && (
                            <p className="text-[11px] font-medium text-red-500">{errors["parent_idselect"]?.message as string}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="label-parent-ic" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                            {labels.parentIcLabel}
                          </Label>
                          <Input
                            id="label-parent-ic"
                            maxLength={20}
                            placeholder={labels.parentIcPlaceholder}
                            {...register("label-parent-ic", {
                              onChange: (e) => e.target.value = e.target.value.replace(/\D/g, "")
                            })}
                            className={cn(errors["label-parent-ic"] && "border-red-500 focus-visible:ring-red-500/30")}
                          />
                          {errors["label-parent-ic"] && (
                            <p className="text-[11px] font-medium text-red-500">{errors["label-parent-ic"]?.message as string}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="label-mobile" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      {labels.mobileLabel(isAnak)}
                    </Label>
                    <div className="flex -space-x-px">
                      <div className="w-[100px] sm:w-[120px]">
                        <Combobox
                          onValueChange={(val: string | null) => val && setValue("label-mobile-dialcode", val, { shouldValidate: true })}
                          value={watch("label-mobile-dialcode") || "62"}
                          inputValue={dialCodeSearch}
                          onInputValueChange={setDialCodeSearch}
                        >
                          <ComboboxTrigger className="rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 shadow-none">
                            <ComboboxValue className="truncate">
                              {dialCodeOptions.find(opt => opt.value === watch("label-mobile-dialcode"))?.label?.replace('+', '')}
                            </ComboboxValue>
                          </ComboboxTrigger>
                          <ComboboxContent>
                            <ComboboxInput placeholder="Cari kode negara..." />
                            <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                            {filteredDialCodes.map((opt) => (
                              <ComboboxItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxContent>
                        </Combobox>
                      </div>
                      <Input
                        id="label-mobile"
                        type="tel"
                        placeholder={labels.mobilePlaceholder}
                        {...register("label-mobile", { onChange: handlePhoneInput })}
                        className={cn("flex-1 rounded-l-none focus-visible:ring-offset-0", errors["label-mobile"] && "z-10 border-red-500")}
                      />
                    </div>
                    <div className="mt-1">
                      {errors["label-mobile"] ? (
                        <p className="text-[11px] font-medium text-red-500">{errors["label-mobile"]?.message as string}</p>
                      ) : phoneWarning && (
                        <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                          <AlertCircle className="w-3 h-3 shrink-0" /> {labels.mobileWarning}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upreferredbranch" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                      {labels.branchLabel}
                    </Label>
                    <Combobox
                      onValueChange={(val: string | null) => val && setValue("upreferredbranch", val, { shouldValidate: true })}
                      value={watch("upreferredbranch")}
                      inputValue={branchSearch}
                      onInputValueChange={setBranchSearch}
                    >
                      <ComboboxTrigger id="upreferredbranch" className={cn(errors["upreferredbranch"] && "border-red-500 focus-visible:ring-red-500/30")}>
                        <ComboboxValue className="truncate">
                          {activeBranchOptions.find(opt => opt.value === watch("upreferredbranch"))?.label || (isIndonesia ? "Pilih Cabang" : "Select Branch")}
                        </ComboboxValue>
                      </ComboboxTrigger>
                      <ComboboxContent>
                        {activeBranchOptions.length > 8 && (
                          <>
                            <ComboboxInput placeholder="Cari kantor cabang..." />
                            <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                          </>
                        )}
                        {filteredBranchOptions.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxContent>
                    </Combobox>
                    <p className={cn(
                      "text-[11px] font-medium transition-colors duration-200 mt-1.5",
                      errors["upreferredbranch"] ? "text-red-500" : "text-slate-400/90"
                    )}>
                      {errors["upreferredbranch"] ? (errors["upreferredbranch"]?.message as string) : labels.branchDesc}
                    </p>
                  </div>

                  <div className="pt-1 pb-1 space-y-4">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-red-200/50"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {labels.submittingBtn}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            {labels.submitBtn}
                          </div>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3 text-[13px] text-left transition-all duration-300 text-slate-800">
                      <div className="flex items-start sm:items-center gap-3 font-medium text-slate-800">
                        <input
                          type="checkbox"
                          id="newsletter"
                          className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 shrink-0 rounded border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                          {...register("newsletter")}
                        />
                        <Label htmlFor="newsletter" className="cursor-pointer">
                          {isIndonesia ? "Berlangganan & Setujui Syarat dan Ketentuan" : "Subscribe to newsletter & Agree to terms"}
                        </Label>
                      </div>

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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Hero Image Banner */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0c0c0e] overflow-hidden border-l border-slate-100 group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[100px] pointer-events-none z-0 group-hover:bg-red-600/20 transition-all duration-1000" />
          <img src="https://penang.chinapress.com.my/wp-content/uploads/2023/05/Public-Gold-1.jpg" alt="Investasi Emas Public Gold" className="absolute inset-0 z-10 w-full h-full object-cover object-left grayscale opacity-80 group-hover:scale-105 group-hover:opacity-70 transition-all duration-1000" />

          {/* Centered Logo */}
          <div className="absolute top-[15%] inset-x-0 z-[15] flex justify-center pointer-events-none">
            <img src="/logo.svg" alt="Public Gold Logo" className="w-64 sm:w-80 md:w-96 h-auto drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105" />
          </div>

          {/* Floating Help CTA */}
          <div className="absolute bottom-10 right-10 z-20">
            <a href="https://wa.me/628979901844" target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-4 bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 pr-7 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(37,211,102,0.2)] cursor-pointer overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#1da851] flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:shadow-[#25D366]/60 group-hover:scale-110 transition-all duration-500 ease-out">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
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
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-400 border-2 border-white"></span>
          </span>
        </a>

      </Card>

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
          showSwitchTo={showAgeSwitch as "dewasa" | "anak"}
          onConfirm={() => {
            setShowAgeSwitch(null);
            reset();
            navigate({ to: "/register", search: { type: showAgeSwitch as "dewasa" | "anak" } });
          }}
          onCancel={() => setShowAgeSwitch(null)}
        />
      )}

      {showNextStepModal && (
        <NextStepModal refId={ref || undefined} onClose={() => setShowNextStepModal(false)} />
      )}
    </div>
  );
}
