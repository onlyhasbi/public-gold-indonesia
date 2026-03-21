import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractDataFromNIK = (nik: string) => {
    // Pastikan NIK berupa string dan persis 16 digit angka
    const regex = /^[0-9]{16}$/;
    if (!regex.test(nik)) {
        return { validFormat: false, error: "Format NIK tidak valid" };
    }

    // Ambil string tanggal, bulan, tahun
    let day = parseInt(nik.substring(6, 8));
    let month = parseInt(nik.substring(8, 10));
    let year = parseInt(nik.substring(10, 12));

    // Menentukan jenis kelamin (Jika tanggal > 40, berarti Perempuan)
    let gender = "Laki-laki";
    if (day > 40) {
        gender = "Perempuan";
        day = day - 40; // Kembalikan ke tanggal asli
    }

    // NIK hanya menyimpan 2 digit tahun (misal: 93 untuk 1993, 05 untuk 2005)
    // Kita perlu menebak abadnya. Logika umumnya: jika di atas tahun saat ini, pasti 1900-an.
    const currentYear2Digits = new Date().getFullYear() % 100;
    const fullYear = year > currentYear2Digits ? 1900 + year : 2000 + year;

    // Format agar selalu 2 digit (misal: '09', '05')
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    // Return tanggal dalam format YYYY-MM-DD
    return {
        validFormat: true,
        gender: gender,
        dateOfBirth: `${fullYear}-${formattedMonth}-${formattedDay}`
    };
};
