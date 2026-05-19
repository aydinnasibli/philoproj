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
      title: "Key Philosophers",
      of: [{ type: "reference", to: [{ type: "philosopher" }] }],
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
