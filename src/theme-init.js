(() => {
  const key = "headliners-theme";
  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem(key);
  } catch {
    // Storage is optional. System preference remains a safe fallback.
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";

  document.documentElement.classList.toggle("dark", theme === "dark");

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", theme === "dark" ? "#09090b" : "#f4f4f5");
  }
})();
