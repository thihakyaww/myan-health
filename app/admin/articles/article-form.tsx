"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";

export interface ArticleDraft {
  id?: string;
  title_mm: string;
  title_en: string;
  slug: string;
  body_mm: string;
  body_en: string;
  cover_image_url: string | null;
  category: string;
  tags: string;
  status: "DRAFT" | "PUBLISHED";
}

const EMPTY: ArticleDraft = {
  title_mm: "",
  title_en: "",
  slug: "",
  body_mm: "",
  body_en: "",
  cover_image_url: null,
  category: "",
  tags: "",
  status: "DRAFT",
};

export function ArticleForm({ initial }: { initial?: Partial<ArticleDraft> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ArticleDraft>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  async function save() {
    setError(null);
    if (!draft.title_mm.trim() || !draft.body_mm.trim()) {
      setError("Burmese title and body are required.");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      title_mm: draft.title_mm.trim(),
      title_en: draft.title_en.trim() || null,
      slug:
        draft.slug.trim() ||
        slugify(draft.title_en) ||
        `article-${Date.now()}`,
      body_mm: draft.body_mm.trim(),
      body_en: draft.body_en.trim() || null,
      cover_image_url: draft.cover_image_url,
      category: draft.category.trim() || null,
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: draft.status,
      author_id: user?.id ?? null,
      published_at:
        draft.status === "PUBLISHED"
          ? new Date().toISOString()
          : null,
    };

    setSaving(true);
    const { error: err } = draft.id
      ? await supabase.from("articles").update(payload).eq("id", draft.id)
      : await supabase.from("articles").insert(payload);
    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <Card>
      <CardBody className="space-y-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Title (Myanmar) *</span>
            <Input
              value={draft.title_mm}
              onChange={(e) => setDraft({ ...draft, title_mm: e.target.value })}
            />
          </label>
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Title (English)</span>
            <Input
              value={draft.title_en}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  title_en: e.target.value,
                  // auto-slug only while creating and untouched
                  slug: draft.id ? draft.slug : slugify(e.target.value),
                })
              }
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_10rem_10rem]">
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Slug</span>
            <Input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="auto-from-title"
            />
          </label>
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Category</span>
            <Input
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              placeholder="PREVENTION"
            />
          </label>
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Status</span>
            <Select
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as ArticleDraft["status"] })
              }
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </Select>
          </label>
        </div>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold">Body (Myanmar) *</span>
          <Textarea
            rows={8}
            value={draft.body_mm}
            onChange={(e) => setDraft({ ...draft, body_mm: e.target.value })}
          />
          <span className="block text-xs text-muted-foreground">
            **heading**, - bullet, *italic* are supported.
          </span>
        </label>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold">Body (English)</span>
          <Textarea
            rows={6}
            value={draft.body_en}
            onChange={(e) => setDraft({ ...draft, body_en: e.target.value })}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <ImageUpload
            folder="articles"
            value={draft.cover_image_url}
            onChange={(url) => setDraft({ ...draft, cover_image_url: url })}
          />
          <label className="space-y-1.5 block">
            <span className="text-sm font-semibold">Tags (comma separated)</span>
            <Input
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="dengue, mosquito"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">{error}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : draft.id ? "Save changes" : "Create article"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin/articles")}>
            Cancel
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
