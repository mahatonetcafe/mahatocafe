import Link from "next/link";
import { notFound } from "next/navigation";
import { saveServiceAction } from "../../actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { requireAdmin } from "@/lib/auth";
import type { DocSpec, FieldSpec } from "@/lib/catalog";
import { getServiceById, listCategories } from "@/lib/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> };

const docLine = (d: DocSpec) => [d.label, d.hint, d.required ? "" : "optional"].filter(Boolean).join(" | ");
const fieldLine = (f: FieldSpec) => {
  const type = f.type === "select" ? `select:${f.options?.join(",")}` : f.type === "text" ? "" : f.type;
  return [f.label, type, f.required ? "" : "optional"].filter(Boolean).join(" | ");
};

const DEFAULT_FIELDS = "Applicant ka poora naam\nApplicant ka mobile (OTP ke liye) | tel";

export default async function EditServicePage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const preselected = Number((await searchParams).category) || undefined;
  const service = isNew ? null : await getServiceById(Number(id));
  if (!isNew && !service) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/services" className="text-sm font-semibold text-brand-600">← Services</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">{service ? service.name : "Nayi service"}</h1>

      <ActionForm action={saveServiceAction.bind(null, service?.id ?? null)} className="card mt-5 p-5 space-y-4">
        <div>
          <label className="label" htmlFor="name">Service ka naam</label>
          <input id="name" name="name" required maxLength={120} defaultValue={service?.name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="summary">Short detail (agar ho)</label>
          <input id="summary" name="summary" maxLength={200} defaultValue={service?.summary} className="field" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" required defaultValue={service?.categoryId ?? preselected} className="field">
              {(await listCategories()).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">Rate (₹)</label>
            <input id="price" name="price" type="number" min={0} required defaultValue={service?.price} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="eta_hours">Samay (ghante)</label>
            <input id="eta_hours" name="eta_hours" type="number" min={1} required defaultValue={service?.etaHours ?? 24} className="field" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="documents">Zaroori documents</label>
          <textarea id="documents" name="documents" rows={5} defaultValue={service?.documents.map(docLine).join("\n")} className="field font-mono text-sm" />
          <p className="mt-1 text-xs text-muted">
            Har line me ek document. Format: <code>Naam | hint | optional</code>. Hint aur optional chhod sakte hain.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="fields">Form ke sawal</label>
          <textarea id="fields" name="fields" rows={6} required defaultValue={service ? service.fields.map(fieldLine).join("\n") : DEFAULT_FIELDS} className="field font-mono text-sm" />
          <p className="mt-1 text-xs text-muted">
            Har line me ek sawal. Format: <code>Sawal | type | optional</code>. Type: text, date, tel, email, textarea ya <code>select:A,B,C</code>.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="keywords">Search ke shabd</label>
          <input id="keywords" name="keywords" maxLength={500} defaultValue={service?.keywords} className="field" placeholder="pan naya card banwana" />
        </div>
        <div>
          <label className="label" htmlFor="note">Customer ke liye zaroori note (agar ho)</label>
          <input id="note" name="note" maxLength={500} defaultValue={service?.note ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="badge">Badge (agar ho)</label>
          <input id="badge" name="badge" maxLength={40} defaultValue={service?.badge ?? ""} className="field" placeholder="Sabse popular" />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="size-4" />
          Website pe dikhayein
        </label>
        <Submit className="btn btn-primary w-full">Save karein</Submit>
      </ActionForm>
    </div>
  );
}
