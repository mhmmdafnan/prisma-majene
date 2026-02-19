import { google } from "googleapis";

export default async function handler(req, res) {
  try {
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
    let data = rows.slice(1).map((row) =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] || "";
        return obj;
      }, {}),
    );

    // ==== Default Value ====
    const now = new Date();
    const defaultNama = "UMUM";
    const defaultTahun = now.getFullYear();
    const defaultBulan = now.getMonth(); // bulan 1-12

    // ==== Ambil parameter dari frontend atau fallback ke default ====
    const nama = req.query.nama || defaultNama;
    const tahun = Number(req.query.tahun) || defaultTahun;
    const bulan = Number(req.query.bulan) || defaultBulan;
    const prevBulan = bulan === 1 ? 12 : bulan - 1;
    const prevTahun = bulan === 1 ? tahun - 1 : tahun;

    let tipe = null;
    if (req.query.tipe) {
      tipe = req.query.tipe;
    }

    // ==== Ambil data utama (bulan tertentu) ====

    const filtered = data.find(
      (item) =>
        item["Nama Komoditas"] === nama &&
        Number(item["Tahun"]) === tahun &&
        Number(item["Bulan"]) === bulan,
    );

    const prev = data.find(
      (item) =>
        item["Nama Komoditas"] === nama &&
        Number(item["Tahun"]) === prevTahun &&
        Number(item["Bulan"]) === prevBulan,
    );

    // let graph = data.filter((item) => {
    //   let itemMonth = Number(item["Bulan"]);
    //   let itemYear = Number(item["Tahun"]);
    //   return itemMonth === bulan && itemYear === tahun;
    // });

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

    graph = data
      .filter((item) => {
        let itemMonth = Number(item["Bulan"]);
        let itemYear = Number(item["Tahun"]);
        return (
          item["Nama Komoditas"] === nama &&
          monthsRange.some((m) => m.month === itemMonth && m.year === itemYear)
        );
      })
      .sort((a, b) => {
        let aDate = new Date(Number(a["Tahun"]), Number(a["Bulan"]) - 1);
        let bDate = new Date(Number(b["Tahun"]), Number(b["Bulan"]) - 1);
        return bDate - aDate;
      });

    res.status(200).json({
      filtered,
      prev, // data spesifik bulan ini
      graph, // 12 bulan terakhir
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).json({ message: "Server error" });
  }
}
