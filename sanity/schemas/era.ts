import { defineField, defineType } from "sanity";

export const era = defineType({
  name: "era",
  title: "Era",
  type: "document",
  fields: [
    defineField({ name: "title",       type: "string",  title: "Title",       validation: (r) => r.required() }),
    defineField({ name: "slug",        type: "slug",    title: "Slug",        options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "startYear",   type: "number",  title: "Start Year (negative = BC)" }),
    defineField({ name: "endYear",     type: "number",  title: "End Year"    }),
    defineField({ name: "description", type: "text",    title: "Description" }),
  ],
  preview: {
    select: { title: "title", subtitle: "startYear" },
  },
});
