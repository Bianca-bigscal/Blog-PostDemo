require('dotenv').config();
const { log } = require('console');
const crypto = require("crypto");

const key = Buffer.from(process.env.CRYPTO_KEY,'hex');
const iv = Buffer.from(process.env.CRYPTO_IV ,'hex');
const algo = process.env.CRYPTO_ALGO;

function encrypt(text){
    let cipher = crypto.createCipheriv(algo,key,iv);
    console.log(cipher);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted,cipher.final()]);
    return encrypted.toString('hex');
}

function decrypt(text){
    let encrypt = Buffer.from(text,'hex')
    let decipher = crypto.createDecipheriv(algo,key,iv)
    let decrypted = decipher.update(encrypt);
    decrypted = Buffer.concat([decrypted,decipher.final()]);
    return decrypted.toString();
}

// console.log(encrypt("123456"));
// console.log(decrypt("1424054bf84031c33f330f6639a12bbd"));

module.exports = {encrypt,decrypt}