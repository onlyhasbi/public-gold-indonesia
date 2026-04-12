import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { dialCodeOptions } from "../constant/countries";
import { branchLabelOptions } from "../constant/branches";
import { extractDataFromNIK, calculateAge } from "../lib/utils";
import { formatPhoneForAPI } from "../lib/phone";
import { getValidationSchema } from "../lib/validations";
import { api } from "../lib/api";
import { useMutation } from "@tanstack/react-query";

export type FormSummaryItem = {
  label: string;
  value: string;
};

export function useRegisterForm(isAnak: boolean, countryMode: "ID" | "MY" | "INTL", referralData?: any) {
  const isIndonesia = countryMode === "ID";
  const [isDobDisabled, setIsDobDisabled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmItems, setConfirmItems] = useState<FormSummaryItem[]>([]);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [showAgeSwitch, setShowAgeSwitch] = useState<"anak" | "dewasa" | null>(null);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const pendingFormData = useRef<string | null>(null);
  const pendingEndpoint = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, touchedFields }
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: yupResolver(getValidationSchema(isAnak, isIndonesia)),
    defaultValues: {
      'label-name': '',
      'idselect': countryMode === 'INTL' ? 'passportforeign' : 'newic',
      'label-ic': '',
      'label-individualgstid': '',
      'label-dob': '',
      'label-email': '',
      'label-mobile': '',
      'label-mobile-dialcode': isIndonesia ? '62' : '60',
      'upreferredbranch': '',
      'label-parent-name': '',
      'parent_idselect': countryMode === 'INTL' ? 'passportforeign' : 'newic',
      'label-parent-ic': '',
      'newsletter': true,
    }
  });

  const onSubmit = (values: any) => {
    setErrorMessage("");
    setSuccessMessage("");

    const age = calculateAge(values['label-dob']);
    if (isAnak && age >= 18) {
      setShowAgeSwitch("dewasa");
      return;
    }
    if (!isAnak && age < 18) {
      setShowAgeSwitch("anak");
      return;
    }

    const payload = new URLSearchParams();
    payload.append("newsletter", values.newsletter ? "1" : "0");
    Object.entries(values).forEach(([key, val]) => {
      if (key !== "newsletter") payload.append(key, val as string);
    });
    
    // Referral Logic: URL-based referral data > HQ Default (Only as safety, since page guards are in place)
    const refPgcode = referralData?.pgcode || "PG01387609";
    const refName = (referralData?.nama_panggilan || referralData?.nama_lengkap) || "A. MUH. HASBI HAERURRIJAL ";

    payload.append("label-intro-pgcode", refPgcode);
    payload.append("label-intro-name", refName);

    pendingFormData.current = payload.toString();

    const proxyPrefix = isIndonesia ? "/api-proxy" : "/api-proxy-my";
    const baseUrl = `${proxyPrefix}/index.php?route=account/register&intro_pgcode=${refPgcode}&is_dealer=1`;
    pendingEndpoint.current = isAnak ? `${baseUrl}&form_type=ja` : baseUrl;

    const branchLabel = branchLabelOptions[values.upreferredbranch as keyof typeof branchLabelOptions] || "-";

    const dialOption = dialCodeOptions.find((o) => o.value === values['label-mobile-dialcode']);
    const dialLabel = dialOption ? `+${dialOption.value}` : `+${values['label-mobile-dialcode']}`;

    const idTypeLabel = values.idselect === "passportforeign" ? (isIndonesia ? "PASPOR" : "PASSPORT / FOREIGN ID") : (isIndonesia ? "KTP" : "NEW IC");

    const items: FormSummaryItem[] = [
      { label: isAnak ? "Nama Anak" : "Nama Lengkap", value: values['label-name'] || "-" },
      { label: isAnak ? "Tipe Identitas Anak" : "Tipe Identitas", value: idTypeLabel },
      { label: isAnak ? "Nomor Identitas Anak" : "Nomor Identitas", value: values['label-ic'] || "-" },
    ];

    if (isIndonesia) {
      items.push({ label: "NPWP", value: values['label-individualgstid'] || "-" });
    }

    items.push(
      { label: isAnak ? "Tanggal Lahir Anak" : "Tanggal Lahir", value: values['label-dob'] || "-" },
      { label: "Email", value: values['label-email'] || "-" },
    );

    if (isAnak) {
      const parentIdTypeLabel = values.parent_idselect === "passportforeign" ? (isIndonesia ? "PASPOR" : "PASSPORT / FOREIGN ID") : (isIndonesia ? "KTP" : "NEW IC");
      items.push(
        { label: "Nama Orang Tua", value: values['label-parent-name'] || "-" },
        { label: "Tipe Identitas Orang Tua", value: parentIdTypeLabel },
        { label: "No. Identitas Orang Tua", value: values['label-parent-ic'] || "-" },
      );
    }

    items.push(
      { label: "Nomor Handphone", value: `${dialLabel} ${values['label-mobile'] || "-"}` },
      { label: "Cabang Terdekat", value: branchLabel },
    );

    setConfirmItems(items);
    setShowConfirm(true);
  };

  const handleNikBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // We no longer trigger manual validation on blur as requested
    const nik = e.currentTarget.value;
    const { validFormat, dateOfBirth } = extractDataFromNIK(nik);

    if (validFormat && dateOfBirth) {
      setValue("label-dob", dateOfBirth, { shouldValidate: false, shouldDirty: true });
      setIsDobDisabled(true);
    } else {
      setIsDobDisabled(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, "");
    e.target.value = cleaned;
    setPhoneWarning(cleaned.startsWith("0"));
    return cleaned;
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!pendingFormData.current || !pendingEndpoint.current) return;

      const response = await fetch(pendingEndpoint.current, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: pendingFormData.current,
        redirect: "manual",
      });

      if (response.type === "opaqueredirect" || (response.status >= 300 && response.status < 400)) {
        // Track locally
        const values = getValues();
        if (referralData?.pageid) {
          const dialCode = values['label-mobile-dialcode'] || '62';
          const fullPhone = formatPhoneForAPI(dialCode, values['label-mobile']);
          api.post("/public/register-track", {
            pageid: referralData.pageid,
            nama: values['label-name'],
            branch: values['upreferredbranch'],
            no_telpon: `+${fullPhone}`
          }).catch((err: any) => console.warn("Track failed:", err));
        }
        return { success: true, message: "Pendaftaran berhasil! Silakan cek email Anda untuk langkah selanjutnya." };
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

      // Track locally for success case
      const values = getValues();
      if (referralData?.pageid) {
        const dialCode = values['label-mobile-dialcode'] || '62';
        const fullPhone = formatPhoneForAPI(dialCode, values['label-mobile']);
        api.post("/public/register-track", {
          pageid: referralData.pageid,
          nama: values['label-name'],
          branch: values['upreferredbranch'],
          no_telpon: `+${fullPhone}`
        }).catch((err: any) => console.warn("Track failed:", err));
      }

      return {
        success: true,
        message: successAlert?.textContent?.trim() || "Pendaftaran berhasil! Silakan cek email Anda untuk langkah selanjutnya."
      };
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        setSuccessMessage(data.message);
        reset();
        setIsDobDisabled(false);
        setPhoneWarning(false);
        setFormKey(prev => prev + 1);
      }
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
    }
  });

  const confirmSubmit = async () => {
    setShowConfirm(false);
    registerMutation.mutate();
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    touchedFields,
    setValue,
    watch,
    getValues,
    reset,
    isLoading: registerMutation.isPending,
    status: registerMutation.isSuccess ? ("success" as const) : registerMutation.isError ? ("error" as const) : ("idle" as const),
    message: registerMutation.isSuccess ? successMessage : errorMessage,
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
    setStatus: (val: "idle") => {
      if (val === "idle") registerMutation.reset();
    },
  };
}
