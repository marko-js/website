import type { ThemeInput } from "shiki";

export const theme = {
  name: "marko-dark",
  colors: {
    "editor.foreground": "#d0d0e0",
    "editor.background": "#202034",
  },
  settings: [
    {
      scope: "editor.foreground",
      settings: {
        foreground: "#d0d0e0",
        background: "#202034",
      },
    },
    {
      name: "Comment",
      scope: "comment",
      settings: {
        foreground: "#8f8f9e",
      },
    },
    {
      name: "String",
      scope: "string",
      settings: {
        foreground: "#fff066",
      },
    },
    {
      name: "Number",
      scope: "constant.numeric",
      settings: {
        foreground: "#AE81FF",
      },
    },
    {
      name: "Built-in constant",
      scope: "constant.language",
      settings: {
        foreground: "#AE81FF",
      },
    },
    {
      name: "User-defined constant",
      scope: "constant.character, constant.other",
      settings: {
        foreground: "#AE81FF",
      },
    },
    {
      name: "Variable",
      scope: "variable",
      settings: {
        foreground: "#ffffff",
      },
    },
    {
      name: "Keyword",
      scope: "keyword",
      settings: {
        foreground: "#ff4185",
      },
    },
    {
      name: "Assignment",
      scope: "keyword.operator.assignment",
      settings: {
        foreground: "#FFFFFF",
      },
    },
    {
      name: "Storage",
      scope: "storage",
      settings: {
        fontStyle: "",
        foreground: "#ff4185",
      },
    },
    {
      name: "Storage type",
      scope: "storage.type",
      settings: {
        fontStyle: "italic",
        foreground: "#66D9EF",
      },
    },
    {
      name: "Class name",
      scope: "entity.name.class",
      settings: {
        fontStyle: "underline",
        foreground: "#A6E22E",
      },
    },
    {
      name: "Inherited class",
      scope: "entity.other.inherited-class",
      settings: {
        fontStyle: "italic underline",
        foreground: "#A6E22E",
      },
    },
    {
      name: "Function name",
      scope: "entity.name.function",
      settings: {
        fontStyle: "",
        foreground: "#A6E22E",
      },
    },
    {
      name: "Function argument",
      scope: "variable.parameter",
      settings: {
        fontStyle: "italic",
        foreground: "#ffac4d",
      },
    },
    {
      name: "Tag name",
      scope: "entity.name.tag",
      settings: {
        fontStyle: "",
        foreground: "#ff4185",
      },
    },
    {
      name: "Tag attribute",
      scope: "entity.other.attribute-name",
      settings: {
        fontStyle: "",
        foreground: "#A6E22E",
      },
    },
    {
      name: "Library function",
      scope: "support.function",
      settings: {
        fontStyle: "",
        foreground: "#66D9EF",
      },
    },
    {
      name: "Library constant",
      scope: "support.constant",
      settings: {
        fontStyle: "",
        foreground: "#66D9EF",
      },
    },
    {
      name: "Library class/type",
      scope: "support.type, support.class",
      settings: {
        fontStyle: "italic",
        foreground: "#66D9EF",
      },
    },
    {
      name: "Library variable",
      scope: "support.other.variable",
      settings: {
        fontStyle: "",
      },
    },
    {
      name: "Invalid",
      scope: "invalid",
      settings: {
        background: "#ff4185",
        fontStyle: "",
        foreground: "#F8F8F0",
      },
    },
    {
      name: "Invalid deprecated",
      scope: "invalid.deprecated",
      settings: {
        background: "#AE81FF",
        foreground: "#F8F8F0",
      },
    },
    {
      name: "JSON String",
      scope: "meta.structure.dictionary.json string.quoted.double.json",
      settings: {
        foreground: "#CFCFC2",
      },
    },
    {
      name: "YAML String",
      scope: "string.unquoted.yaml",
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      name: "diff.header",
      scope: "meta.diff, meta.diff.header",
      settings: {
        foreground: "#8f8f9e",
      },
    },
    {
      name: "diff.deleted",
      scope: "markup.deleted",
      settings: {
        foreground: "#ff4185",
      },
    },
    {
      name: "diff.inserted",
      scope: "markup.inserted",
      settings: {
        foreground: "#A6E22E",
      },
    },
    {
      name: "diff.changed",
      scope: "markup.changed",
      settings: {
        foreground: "#fff066",
      },
    },
    {
      scope: "constant.numeric.line-number.find-in-files - match",
      settings: {
        foreground: "#AE81FF",
      },
    },
    {
      scope: "entity.name.filename",
      settings: {
        foreground: "#fff066",
      },
    },
    {
      scope: "message.error",
      settings: {
        foreground: "#F83333",
      },
    },
    {
      scope: "punctuation.definition.template-expression",
      settings: {
        foreground: "#66D9EF",
      },
    },
  ],
} satisfies ThemeInput;
