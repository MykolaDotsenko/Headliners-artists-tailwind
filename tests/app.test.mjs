import test from "node:test";
import assert from "node:assert/strict";

import {
  isValidEmail,
  oppositeTheme,
  resolveInitialTheme,
} from "../src/app.mjs";

test("stored theme wins over system preference", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
});

test("system preference is used when no stored preference exists", () => {
  assert.equal(resolveInitialTheme(null, true), "dark");
  assert.equal(resolveInitialTheme(undefined, false), "light");
});

test("theme toggle is deterministic", () => {
  assert.equal(oppositeTheme("dark"), "light");
  assert.equal(oppositeTheme("light"), "dark");
});

test("email validation accepts common valid addresses", () => {
  assert.equal(isValidEmail("hello@example.com"), true);
  assert.equal(isValidEmail(" mykola+festival@example.co.uk "), true);
});

test("email validation rejects malformed or unsafe values", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("name @example.com"), false);
  assert.equal(isValidEmail("name@example"), false);
  assert.equal(isValidEmail(`a@${"b".repeat(250)}.com`), false);
});
