import Typography from "typography"
// @ts-ignore: No type file published
import theme from "typography-theme-github"

theme.headerFontFamily = ["M PLUS Rounded 1c", "sans-serif"]
theme.bodyFontFamily = ["M PLUS Rounded 1c", "sans-serif"]

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
