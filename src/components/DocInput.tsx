"use client";

import { useRef, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";

const MAX = 5 * 1024 * 1024;

export function DocInput({
  name, label, hint, required,
}: { name: string; label: string; hint?: string; required: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState("");
  const [error, setError] = useState("");

  return (
    <div>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 hover:bg-brand-50 ${
          error ? "border-red-400" : file ? "border-emerald-400 bg-emerald-50/40" : "border-brand-200"
        }`}
      >
        {file ? (
          <CheckCircle2 className="size-6 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <UploadCloud className="size-6 shrink-0 text-brand-600" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {label} {required ? <span className="text-accent-500">*</span> : <span className="text-muted font-normal">(agar ho)</span>}
          </span>
          <span className="block truncate text-xs text-muted">{file || hint || "PDF, JPG ya PNG, 5 MB tak"}</span>
        </span>
        <span className="text-sm font-bold text-brand-600">{file ? "Badlein" : "Chunein"}</span>
        <input
          ref={ref}
          type="file"
          name={name}
          required={required}
          accept="application/pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && f.size > MAX) {
              setError("File 5 MB se badi hai");
              setFile("");
              if (ref.current) ref.current.value = "";
              return;
            }
            setError("");
            setFile(f?.name ?? "");
          }}
        />
      </label>
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
