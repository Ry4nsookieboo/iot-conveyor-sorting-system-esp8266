import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { db, ref, set, onValue, remove, push } from "../firebaseConfig";

interface Template {
  id: string;
  name: string;
  value: number;
}

const WeightTemplateCard: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState<string>("");
  const [templateValue, setTemplateValue] = useState<number>(120);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Ambil daftar template dari Firebase
  useEffect(() => {
    const templatesRef = ref(db, "templates");
    onValue(templatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data).map((key) => ({
          id: key,
          name: (data[key].nama as string) ?? "",
          value: (data[key].nilai as number) ?? 0,
        }));
        setTemplates(loaded);
      } else {
        setTemplates([]);
      }
    });
  }, []);

  // Simpan template baru ke Firebase
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setIsSaving(true);
    const listRef = ref(db, "templates");
    const newTemplateRef = push(listRef);
    await set(newTemplateRef, { nama: templateName, nilai: templateValue });
    setTemplateName("");
    setTemplateValue(120);
    setIsSaving(false);
  };

  // Hapus template dari Firebase
  const handleDeleteTemplate = async (id: string) => {
    const templateRef = ref(db, `templates/${id}`);
    await remove(templateRef);
  };

  const handleApplyTemplate = async (value: number) => {
    const thresholdRef = ref(db, "settings/batasBerat");
    await set(thresholdRef, value);
  };

  return (
    <Card className="p-6 border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Template Berat</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="templateName" className="block text-sm font-medium text-muted-foreground">
            Nama Template
          </label>
          <Input
            id="templateName"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="templateValue" className="block text-sm font-medium text-muted-foreground">
            Nilai Berat (gram)
          </label>
          <Input
            id="templateValue"
            type="number"
            value={templateValue}
            onChange={(e) => setTemplateValue(Number(e.target.value))}
            className="mt-1"
            min={0}
          />
        </div>
        <Button
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSaving ? "Menyimpan..." : "Simpan Template"}
        </Button>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Daftar Template</h4>
        <ul className="space-y-2">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <span>
                {t.name} - {t.value}g
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleApplyTemplate(t.value)}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Terapkan
                </Button>
                <Button
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default WeightTemplateCard;