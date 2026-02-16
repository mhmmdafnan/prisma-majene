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
    const tahun = Number(req.query.tahun) || now.getFullYear();
    const bulan = Number(req.query.bulan) || now.getMonth() + 1;
    const tipe = req.query.tipe; // WAJIB

    if (!tipe) {
      return res.status(400).json({
        message: "Parameter 'tipe' wajib diisi",
      });
    }

    // ===== Range 12 bulan ke belakang =====
    let monthsRange = [];
    for (let i = 0; i < 12; i++) {
      let m = bulan - i;
      let y = tahun;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      monthsRange.push({ month: m, year: y });
    }

    // ===== Filter + mapping graph =====
    const graph = data
      .filter((item) => {
        const itemMonth = Number(item["Bulan"]);
        const itemYear = Number(item["Tahun"]);

        return (
          item["Nama Komoditas"] === nama &&
          monthsRange.some((m) => m.month === itemMonth && m.year === itemYear)
        );
      })
      .map((item) => ({
        Tahun: Number(item["Tahun"]),
        Bulan: Number(item["Bulan"]),
        NamaKomoditas: item["Nama Komoditas"],
        nilai: Number(item[tipe] || 0),
      }))
      .sort((a, b) => a.Tahun - b.Tahun || a.Bulan - b.Bulan);

    res.status(200).json(graph);
  } catch (error) {
    console.error("Graph API error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
