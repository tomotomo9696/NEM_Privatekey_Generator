PassSHA3 = function(password, count) {
    var data = password;
    for (var i = 0; i < count; ++i) {
        data = CryptoJS.SHA3(data, {
            outputLength: 256
        });
    }
    var r = CryptoJS.enc.Hex.stringify(data);
    return r;
};
function calcPrivkey() {
    var privatekey = PassSHA3(document.getElementById("pass").value, 6000);
    document.getElementById('privkey').innerHTML = privatekey;
    document.getElementById('pwprivkey').innerHTML = privatekey.slice(0,16) + "<br>" + privatekey.slice(16, 32)  + "<br>" + privatekey.slice(32, 48)  + "<br>" + privatekey.slice(48);
    var k = KeyPair.create(privatekey);
    var address = toAddress(k.publicKey.toString(), 104/*96 mijin / -104 testnet*/);
    document.getElementById('addr').innerHTML = address;
    document.getElementById('pwadd').innerHTML = address.slice(0,14) + "<br>" + address.slice(14,28)  + "<br>" + address.slice(28);
}
