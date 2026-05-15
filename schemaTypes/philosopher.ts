import { defineField, defineType } from "sanity";

const strengthField = defineField({
  name: "strength",
  type: "string",
  title: "Strength",
  initialValue: "strong",
  validation: (r) => r.required(),
  options: {
    list: [
      { title: "Strong", value: "strong" },
      { title: "Medium", value: "medium" },
      { title: "Weak",   value: "weak"   },
    ],
    layout: "radio",
  },
});

export const philosopher = defineType({
  name: "philosopher",
  title: "Philosopher",
  type: "document",
  fields: [
    defineField({ name: "name",         type: "string", title: "Name",         validation: (r) => r.required() }),
    defineField({ name: "slug",         type: "slug",   title: "Slug",         options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "era",          type: "reference", title: "Era",       to: [{ type: "era" }] }),
    defineField({ name: "birthYear",    type: "number", title: "Birth Year (negative = BC)" }),
    defineField({ name: "deathYear",    type: "number", title: "Death Year"   }),
    defineField({ name: "hookQuote",    type: "string", title: "Hook Quote"   }),
    defineField({ name: "coreBranch",   type: "string", title: "Core Branch"  }),
    defineField({ name: "networkX",     type: "number", title: "Network X (%)" }),
    defineField({ name: "networkY",     type: "number", title: "Network Y (%)" }),
    defineField({ name: "shortSummary", type: "text",   title: "Short Summary" }),
    defineField({ name: "fullBiography",type: "text",   title: "Full Biography" }),
    defineField({
      name: "avatarUrl",
      type: "url",
      title: "Avatar URL",
    }),
    defineField({
      name: "importantWorks",
      type: "array",
      title: "Important Works",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title",    type: "string", title: "Title" }),
          defineField({ name: "year",     type: "number", title: "Year"  }),
          defineField({ name: "synopsis", type: "text",   title: "Synopsis" }),
        ],
      }],
    }),
    defineField({
      name: "keyTakeaways",
      type: "array",
      title: "Key Takeaways",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "mentors",
      type: "array",
      title: "Mentors",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "philosopher", type: "reference", to: [{ type: "philosopher" }], title: "Philosopher" }),
          strengthField,
        ],
      }],
    }),
    defineField({
      name: "students",
      type: "array",
      title: "Students",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "philosopher", type: "reference", to: [{ type: "philosopher" }], title: "Philosopher" }),
          strengthField,
        ],
      }],
    }),
    defineField({
      name: "influencedBy",
      type: "array",
      title: "Influenced By",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "philosopher", type: "reference", to: [{ type: "philosopher" }], title: "Philosopher" }),
          strengthField,
        ],
      }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "coreBranch" },
  },
});
