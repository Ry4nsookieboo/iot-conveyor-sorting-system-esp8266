import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove, set } from "firebase/database";
import { Parser } from "json2csv";

const app = express();
app.use(cors());
const PORT = 5000;

// Firebase Config
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Endpoint: Ekspor Data ke CSV
app.get("/api/export", async (req, res) => {
  try {
    const snapshot = await get(ref(db, "conveyor/history"));
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ message: "Tidak ada data untuk diekspor." });
    }

    const records = Object.keys(data).map((key) => ({
      id: key,
      berat: data[key].berat,
      tanggal: data[key].tanggal,
      status: data[key].status,
    }));

    const parser = new Parser();
    const csv = parser.parse(records);

    res.header("Content-Type", "text/csv");
    res.attachment("data_pemilahan.csv");
    res.send(csv);

    res.on("finish", async () => {
      try {
        await remove(ref(db, "conveyor/history"));
        await set(ref(db, "conveyor/beratTerakhir"), 0);
      } catch (cleanupError) {
        console.error("Gagal mereset data setelah ekspor:", cleanupError);
      }
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengekspor data." });
  }
});

app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
