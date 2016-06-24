var _hexEncodeArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function ua2words(ua, uaLength) {
    var temp = [];
    for (var i = 0; i < uaLength; i += 4) {
        var x = ua[i] * 0x1000000 + (ua[i + 1] || 0) * 0x10000 + (ua[i + 2] || 0) * 0x100 + (ua[i + 3] || 0);
        temp.push((x > 0x7fffffff) ? x - 0x100000000 : x);
    }
    return CryptoJS.lib.WordArray.create(temp, uaLength);
}
function words2ua(destUa, cryptowords) {
    for (var i = 0; i < destUa.length; i += 4) {
        var v = cryptowords.words[i / 4];
        if (v < 0) v += 0x100000000;
        destUa[i] = (v >>> 24);
        destUa[i + 1] = (v >>> 16) & 0xff;
        destUa[i + 2] = (v >>> 8) & 0xff;
        destUa[i + 3] = v & 0xff;
    }
}
function hashfunc(dest, data, dataLength) {
    var convertedData = ua2words(data, dataLength);
    var hash = CryptoJS.SHA3(convertedData, {
        outputLength: 512
    });
    words2ua(dest, hash);
}
function hex2ua_reversed(hexx) {
    var hex = hexx.toString(); //force conversion
    var ua = new Uint8Array(hex.length / 2);
    for (var i = 0; i < hex.length; i += 2) {
        ua[ua.length - 1 - (i / 2)] = parseInt(hex.substr(i, 2), 16);
    }
    return ua;
}
function ua2hex(ua) {
    var s = '';
    for (var i = 0; i < ua.length; i++) {
        var code = ua[i];
        s += _hexEncodeArray[code >>> 4];
        s += _hexEncodeArray[code & 0x0F];
    }
    return s;
}
function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
b32encode = function(s) {
    /* encodes a string s to base32 and returns the encoded string */
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    var parts = [];
    var quanta = Math.floor((s.length / 5));
    var leftover = s.length % 5;

    if (leftover != 0) {
        for (var i = 0; i < (5 - leftover); i++) {
            s += '\x00';
        }
        quanta += 1;
    }

    for (i = 0; i < quanta; i++) {
        parts.push(alphabet.charAt(s.charCodeAt(i * 5) >> 3));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5) & 0x07) << 2) | (s.charCodeAt(i * 5 + 1) >> 6)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 1) & 0x3F) >> 1)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 1) & 0x01) << 4) | (s.charCodeAt(i * 5 + 2) >> 4)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 2) & 0x0F) << 1) | (s.charCodeAt(i * 5 + 3) >> 7)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 3) & 0x7F) >> 2)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 3) & 0x03) << 3) | (s.charCodeAt(i * 5 + 4) >> 5)));
        parts.push(alphabet.charAt(((s.charCodeAt(i * 5 + 4) & 0x1F))));
    }

    var replace = 0;
    if (leftover == 1) replace = 6;
    else if (leftover == 2) replace = 4;
    else if (leftover == 3) replace = 3;
    else if (leftover == 4) replace = 1;

    for (i = 0; i < replace; i++) parts.pop();
    for (i = 0; i < replace; i++) parts.push("=");

    return parts.join("");
}
function BinaryKey(keyData) {
    this.data = keyData;
    this.toString = function() {
        return ua2hex(this.data);
    }
}
function KeyPair(privkey) {
    this.publicKey = new BinaryKey(new Uint8Array(nacl.lowlevel.crypto_sign_PUBLICKEYBYTES));
    this.secretKey = hex2ua_reversed(privkey);
    nacl.lowlevel.crypto_sign_keypair_hash(this.publicKey.data, this.secretKey, hashfunc);

    this.sign = function(data) {
        var sig = new Uint8Array(64);
        var hasher = new hashobj();
        var r = nacl.lowlevel.crypto_sign_hash(sig, this, data, hasher);
        if (!r) {
            alert("couldn't sign the tx, generated invalid signature");
            throw new Error("couldn't sign the tx, generated invalid signature");
        }
        return new BinaryKey(sig);
    }
}
KeyPair.create = function(hexdata) {
    var r = new KeyPair(hexdata);
    return r;
}
function toAddress(publicKey, networkId) {
    var binPubKey = CryptoJS.enc.Hex.parse(publicKey);
    var hash = CryptoJS.SHA3(binPubKey, {
        outputLength: 256
    });
    var hash2 = CryptoJS.RIPEMD160(hash);
    // 98 is for testnet
    var networkPrefix = (networkId === -104) ? '98' : (networkId === 104 ? '68' : '60');
    var versionPrefixedRipemd160Hash = networkPrefix + CryptoJS.enc.Hex.stringify(hash2);
    var tempHash = CryptoJS.SHA3(CryptoJS.enc.Hex.parse(versionPrefixedRipemd160Hash), {
        outputLength: 256
    });
    var stepThreeChecksum = CryptoJS.enc.Hex.stringify(tempHash).substr(0, 8);
    var concatStepThreeAndStepSix = hex2a(versionPrefixedRipemd160Hash + stepThreeChecksum);
    var ret = b32encode(concatStepThreeAndStepSix);
    var buff = "";
    for (var i = 0; i < 6; i++) {
        var replacestr = ret.slice(0, 6);
        ret = ret.replace(replacestr, "");
        buff += replacestr + "-";
    }
    buff += ret;
    return buff;
}
