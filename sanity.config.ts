import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "The Living Manuscript",
  basePath: "/studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool(),
    ...(process.env.NODE_ENV !== "production" ? [visionTool()] : []),
  ],

  schema: { types: schemaTypes },
});
