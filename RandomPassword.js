var randomseed = new(function() {
    this.lastinput = new Date().getTime();
    this.movecount = 0;
    this.limit = 400;
    this.rand = 0;
    this.list = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    this.showpoint = function(x, y) {
        var div = document.createElement("div");
        div.setAttribute("class", "seedpoint");
        div.setAttribute("id", "seedpoint" + this.movecount);
        div.style.top = y + "px";
        div.style.left = x + "px";
        document.body.appendChild(div);
    };
    this.arrayshuffle = function(x, y) {
        x = x % 62;
        y = y % 62;
        var tmp = this.list[x];
        this.list[x] = this.list[y];
        this.list[y] = tmp;
        var out = "";
        for (var i = 0; i < 62; i++) {
            out += this.list[i];
        }
        document.getElementById('pass').value = out;
    };
    this.mousemove = function(event) {
        var timestamp = new Date().getTime();
        var x = y = 0;
        if ((timestamp - this.lastinput) > 20 && this.movecount < this.limit) {
            var mouseX = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
            var mouseY = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
            this.showpoint(mouseX, mouseY);
            this.rand = x = xorshift(mouseX * mouseY + this.rand);
            this.rand = y = xorshift(mouseX * mouseY + this.rand);
            this.arrayshuffle(x, y);
            this.lastinput = new Date().getTime();
            this.movecount++;
            document.getElementById('count').innerHTML = "マウスを適当に動かしてください。<br>ランダムパスワード生成完了まであと:" + (this.limit - this.movecount);
        } else if (this.movecount == this.limit) {
            document.getElementById("generate").disabled = false;
            for (var i = 0; i < this.limit; i++) {
                var node = document.getElementById('seedpoint' + i);
                document.body.removeChild(node);
            }
            document.body.onmousemove = function (){return false;};
            document.getElementById('count').innerHTML = "「generate!」ボタンを押してプライベートキーを生成してください。"
            this.limit--;
        }
    };
})();
var x = 123456789;
var y = 362436069;
var z = 521288629;
function xorshift(w) {
    var t;
    t = (x ^ (x << 11));
    x = y;
    y = z;
    z = w;
    return (w = (w ^ (w >> 19)) ^ (t ^ (t >> 8)));
}
function runrandom() {
    var element = document.getElementById("Random")
    element.parentNode.removeChild(element);
    document.body.onmousemove = function(event) {
        randomseed.mousemove(event);
    };
    document.getElementById("generate").disabled = true;
    document.getElementById("pass").readOnly = true;
}
