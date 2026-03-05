module.exports = {
  theme: {
    extend: {
      fontFamily: {
        caption: "var(--font-body)",
        "caption-bold": "var(--font-body)",
        body: "var(--font-body)",
        "body-bold": "var(--font-body)",
        "heading-3": "var(--font-body)",
        "heading-2": "var(--font-heading)",
        "heading-1": "var(--font-heading)",
        "monospace-body": "var(--font-mono)",
      },
      container: {
        padding: {
          DEFAULT: "16px",
          sm: "calc((100vw + 16px - 640px) / 2)",
          md: "calc((100vw + 16px - 768px) / 2)",
          lg: "calc((100vw + 16px - 1024px) / 2)",
          xl: "calc((100vw + 16px - 1280px) / 2)",
          "2xl": "calc((100vw + 16px - 1536px) / 2)",
        },
      },
    },
  },
};
