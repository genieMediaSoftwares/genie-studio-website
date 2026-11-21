const dns = require('node:dns');
const net = require('node:net');
const axios = require('axios');

const blocked = new net.BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16], ['192.0.0.0', 24],
  ['192.0.2.0', 24], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3],
]) blocked.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8], ['2001:db8::', 32]]) {
  blocked.addSubnet(address, prefix, 'ipv6');
}
function isPublicAddress(address) {
  const family = net.isIP(address);
  if (!family) return false;
  // Reject IPv4-mapped IPv6 rather than allowing an alternate spelling of loopback.
  if (family === 6 && /^(?:0*:)*ffff:/i.test(address)) return false;
  return !blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}
function validateDownloadUrl(value, allowedOrigins) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search ||
      !allowedOrigins.includes(url.origin) || !/^\/uploads\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpe?g|png|webp|avif)$/i.test(url.pathname)) {
    throw new Error('Backfill URL must be an approved HTTPS origin and uploads image path');
  }
  return url.href;
}

function publicLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) {
      return callback(new Error('Backfill destination resolves to a non-public address'));
    }
    const family = typeof options === 'number' ? options : options?.family;
    const candidates = family ? addresses.filter(item => item.family === family) : addresses;
    if (!candidates.length) return callback(new Error('No public address for requested family'));
    if (options?.all) return callback(null, candidates);
    callback(null, candidates[0].address, candidates[0].family);
  });
}

async function downloadImage(value, allowedOrigins) {
  const url = validateDownloadUrl(value, allowedOrigins);
  const response = await axios.get(url, {
    responseType: 'arraybuffer', timeout: 30000, maxRedirects: 0,
    maxContentLength: 25 * 1024 * 1024, maxBodyLength: 25 * 1024 * 1024,
    lookup: publicLookup, proxy: false,
  });
  return Buffer.from(response.data);
}
module.exports = { validateDownloadUrl, downloadImage, isPublicAddress, publicLookup };
