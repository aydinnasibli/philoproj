import { defineField, defineType } from "sanity";

export const learningPath = defineType({
  name: "learningPath",
  title: "Learning Path",
  type: "document",
  fields: [
    defineField({ name: "title",       type: "string", title: "Title",       validation: (r) => r.required() }),
    defineField({ name: "slug",        type: "slug",   title: "Slug",        options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "description", type: "text",   title: "Description", validation: (r) => r.required() }),
    defineField({
      name: "difficulty",
      type: "string",
      title: "Difficulty",
      options: { list: ["beginner", "intermediate", "advanced"] },
      initialValue: "beginner",
    }),
    defineField({ name: "estimatedMinutes", type: "number", title: "Estimated Minutes", validation: (r) => r.min(1) }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "steps",
      type: "array",
      title: "Steps",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title",       type: "string", title: "Step Title",   validation: (r) => r.required() }),
          defineField({ name: "description", type: "text",   title: "Description" }),
          defineField({
            name: "type",
            type: "string",
            title: "Step Type",
            options: { list: ["philosopher", "school", "reading"] },
            initialValue: "philosopher",
          }),
          defineField({
            name: "philosopher",
            type: "reference",
            to: [{ type: "philosopher" }],
            title: "Philosopher",
            hidden: ({ parent }) => parent?.type !== "philosopher",
          }),
          defineField({
            name: "school",
            type: "reference",
            to: [{ type: "school" }],
            title: "School",
            hidden: ({ parent }) => parent?.type !== "school",
          }),
          defineField({
            name: "readingContent",
            type: "text",
            title: "Reading Content",
            hidden: ({ parent }) => parent?.type !== "reading",
          }),
        ],
        preview: {
          select: { title: "title", type: "type", philName: "philosopher.name", schoolName: "school.title" },
          prepare(s: Record<string, unknown>) {
            const subtitle = s.type === "philosopher" ? s.philName : s.type === "school" ? s.schoolName : "Reading";
            return { title: s.title as string, subtitle: `${s.type} → ${subtitle ?? ""}` };
          },
        },
      }],
    }),
  ],
  preview: {
    select: { title: "title", difficulty: "difficulty" },
    prepare(s: Record<string, unknown>) {
      return { title: s.title as string, subtitle: s.difficulty as string };
    },
  },
});
