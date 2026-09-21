import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Player tiles do not display appearances, goals or assists", () => {
  const s = fs.readFileSync("components/site/player-card.tsx", "utf8");
  assert.doesNotMatch(s, /appearances/);
  assert.doesNotMatch(s, /assists/);
  assert.doesNotMatch(s, /goals/);
});

test("Player tile keeps the player profile link and photo", () => {
  const s = fs.readFileSync("components/site/player-card.tsx", "utf8");
  assert.match(s, /View profile/);
  assert.match(s, /photoUrl/);
});
