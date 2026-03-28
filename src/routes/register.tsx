import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send, ChevronDown, ChevronUp, AlertCircle, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Select from "react-select";
import { branchOptionsId, branchOptionsMy } from "../constant/branches";
import { dialCodeOptions } from "../constant/countries";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { labelsID, labelsMY } from "../lib/register-text";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { InputField, SelectField, AlertMessage, inputClass } from "../components/ui/form-elements";
import { ConfirmationModal, AgeSwitchModal } from "../components/RegisterModals";

type RegisterSearch = {
  type?: "dewasa" | "anak";
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type: search.type === "anak" ? "anak" : "dewasa",
    };
  },
});

function RegisterPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const isAnak = type === "anak";

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
    formik,
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
    handleNikBlur,
    handlePhoneInput,
    confirmSubmit,
  } = useRegisterForm(isAnak, countryMode);

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
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8">

      <div className="w-full max-w-[1320px] bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden border border-white/50">

        {/* Left Column: Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 xl:p-16 xl:px-20 flex flex-col justify-center relative bg-white">
          <div className="w-full max-w-lg mx-auto">

            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-medium text-sm">
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

            {/* Tab Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  navigate({ to: "/register", search: { type: "dewasa" } });
                }}
                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer", !isAnak ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                <img src="./dewasa.webp" alt="" className="w-5 h-5 object-cover rounded-full" style={{ objectPosition: "center 10%" }} /> {labels.tabDewasa}
              </button>
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
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

            <form key={formKey} onSubmit={formik.handleSubmit} className="space-y-6">
              <InputField
                label={labels.nameLabel(isAnak)}
                id="label-name"
                required
                placeholder={labels.namePlaceholder(isAnak)}
                {...formik.getFieldProps("label-name")}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  formik.handleChange(e);
                }}
                error={formik.touched["label-name"] && formik.errors["label-name"]}
              />

              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                <SelectField
                  label={labels.idTypeLabel}
                  id="idselect"
                  options={idTypeOptions}
                  {...formik.getFieldProps("idselect")}
                  error={formik.touched["idselect"] && formik.errors["idselect"]}
                />
                <InputField
                  label={<span>{labels.icLabel(isAnak)}</span>}
                  id="label-ic"
                  required
                  maxLength={20}
                  {...formik.getFieldProps("label-ic")}
                  onBlur={handleNikBlur}
                  placeholder={labels.icPlaceholder(isAnak)}
                  error={formik.touched["label-ic"] && formik.errors["label-ic"]}
                />
              </div>

              {isIndonesia && (
                <InputField
                  label={<span>{labels.npwpLabel} <span className="text-slate-400 font-normal">{labels.npwpDesc}</span></span>}
                  id="label-individualgstid"
                  placeholder={labels.npwpPlaceholder}
                  {...formik.getFieldProps("label-individualgstid")}
                  error={formik.touched["label-individualgstid"] && formik.errors["label-individualgstid"]}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label={labels.dobLabel(isAnak)}
                  id="label-dob"
                  type="date"
                  required
                  {...formik.getFieldProps("label-dob")}
                  readOnly={isDobDisabled}
                  className={cn(inputClass, isDobDisabled && "bg-slate-100/80 text-slate-500 cursor-not-allowed opacity-90")}
                  error={formik.touched["label-dob"] && formik.errors["label-dob"]}
                />
                <InputField
                  label={labels.emailLabel}
                  id="label-email"
                  type="email"
                  required
                  placeholder={labels.emailPlaceholder}
                  {...formik.getFieldProps("label-email")}
                  error={formik.touched["label-email"] && formik.errors["label-email"]}
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
                    {...formik.getFieldProps("label-parent-name")}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      formik.handleChange(e);
                    }}
                    error={formik.touched["label-parent-name"] && formik.errors["label-parent-name"]}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
                    <SelectField
                      label={labels.idTypeLabel}
                      id="parent_idselect"
                      options={idTypeOptions}
                      {...formik.getFieldProps("parent_idselect")}
                      error={formik.touched["parent_idselect"] && formik.errors["parent_idselect"]}
                    />
                    <InputField
                      label={labels.parentIcLabel}
                      id="label-parent-ic"
                      required
                      maxLength={20}
                      placeholder={labels.parentIcPlaceholder}
                      {...formik.getFieldProps("label-parent-ic")}
                      error={formik.touched["label-parent-ic"] && formik.errors["label-parent-ic"]}
                    />
                  </div>
                </>
              )}

              <InputField
                label={labels.mobileLabel(isAnak)}
                id="label-mobile"
                required
                error={formik.touched["label-mobile"] && formik.errors["label-mobile"]}
              >
                <div className="relative pb-0.5">
                  <div className="flex gap-2 sm:gap-3">
                    <Select
                      name="label-mobile-dialcode"
                      options={dialCodeOptions}
                      value={dialCodeOptions.find((o) => o.value === formik.values["label-mobile-dialcode"])}
                      onChange={(opt) => formik.setFieldValue("label-mobile-dialcode", opt?.value)}
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
                      {...formik.getFieldProps("label-mobile")}
                      onChange={handlePhoneInput}
                      className={cn(inputClass, formik.touched["label-mobile"] && formik.errors["label-mobile"] && "border-red-500 focus:ring-red-500/30 focus:border-red-500", "flex-1 min-w-0")}
                    />
                  </div>
                  <div className="absolute top-full left-1 mt-1">
                    {phoneWarning && !formik.errors["label-mobile"] && (
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
                {...formik.getFieldProps("upreferredbranch")}
                error={formik.touched["upreferredbranch"] && formik.errors["upreferredbranch"]}
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
                    <input type="checkbox" className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 shrink-0 rounded border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer" {...formik.getFieldProps("newsletter")} checked={formik.values.newsletter} />
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
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0c0c0e] overflow-hidden border-l border-slate-100">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-red-600/10 blur-[100px] pointer-events-none z-0" />
          <img src="https://penang.chinapress.com.my/wp-content/uploads/2023/05/Public-Gold-1.jpg" alt="Investasi Emas Public Gold" className="absolute inset-0 z-10 w-full h-full object-cover object-left grayscale opacity-80" />

          {/* Floating Help CTA */}
          <div className="absolute bottom-10 right-10 z-20">
            <a href="https://wa.me/628979901844" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 p-4 pr-6 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center border border-[#25D366]/30 group-hover:bg-[#25D366]/40 group-hover:scale-110 transition-all duration-300">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div className="text-left">
                <p className="text-white/70 text-sm font-medium mb-0.5">Perlu bantuan?</p>
                <p className="text-white font-bold text-lg leading-none">Hubungi Hasbi</p>
              </div>
            </a>
          </div>
        </div>

        {/* Mobile-only Floating WA Button */}
        <a href="https://wa.me/628979901844" target="_blank" rel="noopener noreferrer" className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg shadow-[#25D366]/30 hover:-translate-y-1 hover:scale-105 transition-all duration-300">
          <MessageCircle className="w-6 h-6" />
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
            formik.resetForm();
            navigate({ to: "/register", search: { type: showAgeSwitch } });
          }}
          onCancel={() => setShowAgeSwitch(null)}
        />
      )}
    </div>
  );
}
