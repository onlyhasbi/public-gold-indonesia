export type RegisterLabels = {
  titleDewasa: string;
  descDewasa: string;
  titleAnak: string;
  descAnak: string;
  tabDewasa: string;
  tabAnak: string;
  noteAnak: string;

  parentSectionTitle: string;
  nameLabel: (isAnak: boolean) => string;
  namePlaceholder: (isAnak: boolean) => string;

  idTypeLabel: string;
  icLabel: (isAnak: boolean) => string;
  icPlaceholder: (isAnak: boolean) => string;

  npwpLabel: string;
  npwpDesc: string;
  npwpPlaceholder: string;

  dobLabel: (isAnak: boolean) => string;
  emailLabel: string;
  emailPlaceholder: string;

  parentNameLabel: string;
  parentNamePlaceholder: string;
  parentIcLabel: string;
  parentIcPlaceholder: string;

  mobileLabel: (isAnak: boolean) => string;
  mobilePlaceholder: string;
  mobileWarning: string;

  branchLabel: string;
  branchDesc: string;

  submitBtn: string;
  submittingBtn: string;

  termsText: string;
  termsLink: string;
};

export const labelsID: RegisterLabels = {
  titleDewasa: "Pendaftaran Akun Dewasa",
  descDewasa:
    "Daftar sekarang dan mulai perjalanan investasi emas Anda bersama Public Gold Indonesia.",
  titleAnak: "Pendaftaran Akun Anak",
  descAnak:
    "Daftarkan anak Anda untuk memulai perjalanan investasi emas bersama Public Gold Indonesia.",
  tabDewasa: "Akun Dewasa",
  tabAnak: "Akun Anak",
  noteAnak:
    "Catatan: Anak di bawah 18 tahun harus didampingi orang tua atau wali. Setelah anak mencapai usia 18 tahun, akun bisa ditransfer ke nama mereka sendiri.",

  parentSectionTitle: "Data Orang Tua / Wali",
  nameLabel: (isAnak) => (isAnak ? "Nama Anak" : "Nama Lengkap"),
  namePlaceholder: (isAnak) =>
    isAnak
      ? "Masukkan nama anak (sesuai kartu identitas)"
      : "Masukkan nama lengkap",

  idTypeLabel: "Tipe Identitas",
  icLabel: (isAnak) => (isAnak ? "NIK Anak" : "Nomor Identitas"),
  icPlaceholder: (isAnak) =>
    isAnak ? "Masukkan NIK anak (maks. 20 digit)" : "Masukkan nomor KTP/Paspor",

  npwpLabel: "NPWP",
  npwpDesc: "(opsional)",
  npwpPlaceholder: "Masukkan NPWP jika ada",

  dobLabel: (isAnak) => (isAnak ? "Tanggal Lahir Anak" : "Tanggal Lahir"),
  emailLabel: "Email",
  emailPlaceholder: "contoh@email.com",

  parentNameLabel: "Nama Orang Tua",
  parentNamePlaceholder: "Masukkan nama orang tua (sesuai kartu identitas)",
  parentIcLabel: "No. Identitas Orang Tua",
  parentIcPlaceholder: "Masukkan identitas (maks. 20 digit)",

  mobileLabel: (isAnak) => (isAnak ? "Nomor WhatsApp" : "Nomor Handphone"),
  mobilePlaceholder: "8123456789",
  mobileWarning: "Tidak perlu memasukkan angka 0 di awal.",

  branchLabel: "Kantor Cabang Terdekat",
  branchDesc: "Pilih kantor cabang terdekat dari lokasi Anda",

  submitBtn: "Kirim",
  submittingBtn: "Mengirim...",

  termsText:
    "Dengan melanjutkan proses, saya menyetujui bahwa Public Gold Indonesia dapat mengumpulkan, menggunakan informasi yang telah saya bagikan sesuai dengan kebijakan kerahasiaan data dan saya menyetujui serta memenuhi syarat dan ketentuan yang telah saya baca dan pahami.",
  termsLink: "kebijakan kerahasiaan data",
};

export const labelsMY: RegisterLabels = {
  titleDewasa: "Adult Account Registration",
  descDewasa:
    "Register now and begin your gold wealth journey with Public Gold.",
  titleAnak: "Junior Account Registration",
  descAnak:
    "Register your child's account to start their gold savings journey.",
  tabDewasa: "Adult Account",
  tabAnak: "Junior Account",
  noteAnak:
    "Remark: Children below 18 years old must be accompanied by a parent or guardian to open an account. After the child reaches the age of majority (18), the account can be transferred to their name alone.",

  parentSectionTitle: "Parent / Guardian Details",
  nameLabel: (isAnak) => (isAnak ? "Child Name" : "Full Name"),
  namePlaceholder: () => "Enter your name",

  idTypeLabel: "ID Type",
  icLabel: (isAnak) => (isAnak ? "Child IC / Passport" : "IC / Passport No"),
  icPlaceholder: () => "Enter your IC or Passport Number",

  npwpLabel: "NPWP",
  npwpDesc: "(optional)",
  npwpPlaceholder: "",

  dobLabel: (isAnak) => (isAnak ? "Child Date of Birth" : "Date of Birth"),
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",

  parentNameLabel: "Parent / Guardian Name",
  parentNamePlaceholder: "Enter parent name",
  parentIcLabel: "Parent IC / Passport No",
  parentIcPlaceholder: "Enter parent IC",

  mobileLabel: () => "Mobile No",
  mobilePlaceholder: "Enter your Mobile No",
  mobileWarning: "Please do not include the starting 0.",

  branchLabel: "Preferred Branch",
  branchDesc: "Select your preferred branch location",

  submitBtn: "Submit",
  submittingBtn: "Submitting...",

  termsText:
    "By proceeding, I confirm that the information provided is true, accurate, and complete. I understand that this application is subject to approval by Public Gold. I agree to be bound by the company’s regulations, Terms & Conditions, and Privacy Policy.",
  termsLink: "Privacy Policy",
};
