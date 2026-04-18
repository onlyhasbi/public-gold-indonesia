import * as yup from "yup";

export const signinSchema = yup.object().shape({
  pgcode: yup.string().required("PGCode wajib diisi"),
  katasandi: yup.string().required("Password wajib diisi"),
});

export const signupSchema = yup.object().shape({
  pgcode: yup.string().required("PGCode wajib diisi"),
  katasandi: yup
    .string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
  pageid: yup
    .string()
    .matches(
      /^[a-zA-Z0-9_\-]+$/,
      "Hanya alfabet, angka, underscore (_), atau strip (-) yang diperbolehkan",
    )
    .required("Page ID wajib diisi"),
  country_code: yup.string().default("62"),
  no_telpon: yup.string().required("No. Telepon wajib diisi"),
});
