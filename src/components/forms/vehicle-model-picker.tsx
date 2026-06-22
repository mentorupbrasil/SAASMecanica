"use client";

import { useMemo, useState } from "react";
import { searchVehicleModels } from "@/lib/catalogs";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type VehicleModelPickerProps = {
  brandName?: string;
  modelName?: string;
  defaultBrand?: string;
  defaultModel?: string;
  onSelect?: (brand: string, model: string) => void;
};

export function VehicleModelPicker({
  brandName = "brand",
  modelName = "model",
  defaultBrand = "",
  defaultModel = "",
  onSelect,
}: VehicleModelPickerProps) {
  const [brand, setBrand] = useState(defaultBrand);
  const [model, setModel] = useState(defaultModel);
  const [query, setQuery] = useState(defaultModel ? `${defaultBrand} ${defaultModel}`.trim() : "");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => searchVehicleModels(query), [query]);

  function pick(item: { brand: string; model: string }) {
    setBrand(item.brand);
    setModel(item.model);
    setQuery(`${item.brand} ${item.model}`);
    setOpen(false);
    onSelect?.(item.brand, item.model);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={brandName} value={brand} />
      <input type="hidden" name={modelName} value={model} />

      <div className="relative space-y-2">
        <Label>Buscar modelo *</Label>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              setBrand("");
              setModel("");
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Digite: Onix, Gol, HB20..."
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {suggestions.map((s) => (
              <li key={`${s.brand}-${s.model}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                  onClick={() => pick(s)}
                >
                  <span className="font-medium">{s.model}</span>
                  <span className="ml-2 text-slate-400">{s.brand}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-400">
          Selecione na lista ou preencha marca e modelo manualmente abaixo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Marca *</Label>
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Chevrolet"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Modelo *</Label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Onix"
            required
          />
        </div>
      </div>
    </div>
  );
}

export function VehicleModelPickerInline({
  brand,
  model,
  onBrandChange,
  onModelChange,
}: {
  brand: string;
  model: string;
  onBrandChange: (v: string) => void;
  onModelChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(brand && model ? `${brand} ${model}` : "");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => searchVehicleModels(query), [query]);

  return (
    <div className="relative space-y-2">
      <Label>Buscar veículo</Label>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Onix, Gol, Civic..."
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((s) => (
            <li key={`${s.brand}-${s.model}`}>
              <button
                type="button"
                className={cn("w-full px-3 py-2 text-left text-sm hover:bg-orange-50")}
                onClick={() => {
                  onBrandChange(s.brand);
                  onModelChange(s.model);
                  setQuery(`${s.brand} ${s.model}`);
                  setOpen(false);
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
