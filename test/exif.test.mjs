// The photo's small print, read from a JPEG the visitor picked: camera, time, software and the GPS point, in either
// byte order, and nothing invented when the block is missing or cut short.
import { test } from "node:test";
import assert from "node:assert/strict";
import { exifOf } from "../src/exif.mjs";

// a JPEG whose APP1 segment carries the given TIFF block
const jpeg = tiff => {
  const len = tiff.length + 8, b = Buffer.alloc(4 + 2 + tiff.length);
  b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[3] = 0xe1; b.writeUInt16BE(len, 4);
  b.write("Exif\0\0", 6, "latin1"); tiff.copy(b, 12);
  return new Uint8Array(b);
};
const ascii = (s, n) => Buffer.from(s.padEnd(n, "\0"), "latin1");

// (a little TIFF: IFD0 with Make (0x010f), Model (0x0110), Software (0x0131), DateTime (0x0132), an Exif sub-IFD with
// DateTimeOriginal (0x9003) and a GPS IFD with the hemisphere refs and three rationals each for latitude and longitude)
function tiffLE() {
  const head = Buffer.alloc(8), base = 8 + 2 + 6 * 12 + 4;   // IFD0 at 8: 6 entries, then the next-IFD pointer
  head.write("II", 0, "latin1"); head.writeUInt16LE(42, 2); head.writeUInt32LE(8, 4);
  let off = base;
  const blocks = [], entry = (tag, type, count, value) => { const e = Buffer.alloc(12); e.writeUInt16LE(tag, 0); e.writeUInt16LE(type, 2); e.writeUInt32LE(count, 4); e.writeUInt32LE(value, 8); return e; };
  const add = buf => { const at = off; blocks.push(buf); off += buf.length; return at; };
  const make = ascii("Apple", 6), model = ascii("iPhone 15 Pro", 13), soft = ascii("iOS 18.1", 8), time = ascii("2024:05:01 12:33:44", 20);
  const atMake = add(make), atModel = add(model), atSoft = add(soft), atTime = add(time);
  // two more IFDs, each filled after we know where they sit
  const ifd0 = Buffer.concat([Buffer.alloc(2), entry(0x010f, 2, 6, atMake), entry(0x0110, 2, 13, atModel), entry(0x0131, 2, 8, atSoft), entry(0x0132, 2, 20, atTime), entry(0x8769, 4, 1, 0), entry(0x8825, 4, 1, 0), Buffer.alloc(4)]);
  ifd0.writeUInt16LE(6, 0);
  const ex = Buffer.concat([Buffer.alloc(2), entry(0x9003, 2, 20, atTime), Buffer.alloc(4)]); ex.writeUInt16LE(1, 0);
  const atEx = add(ex);
  const gps = Buffer.concat([Buffer.alloc(2),
    entry(0x0001, 2, 2, 0x4e), entry(0x0002, 5, 3, 0), entry(0x0003, 2, 2, 0x45), entry(0x0004, 5, 3, 0), Buffer.alloc(4)]);
  gps.writeUInt16LE(4, 0);
  const atGps = add(gps);
  // the rationals: 31° 14' 0" N, 121° 28' 0" E
  const rats = Buffer.alloc(2 * 3 * 8);
  [[31, 1], [14, 1], [0, 1], [121, 1], [28, 1], [0, 1]].forEach(([a, d], i) => { rats.writeUInt32LE(a, i * 8); rats.writeUInt32LE(d, i * 8 + 4); });
  const atRat = add(rats);
  ifd0.writeUInt32LE(atEx, 2 + 4 * 12 + 8);
  ifd0.writeUInt32LE(atGps, 2 + 5 * 12 + 8);
  gps.writeUInt32LE(atRat, 2 + 1 * 12 + 8);
  gps.writeUInt32LE(atRat + 24, 2 + 3 * 12 + 8);
  return Buffer.concat([head, ifd0, ...blocks]);
}

test("a photo's camera, time and place are read", () => {
  const e = exifOf(jpeg(tiffLE()));
  assert.equal(e.cam, "Apple iPhone 15 Pro");
  assert.equal(e.soft, "iOS 18.1");
  assert.equal(e.time, "2024:05:01 12:33:44");
  assert.ok(Math.abs(e.lat - 31.23333) < 1e-4, "latitude " + e.lat);
  assert.ok(Math.abs(e.lon - 121.46666) < 1e-4, "longitude " + e.lon);
});

test("a photo with nothing to say is clean, and junk is not a photo", () => {
  assert.equal(exifOf(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2])), null);
  assert.equal(exifOf(new Uint8Array([1, 2, 3])), null);
  assert.equal(exifOf(null), null);
  // a cut-off segment: the reader gives what it can rather than throwing
  const full = jpeg(tiffLE());
  assert.doesNotThrow(() => exifOf(full.slice(0, 20)));
});
