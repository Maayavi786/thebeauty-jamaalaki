"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
/**
 * Hashes a password using scrypt
 * @param password - The password to hash
 * @returns A string containing the hashed password and salt
 */
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
/**
 * Compares a password with a stored hash
 * @param suppliedPassword - The password to compare
 * @param storedHash - The stored password hash
 * @returns A boolean indicating if the passwords match
 */
async function comparePasswords(suppliedPassword, storedHash) {
    const [hashedPassword, salt] = storedHash.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64));
    return (0, crypto_1.timingSafeEqual)(hashedPasswordBuf, suppliedPasswordBuf);
}
