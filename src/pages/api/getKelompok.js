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
      valueRenderOption: "FORMATTED_VALUE", //
    });

    const values = response.data.values;
    const header = values[0];
    const rows = values.slice(1); // data tanpa header

    const namaIndex = header.indexOf("Nama Komoditas");
    const flagIndex = header.indexOf("Flag");
    const kodeIndex = header.indexOf("Kode Komoditas");

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

    result = result.map((row) => {
      const kodeRaw = row["Kode Komoditas"];

      // Jika kodenya cuma 1 digit (seperti "1"), tambahkan "0" di depannya
      const kodeFormatted =
        String(kodeRaw).trim().length === 1
          ? String(kodeRaw).padStart(2, "0")
          : String(kodeRaw);

      return {
        NamaKomoditas: row["Nama Komoditas"],
        Kode: kodeFormatted,
      };
    });
    // res.status(200).json({ data:result, jumlah: len });
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
