import crypto from 'node:crypto'

const t = crypto.randomBytes(32).toString("base64")


console.log(t, crypto.createHash('sha256').update(t).digest().toString("base64"))