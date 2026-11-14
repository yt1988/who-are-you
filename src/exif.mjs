// The small print of a photo: which camera or phone took it, when, and often where. Read from the JPEG's APP1 EXIF
// segment, in the page, from a file the visitor picked; nothing here touches the network.
// (A photo that has been through a social network has usually had this stripped: that is a clean result, not a failure.)

// the APP1 segment that starts "Exif", then the TIFF header inside it
export function exifOf(b) {
  if (!b || b[0] !== 0xff || b[1] !== 0xd8) return null;
  for (let i = 2; i + 9 < b.length && b[i] === 0xff;) {
    const m = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
    if (m === 0xe1 && String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]) === "Exif") return exifTiff(b, i + 10);
    if (m === 0xda) return null;   // the image itself starts here: no more metadata
    i += 2 + len;
  }
  return null;
}

// the tags worth showing from the TIFF: camera, software, time, GPS. Anything unreadable is left out rather than guessed
export function exifTiff(b, at) {
  const le = b[at] === 0x49;   // "II" little-endian, "MM" big-endian
  const u16 = o => le ? b[o] | b[o + 1] << 8 : b[o] << 8 | b[o + 1];
  const u32 = o => (le ? b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24 : b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3]) >>> 0;
  const str = (o, n) => { let s = ""; for (let k = 0; k < n && b[o + k]; k++) s += String.fromCharCode(b[o + k]); return s.trim(); };
  // an IFD: tag -> [type, count, value-or-offset]
  const ifd = o => { const n = u16(o), t = {}; for (let k = 0; k < n; k++) { const e = o + 2 + k * 12; t[u16(e)] = [u16(e + 2), u32(e + 4), u32(e + 8)]; } return t; };
  const ascii = ([, n, v]) => (n > 4 ? str(at + v, n) : str(v, n)) || null;
  try {
    const d0 = ifd(at + u32(at + 4)), out = {};
    const make = d0[0x010f] && ascii(d0[0x010f]), model = d0[0x0110] && ascii(d0[0x0110]);
    out.cam = [make, model].filter(Boolean).join(" ") || null;
    out.soft = d0[0x0131] ? ascii(d0[0x0131]) : null;
    out.time = d0[0x0132] ? ascii(d0[0x0132]) : null;
    if (d0[0x8769]) {   // the Exif sub-IFD keeps the time the shutter opened, which is the one that matters
      const ex = ifd(at + d0[0x8769][2]);
      if (ex[0x9003]) out.time = ascii(ex[0x9003]) || out.time;
    }
    if (d0[0x8825]) {
      // degrees, minutes, seconds as three rationals; the hemisphere is one ASCII character, inline in its entry
      const g = ifd(at + d0[0x8825][2]);
      const dm = v => { const o = at + v[2];
        return u32(o) / (u32(o + 4) || 1) + u32(o + 8) / (u32(o + 12) || 1) / 60 + u32(o + 16) / (u32(o + 20) || 1) / 3600; };
      const ref = v => String.fromCharCode(le ? v[2] & 0xff : v[2] >>> 24);
      if (g[0x0002] && g[0x0001] && g[0x0004] && g[0x0003]) {
        const la = dm(g[0x0002]), lo = dm(g[0x0004]);
        out.lat = ref(g[0x0001]) === "S" ? -la : la;
        out.lon = ref(g[0x0003]) === "W" ? -lo : lo;
      }
    }
    return out;
  } catch (e) { return null; }
}
