import { object, string } from "yup";

export const signinSchema = object().shape({
  pgcode: string().required("PGCode wajib diisi"),
  katasandi: string().required("Password wajib diisi"),
});

export const signupSchema = object().shape({
  pgcode: string().required("PGCode wajib diisi"),
  katasandi: string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
  pageid: string()
    .matches(
      /^[a-zA-Z0-9_\-]+$/,
      "Hanya alfabet, angka, underscore (_), atau strip (-) yang diperbolehkan",
    )
    .required("Page ID wajib diisi"),
  country_code: string().default("62"),
  no_telpon: string().required("No. Telepon wajib diisi"),
});
