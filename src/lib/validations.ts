import * as yup from "yup";

const nameRegex = /^[a-zA-Z\s.,]+$/;
const nameErrMsg = "Hanya boleh huruf, spasi, titik (.), dan koma (,)";

export const getValidationSchema = (isAnak: boolean, isIndonesia: boolean) => {
  const schemaShape: any = {
    'label-name': yup.string()
      .matches(nameRegex, nameErrMsg)
      .required("Nama wajib diisi"),
    'idselect': yup.string(),
    'label-ic': yup.string()
      .required("Nomor identitas wajib diisi")
      .max(20, "Maksimal 20 digit"),
    'label-dob': yup.string().required("Tanggal lahir wajib diisi"),
    'label-email': yup.string().email("Format email tidak valid").required("Email wajib diisi"),
    'label-mobile': yup.string()
      .matches(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka")
      .required("Nomor handphone wajib diisi"),
    'upreferredbranch': yup.string().required("Cabang wajib dipilih"),
    ...(isAnak ? {
      'label-parent-name': yup.string()
        .matches(nameRegex, nameErrMsg)
        .required("Nama orang tua wajib diisi"),
      'label-parent-ic': yup.string()
        .required("Nomor identitas orang tua wajib diisi")
        .max(20, "Maksimal 20 digit"),
    } : {})
  };

  if (isIndonesia) {
    schemaShape['label-individualgstid'] = yup.string();
  }

  return yup.object().shape(schemaShape);
};
