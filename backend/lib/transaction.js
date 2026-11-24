// All statements use one pooled connection; replacements cannot lose old rows on insert failure.
async function transaction(pool, work) {
  const connection = await new Promise((resolve, reject) => pool.getConnection((err, value) => err ? reject(err) : resolve(value)));
  const command = method => new Promise((resolve, reject) => connection[method](err => err ? reject(err) : resolve()));
  const query = (sql, params = []) => new Promise((resolve, reject) => connection.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
  let discard = false;
  try {
    await command('beginTransaction');
    const result = await work(query);
    await command('commit');
    return result;
  } catch (err) {
    try { await command('rollback'); } catch { discard = true; }
    throw err;
  } finally { if (discard) connection.destroy(); else connection.release(); }
}
module.exports = { transaction };
