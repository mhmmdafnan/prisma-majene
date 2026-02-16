import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // ===== Auth Google Sheets =====
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
    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] || "";
        return obj;
      }, {}),
    );

    // ===== Default & Query =====
    const now = new Date();
    const nama = req.query.nama;
    const tahun = Number(req.query.tahun);
    const bulan = Number(req.query.bulan);
    const tipe = req.query.tipe; // WAJIB

    if (!tipe) {
      return res.status(400).json({
        message: "Parameter 'tipe' wajib diisi",
      });
    }

    // ===== Range 12 bulan ke belakang =====
    let graph = [];
    let monthsRange = [];
    for (let i = 0; i < 13; i++) {
      let m = bulan - i;
      let y = tahun;

      if (m <= 0) {
        m += 12;
        y -= 1;
      }

      monthsRange.push({ month: m, year: y });
    }
    // Filter dulu berdasarkan komoditas
    const filteredKomoditas = data.filter(
      (item) => item["Nama Komoditas"] === nama,
    );

    if (filteredKomoditas.length === 0) return [];

    const lastDate = filteredKomoditas
      .map((item) => new Date(Number(item["Tahun"]), Number(item["Bulan"]) - 1))
      .sort((a, b) => b - a)[0];

    const lastMonth = lastDate.getMonth() + 1;
    const lastYear = lastDate.getFullYear();

    if (tahun > lastYear || (tahun === lastYear && bulan > lastMonth)) {
      return res.status(200).json(graph);
    } else {
      graph = filteredKomoditas
        .filter((item) => {
          let itemMonth = Number(item["Bulan"]);
          let itemYear = Number(item["Tahun"]);

          return monthsRange.some(
            (m) => m.month === itemMonth && m.year === itemYear,
          );
        })
        .map((item) => ({
          Tahun: Number(item["Tahun"]),
          Bulan: Number(item["Bulan"]),
          NamaKomoditas: item["Nama Komoditas"],
          nilai: Number(item[tipe]),
        }))
        .sort((a, b) => {
          return (
            new Date(b.Tahun, b.Bulan - 1) - new Date(a.Tahun, a.Bulan - 1)
          );
        });
    }

    res.status(200).json(graph);
  } catch (error) {
    console.error("Graph API error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
