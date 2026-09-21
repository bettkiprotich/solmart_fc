import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('orders support test-data exclusion from recognized revenue',()=>{
  assert.match(read('prisma/schema.prisma'),/isTestData\s+Boolean\s+@default\(false\)/);
  assert.match(read('app/api/admin/overview/route.ts'),/isTestData: false/);
  assert.match(read('app/api/admin/orders/route.ts'),/isTestData: z\.boolean\(\)\.optional\(\)/);
});
test('demo accounts can only be deleted by SUPER_ADMIN through protected endpoint',()=>{
  const s=read('app/api/admin/users/route.ts');
  assert.match(s,/requireRole\("SUPER_ADMIN"\)/);
  assert.match(s,/Only Solmart FC demo accounts can be removed here/);
  assert.match(s,/export async function DELETE/);
});
test('fixture admin form supports editing teams and competition',()=>{
  const s=read('components/admin/admin-dashboard.tsx');
  assert.match(s,/Home team, away team and competition can all be changed/);
  assert.match(s,/function Matches/);
  assert.match(s,/Save fixture changes/);
  assert.match(s,/setM\(\{homeTeamId:x\.homeTeamId,awayTeamId:x\.awayTeamId,competitionId:x\.competitionId/);
});
