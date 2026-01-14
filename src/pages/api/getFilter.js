import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const decoded = Buffer.from(
      process.env.GOOGLE_CREDENTIALS,
      "base64"
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
      return res.status(200).json({
        komoditas: [],
        tahun: [],
        bulan: []
      });
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) =>
      headers.reduce((obj, key, i) => {
        obj[key] = row[i] || "";
        return obj;
      }, {})
    );

    // Extract unique values
    const komoditas = [...new Set(data.map((item) => item["Nama Komoditas"]?.trim()))].filter(Boolean);
    const tahun = [...new Set(data.map((item) => item["Tahun"]?.trim()))].filter(Boolean);
    const bulan = [...new Set(data.map((item) => item["Bulan"]?.trim()))].filter(Boolean);

    res.status(200).json({ komoditas, tahun, bulan });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ message: "Server error" });
  }
}
