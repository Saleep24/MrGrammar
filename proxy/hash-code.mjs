// Prints a new access code and its sha256 hash. Usage: node proxy/hash-code.mjs [your-own-code]
import { createHash, randomBytes } from "node:crypto";

const code = process.argv[2] || randomBytes(24).toString("base64url");
if (code.length < 16) {
  console.error("Use a code of at least 16 characters.");
  process.exit(1);
}
console.log("Access code (keep this in a password manager, paste it in the extension options):");
console.log(code);
console.log("\nACCESS_CODE_HASH (paste this into the Vercel environment variable):");
console.log(createHash("sha256").update(code).digest("hex"));
