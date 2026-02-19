// ... (bagian import dan auth tetap sama)
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // 1. Ambil parameter dari frontend
    const { tahun, bulan, flag, kode_filter } = req.query;

    const decoded = Buffer.from(
      process.env.GOOGLE_CREDENTIALS,
      "base64",
    ).toString("utf-8");

    const credentials = JSON.parse(decoded);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1R9_IijsAoi9UYZvipw7zkzyIsbCibR-R9BSUYSAcp7U",
      range: "Sheet1!A1:L8000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return res.status(200).json([]);

    const headers = rows[0];
    const data = rows.slice(1).map((row) =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] || "";
        return obj;
      }, {}),
    );

    // 2. Logika Filtering
    let filteredData = data.filter((d) => {
      const matchWaktu =
        Number(d["Tahun"]) ===
          (tahun ? Number(tahun) : new Date().getFullYear()) &&
        Number(d["Bulan"]) ===
          (bulan ? Number(bulan) : new Date().getMonth() + 1);

      const matchFlag = flag ? String(d["Flag"]) === String(flag) : true;

      let matchKode = true;
      if (kode_filter) {
        // Ambil 2 digit awal dari kode yang mau difilter
        const prefixFilter = String(kode_filter)
          .padStart(2, "0")
          .substring(0, 2);

        // Ambil 2 digit awal dari data di Excel
        const dataKodePrefix = String(d["Kode Komoditas"])
          .padStart(2, "0")
          .substring(0, 2);

        // Bandingkan apakah 2 digit awalnya sama
        matchKode = dataKodePrefix === prefixFilter;
      }

      return matchWaktu && matchFlag && matchKode;
    });

    // 3. Format "Andil Inflasi" biar desimalnya pake koma (Solusi masalah sebelumnya)
    const finalData = filteredData.map((item) => {
      let andilRaw = item["Andil Inflasi"] || "0";
      // Pastikan titik jadi standar sebelum diubah ke koma Indo
      let andilNum = parseFloat(andilRaw.replace(",", "."));

      return {
        ...item,
        "Andil Inflasi": new Intl.NumberFormat("id-ID", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }).format(andilNum),
      };
    });

    res.status(200).json(finalData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
