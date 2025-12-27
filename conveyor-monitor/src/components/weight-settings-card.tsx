import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { db, ref, set, onValue } from "../firebaseConfig";

const WeightSettingsCard: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(120);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [descA, setDescA] = useState<string>("");
  const [descB, setDescB] = useState<string>("");

  // Ambil nilai ambang dari Firebase saat komponen mount
  useEffect(() => {
    const thresholdRef = ref(db, "settings/batasBerat");
    onValue(thresholdRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null && typeof data === "number") {
        setThreshold(data);
      }
    });

    const kategoriRef = ref(db, "settings/kategori");
    onValue(kategoriRef, (snapshot) => {
      const data = snapshot.val() as { A?: string; B?: string } | null;
      if (data) {
        setDescA(data.A ?? "");
        setDescB(data.B ?? "");
      }
    });
  }, []);

  // Simpan nilai ambang ke Firebase
  const handleSaveThreshold = async () => {
    setIsSaving(true);
    const thresholdRef = ref(db, "settings/batasBerat");
    await set(thresholdRef, threshold);
    setIsSaving(false);
  };

  return (
    <Card className="p-6 border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Pengaturan Ambang Batas</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-muted-foreground">
            Ambang Batas Berat (gram)
          </label>
          <Input
            id="threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="mt-1"
            min={0}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>• Kategori A (ringan): &lt; {threshold}g → servo3 kanan</p>
          <p>• Kategori B (berat): ≥ {threshold}g → servo3 kiri</p>
          {Boolean(descA || descB) && (
            <div className="mt-2">
              <p className="text-xs">Deskripsi RTDB:</p>
              {descA && <p className="text-xs">A: {descA}</p>}
              {descB && <p className="text-xs">B: {descB}</p>}
            </div>
          )}
        </div>
        <Button
          onClick={handleSaveThreshold}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSaving ? "Menyimpan..." : "Simpan Ambang Batas"}
        </Button>
      </div>
    </Card>
  );
};

export default WeightSettingsCard;