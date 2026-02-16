import { google } from "googleapis";

export default async function handler(req, res) {
  const inputFlag = (req.query.flag ?? "1").toString().trim();

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
      range: "Sheet1!A:E",
    });

    const values = response.data.values;
    const header = values[0];
    const rows = values.slice(1); // data tanpa header

    const namaIndex = header.indexOf("Nama Komoditas");
    const flagIndex = header.indexOf("Flag");

    const normalizeNama = (row) =>
      (row[namaIndex] || "").toString().trim().toLowerCase();

    const uniqueByPeriode = new Map();

    rows.forEach((row) => {
      if (row[flagIndex] === inputFlag) {
        const namaKomoditas = normalizeNama(row);

        if (!uniqueByPeriode.has(namaKomoditas)) {
          uniqueByPeriode.set(namaKomoditas, row);
        }
      }
    });

    let result = Array.from(uniqueByPeriode.values()).map((row) =>
      header.reduce((obj, key, i) => {
        obj[key] = row[i] ?? null;
        return obj;
      }, {}),
    );

    result = result.map((row) => row["Nama Komoditas"]);
    // const len = result.length;

    // res.status(200).json({ data:result, jumlah: len });
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
