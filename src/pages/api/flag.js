import { google } from "googleapis";
export default async function handler(req, res) {
  const { flag } = req.query;

  if (!["0", "1", "2", "3"].includes(flag)) {
    return res.status(400).json({ message: "flag tidak valid" });
  }

  res.status(200).json({
    flag,
    message: "OK",
  });
}
