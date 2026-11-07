import Link from "next/link";
import { notFound } from "next/navigation";
import { saveCategoryAction } from "../../actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { CategoryIcon, ICON_NAMES } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { finderOptionsToText } from "@/lib/finder-options";
import { HOME_TILES, getCategoryById, listCategories, listServices } from "@/lib/queries";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const category = isNew ? null : await getCategoryById(Number(id));
  if (!isNew && !category) notFound();

  const services = category ? (await listServices({ includeInactive: true })).filter((s) => s.categoryId === category.id) : [];
  const categories = await listCategories();
  const position = category ? categories.findIndex((c) => c.id === category.id) + 1 : categories.length + 1;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/services" className="text-sm font-semibold text-brand-600">← Services</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-900">{category ? category.name : "Nayi category"}</h1>

      <ActionForm action={saveCategoryAction.bind(null, category?.id ?? null)} className="card mt-5 p-5 space-y-4">
        <div>
          <label className="label" htmlFor="name">Homepage pe dikhne wala naam</label>
          <input id="name" name="name" required maxLength={60} defaultValue={category?.name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="tagline">Chhoti line</label>
          <input id="tagline" name="tagline" maxLength={80} defaultValue={category?.tagline} className="field" placeholder="Naya card, correction" />
        </div>
        <div>
          <label className="label" htmlFor="position">Kaunse number pe dikhe</label>
          <input id="position" name="position" type="number" min={1} required defaultValue={position} className="field sm:w-32" />
          <p className="mt-1 text-xs text-muted">Pehle {HOME_TILES} number homepage pe dikhte hain. Baaki Explore All me.</p>
        </div>
        <fieldset>
          <legend className="label">Icon</legend>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {ICON_NAMES.map((icon) => (
              <label key={icon} className="grid h-11 cursor-pointer place-items-center rounded-lg border border-line has-checked:border-brand-500 has-checked:bg-brand-50">
                <input type="radio" name="icon" value={icon} defaultChecked={(category?.icon ?? "Sparkles") === icon} className="sr-only" aria-label={icon} />
                <CategoryIcon name={icon} className="size-5 text-brand-600" />
              </label>
            ))}
          </div>
        </fieldset>
        {category && (
          <>
            <div>
              <label className="label" htmlFor="question">Customer se poochha jane wala sawal (agar ho)</label>
              <input id="question" name="question" maxLength={120} defaultValue={category.question} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="options">Sawal ke jawab</label>
              <textarea id="options" name="options" rows={4} defaultValue={finderOptionsToText(category.options, services)} className="field font-mono text-sm" />
              <p className="mt-1 text-xs text-muted">
                Har line me ek jawab. Format: <code>Jawab | Service ka naam, Doosri service</code>. Khali chhodne par customer ko seedhe services dikhengi.
              </p>
            </div>
          </>
        )}
        <Submit className="btn btn-primary w-full">Save karein</Submit>
      </ActionForm>
    </div>
  );
}
