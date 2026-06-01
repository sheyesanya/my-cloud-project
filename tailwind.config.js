module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:                    "#4338ca",
        "primary-dark":             "#3730a3",
        surface:                    "#faf8ff",
        "surface-dim":              "#d2d9f4",
        "surface-container-low":    "#f2f3ff",
        "surface-container":        "#eaedff",
        "surface-container-high":   "#e2e7ff",
        "on-surface":               "#131b2e",
        "on-surface-variant":       "#464554",
        "surface-border":           "#e1e4f0",
        "indigo-950":               "#1e1b4b",
      },
      fontFamily: {
        headline: ["Manrope","sans-serif"],
        body:     ["Inter","sans-serif"],
        mono:     ["IBM Plex Mono","monospace"],
        serif:    ["Source Serif 4","Georgia","serif"],
        code:     ["JetBrains Mono","monospace"],
      },
      borderRadius: {
        DEFAULT:"0px", none:"0px", sm:"0px",
        md:"0px", lg:"0px", xl:"0px", full:"9999px",
      },
    },
  },
  plugins: [],
};