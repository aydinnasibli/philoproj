import { defineField, defineType } from "sanity";

export const school = defineType({
  name: "school",
  title: "School of Thought",
  type: "document",
  fields: [
    defineField({ name: "title",       type: "string", title: "Title",       validation: (r) => r.required() }),
    defineField({ name: "slug",        type: "slug",   title: "Slug",        options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "eraRange",    type: "string", title: "Era Range (e.g. c. 470–399 BC)" }),
    defineField({ name: "startYear",   type: "number", title: "Start Year (negative = BC)" }),
    defineField({ name: "tagline",     type: "string", title: "Tagline (short label shown on canvas)" }),
    defineField({ name: "networkX",    type: "number", title: "Canvas X Position (0–100)" }),
    defineField({ name: "networkY",    type: "number", title: "Canvas Y Position (0–100)" }),
    defineField({ name: "description", type: "text",   title: "Description"  }),
    defineField({
      name: "coreIdeas",
      type: "array",
      title: "Core Ideas",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "philosophers",
      type: "array",
      title: "Philosophers",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "philosopher", type: "reference", to: [{ type: "philosopher" }], title: "Philosopher", validation: (r) => r.required() }),
          defineField({ name: "isKeyThinker", type: "boolean", title: "Key Thinker", description: "Show in the lineage canvas panel as a key thinker of this school", initialValue: false }),
        ],
        preview: {
          select: { title: "philosopher.name", subtitle: "isKeyThinker" },
          prepare(selection: Record<string, unknown>) {
            return { title: selection.title as string | undefined, subtitle: selection.subtitle ? "★ Key Thinker" : "" };
          },
        },
      }],
    }),
    defineField({
      name: "influencedBy",
      type: "array",
      title: "Influenced By (Schools)",
      of: [{ type: "reference", to: [{ type: "school" }] }],
    }),
    defineField({
      name: "influencedTo",
      type: "array",
      title: "Gave Rise To (Schools)",
      of: [{ type: "reference", to: [{ type: "school" }] }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eraRange" },
  },
});
