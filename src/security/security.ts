import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const config = {
  hashBytes: 32,
  saltBytes: 16,
  iterations: 872791
};

async function hashPassword(password: string) {
    let salt = await crypto.randomBytes(config.saltBytes);
    let hash = crypto.pbkdf2Sync(password, salt, config.iterations, config.hashBytes, 'sha1');

    let combined = Buffer.alloc(hash.length + salt.length + 8);
    combined.writeUInt32BE(salt.length, 0);
    combined.writeUInt32BE(config.iterations, 4);
    salt.copy(combined, 8);
    hash.copy(combined, salt.length + 8);
    return combined.toString('base64');
}

async function verifyPassword(password: string, hashb64: string) {
    let combined = Buffer.from(hashb64, 'base64');
    let saltBytes = combined.readUInt32BE(0);
    let hashBytes = combined.length - saltBytes - 8;
    let iterations = combined.readUInt32BE(4);
    let salt = combined.slice(8, saltBytes + 8);
    let hash = combined.toString('binary', saltBytes + 8);
    let hbuf = crypto.pbkdf2Sync(password, salt, iterations, hashBytes, 'sha1');
    return hbuf.toString('binary') === hash;
}

function uuid(){
    return uuidv4();
}

export { hashPassword, verifyPassword, uuid };
