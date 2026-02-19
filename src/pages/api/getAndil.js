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
    // const defaultNama = "UMUM";
    const defaultTahun = now.getFullYear();
    const defaultBulan = now.getMonth() + 1;

    const tahun = req.query.tahun ? Number(req.query.tahun) : defaultTahun;

    const bulan = req.query.bulan ? Number(req.query.bulan) : defaultBulan;

    const flag = req.query.flag ?? "1";

    // Filter dasar berdasarkan Tahun, Bulan, dan Flag
    let filteredData = data.filter((d) => {
      return (
        Number(d["Tahun"]) === tahun &&
        Number(d["Bulan"]) === bulan &&
        String(d["Flag"]) === String(flag)
      );
    });

    // jika flag == 3 (Top 10 & Bottom 10)
    if ((flag == "3" || flag == "2") && filteredData.length > 0) {
      const sortedData = [...filteredData].sort(
        (a, b) => Number(b.nilai) - Number(a.nilai),
      );

      if (sortedData.length <= 20) {
        filteredData = sortedData;
      } else {
        const top10 = sortedData.slice(0, 10);
        const bottom10 = sortedData.slice(-10);

        filteredData = [...top10, ...bottom10];
      }
    }

    data = filteredData;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    res.status(500).json({ message: "Server error" });
  }
}
