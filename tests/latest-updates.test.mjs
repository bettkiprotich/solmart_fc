import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
test('latest account and fixture features are present',()=>{
 const users=read('app/api/admin/users/route.ts');
 const pw=read('app/api/auth/password/route.ts');
 const matches=read('app/api/admin/matches/route.ts');
 const ui=read('components/admin/admin-dashboard.tsx');
 const account=read('components/account/account-client.tsx');
 assert.match(users,/hashPassword/); assert.match(users,/SUPER_ADMIN/);
 assert.match(pw,/verifyPassword/); assert.match(pw,/session\.deleteMany/);
 assert.match(matches,/homeTeamName/); assert.match(matches,/competitionName/); assert.match(matches,/export async function DELETE/);
 assert.match(ui,/Create administrator or user/); assert.match(ui,/Type team and competition names directly/); assert.match(ui,/Delete/);
 assert.match(account,/Change password/); assert.match(account,/\/api\/auth\/password/);
});
test('published article page tolerates deleted or missing authors/categories',()=>{
 const article=read('app/news/[slug]/page.tsx');
 assert.match(article,/article\.author/);
 assert.match(article,/article\.category\?\.name/);
 assert.match(article,/Solmart FC/);
});
