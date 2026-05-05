// Simple E2E script: create -> list -> delete
const base = process.env.BASE_URL || 'http://localhost:3000';
const api = `${base}/api/notes`;

async function request(path, opts) {
  const res = await fetch(path, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { ok: res.ok, status: res.status, body: json };
}

async function main() {
  console.log('E2E: using base URL', base);

  const payload = {
    numeroNota: `E2E-${Date.now()}`,
    nomeFornecedor: 'E2E Test Ltda',
    cnpjFornecedor: '00000000000191',
    placa: 'ABC1234',
    valorNota: 123.45,
    dataEmissao: '01/01/2026',
    usuario: 'e2e-user'
  };

  console.log('1) Creating note...');
  const post = await request(api, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!post.ok) throw new Error(`POST failed (${post.status}): ${JSON.stringify(post.body)}`);
  const created = post.body && post.body.data;
  if (!created || !created.id) throw new Error(`Invalid POST response: ${JSON.stringify(post.body)}`);
  console.log('  created id=', created.id);

  console.log('2) Listing notes...');
  const list = await request(api, { method: 'GET' });
  if (!list.ok) throw new Error(`GET list failed (${list.status}): ${JSON.stringify(list.body)}`);
  const items = list.body && list.body.data;
  if (!Array.isArray(items)) throw new Error('List response is not an array');
  const found = items.find((n) => n.id === created.id || n.numeroNota === payload.numeroNota);
  if (!found) throw new Error('Created note not found in list');
  console.log('  found in list');

  console.log('3) Deleting note...');
  const delUrl = `${api}/${created.id}`;
  const del = await request(delUrl, { method: 'DELETE' });
  if (!del.ok) throw new Error(`DELETE failed (${del.status}): ${JSON.stringify(del.body)}`);
  console.log('  deleted id=', created.id);

  console.log('E2E finished successfully');
}

main().catch((err) => {
  console.error('E2E failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
