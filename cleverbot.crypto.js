this.checksum = (function() {
    var hC, oD, hN, hA;
    hC = 0;
    oD = 'cleverbot.com';
    hN = '0123456789';
    hA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function HA(a, b, c, d, e, f, g) {
      return H8(b ^ c ^ d, a, b, e, f, g)
    }
    function HB(a, b, c, d, e, f, g) {
      return H8(c ^ (b | (~d)), a, b, e, f, g)
    }
    function HC(x, y) {
      var l = (x & 0xFFFF) + (y & 0xFFFF);
      var m = (x >> 16) + (y >> 16) + (l >> 16);
      return (m << 16) | (l & 0xFFFF)
    }
    function HD(n, c) {
      return (n << c) | (n >>> (32 - c))
    }
    function HE() {
      var r = '';
      for (var i = 0; i < 26; i++) {
        r += HF(65 + i)
      }
      return r
    }
    function HF(i) {
      return String.fromCharCode(i)
    }
    function H(s) {
      var p = 1;
      if (s.indexOf('-') == 0) {
        s = s.substring(1);
        p = -1
      }
      var r = 0;
      var c = hN + hA + hA.toLowerCase();
      var l = s.length;
      for (var i = 0; i < l; i++) {
        r += c.indexOf(s.substr(l - i - 1, 1)) * Math.pow(62, i)
      }
      return r * p
    }
    function H0(a, b, c, d, x, s, t) {
      return H8((b & d) | (c & (~d)), a, b, x, s, t)
    }
    function H2(s) {
      var o = H6(H7(H5(s), s.length * 8), oD);
      return o
    }
    function H3(s) {
      try {
        hC
      } catch (e) {
        hC = 0
      }
      var h = hC ? hN + 'ABCDEF' : hN + 'abcdef';
      var o = '';
      var x;
      for (var i = 0; i < s.length; i++) {
        x = s.charCodeAt(i);
        o += h.charAt((x >>> 4) & 0x0F) + h.charAt(x & 0x0F)
      }
      return o
    }
    function H4(s) {
      var o = '';
      var i = 8;
      var x, y;
      while (++i < 29) {
        x = s.charCodeAt(i);
        y = i + 1 < 29 ? s.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i++
        }
        if (x <= 0x7F) o += HF(x);
        else if (x <= 0x7FF) o += HF(0xC0 | ((x >>> 6) & 0x1F), 0x80 | (x & 0x3F));
        else if (x <= 0xFFFF) o += HF(0xE0 | ((x >>> 12) & 0x0F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F));
        else if (x <= 0x1FFFFF) o += HF(0xF0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3F), 0x80 | ((x >>> 6) & 0x3F), 0x80 | (x & 0x3F))
      }
      return o
    }
    function H5(s) {
      var o = Array(s.length >> 2);
      for (var i = 0; i < o.length; i++) o[i] = 0;
      for (var i = 0; i < s.length * 8; i += 8) o[i >> 5] |= (s.charCodeAt(i / 8) & 0xFF) << (i % 32);
      return o
    }
    var hA = HE();

    function H6(s, d) {
      var o = '';
      for (var i = 0; i < s.length * 32; i += 8) o += HF((s[i >> 5] >>> (i % 32)) & 0xFF);
      return o
    }
    function H7(e, l) {
      e[l >> 5] |= 0x80 << ((l) % 32);
      e[(((l + 64) >>> 9) << 4) + 14] = l;
      var a = H('1tFkIL');
      var b = H('-IOAOV');
      var c = H('-1tFkIM');
      var d = H('IOAOU');
      for (var i = 0; i < e.length; i += 16) {
        var oa = a;
        var ob = b;
        var oc = c;
        var od = d;
        a = H9(a, b, c, d, e[i + 0], 7, H('-k4tC4'));
        d = H9(d, a, b, c, e[i + 1], 12, H('-QMZXm'));
        c = H9(c, d, a, b, e[i + 2], 17, H('f19oJ'));
        b = H9(b, c, d, a, e[i + 3], 22, H('-18gikk'));
        a = H9(a, b, c, d, e[i + 4], 7, H('-BwEc5'));
        d = H9(d, a, b, c, e[i + 5], 12, H('1JDPju'));
        c = H9(c, d, a, b, e[i + 6], 17, H('-1bhWlp'));
        b = H9(b, c, d, a, e[i + 7], 22, H('-35mDH'));
        a = H9(a, b, c, d, e[i + 8], 7, H('1vmt4K'));
        d = H9(d, a, b, c, e[i + 9], 12, H('-28XJ3J'));
        c = H9(c, d, a, b, e[i + 10], 17, H('-AwR'));
        b = H9(b, c, d, a, e[i + 11], 22, H('-2AhX2w'));
        a = H9(a, b, c, d, e[i + 12], 7, H('1y7vr0'));
        d = H9(d, a, b, c, e[i + 13], 12, H('-2jGYv'));
        c = H9(c, d, a, b, e[i + 14], 17, H('-1deFPO'));
        b = H9(b, c, d, a, e[i + 15], 22, H('1LgNKD'));
        a = H0(a, b, c, d, e[i + 1], 5, H('-BDfFG'));
        d = H0(d, a, b, c, e[i + 6], 9, H('-1ANWEK'));
        c = H0(c, d, a, b, e[i + 11], 14, H('hYyNl'));
        b = H0(b, c, d, a, e[i + 0], 20, H('-PIple'));
        a = H0(a, b, c, d, e[i + 5], 5, H('-lTfSl'));
        d = H0(d, a, b, c, e[i + 10], 9, H('2ZVid'));
        c = H0(c, d, a, b, e[i + 15], 14, H('-ihIaN'));
        b = H0(b, c, d, a, e[i + 4], 20, H('-RRav2'));
        a = H0(a, b, c, d, e[i + 9], 5, H('cT8sw'));
        d = H0(d, a, b, c, e[i + 14], 9, H('-170zWc'));
        c = H0(c, d, a, b, e[i + 3], 14, H('-Cg9vN'));
        b = H0(b, c, d, a, e[i + 8], 20, H('1Gk3h7'));
        a = H0(a, b, c, d, e[i + 13], 5, H('-1Zljdz'));
        d = H0(d, a, b, c, e[i + 2], 9, H('-3TgTI'));
        c = H0(c, d, a, b, e[i + 7], 14, H('1tRGCv'));
        b = H0(b, c, d, a, e[i + 12], 20, H('-26NqgI'));
        a = HA(a, b, c, d, e[i + 5], 4, H('-1aTm'));
        d = HA(d, a, b, c, e[i + 8], 11, H('-2CsW0l'));
        c = HA(c, d, a, b, e[i + 11], 16, H('20SNrG'));
        b = HA(b, c, d, a, e[i + 14], 23, H('-2O9cy'));
        a = HA(a, b, c, d, e[i + 1], 4, H('-1fbsyK'));
        d = HA(d, a, b, c, e[i + 4], 11, H('1O8vhx'));
        c = HA(c, d, a, b, e[i + 7], 16, H('-AWS2K'));
        b = HA(b, c, d, a, e[i + 10], 23, H('-1C5NRo'));
        a = HA(a, b, c, d, e[i + 13], 4, H('k6Zpm'));
        d = HA(d, a, b, c, e[i + 0], 11, H('-OGNuQ'));
        c = HA(c, d, a, b, e[i + 3], 16, H('-mtcyJ'));
        b = HA(b, c, d, a, e[i + 6], 23, H('590fF'));
        a = HA(a, b, c, d, e[i + 9], 4, H('-hKu3T'));
        d = HA(d, a, b, c, e[i + 12], 11, H('-SXtZD'));
        c = HA(c, d, a, b, e[i + 15], 16, H('ZuwNE'));
        b = HA(b, c, d, a, e[i + 2], 23, H('-15ML3D'));
        a = HB(a, b, c, d, e[i + 0], 6, H('-DRQxI'));
        d = HB(d, a, b, c, e[i + 7], 10, H('1EGJvz'));
        c = HB(c, d, a, b, e[i + 14], 15, H('-1Xqsbx'));
        b = HB(b, c, d, a, e[i + 5], 21, H('-3szDj'));
        a = HB(a, b, c, d, e[i + 12], 6, H('1r53yd'));
        d = HB(d, a, b, c, e[i + 3], 10, H('-24FAa6'));
        c = HB(c, d, a, b, e[i + 10], 15, H('-4PY3'));
        b = HB(b, c, d, a, e[i + 1], 21, H('-2F4FI7'));
        a = HB(a, b, c, d, e[i + 8], 6, H('22mENb'));
        d = HB(d, a, b, c, e[i + 15], 10, H('-24RVo'));
        c = HB(c, d, a, b, e[i + 6], 15, H('-1haQs0'));
        b = HB(b, c, d, a, e[i + 13], 21, H('1Qb49B'));
        a = HB(a, b, c, d, e[i + 4], 6, H('-9qbCI'));
        d = HB(d, a, b, c, e[i + 11], 10, H('-1DoHtL'));
        c = HB(c, d, a, b, e[i + 2], 15, H('mdxOt'));
        b = HB(b, c, d, a, e[i + 9], 21, H('-NFEHX'));
        a = HC(a, oa);
        b = HC(b, ob);
        c = HC(c, oc);
        d = HC(d, od)
      }
      return Array(a, b, c, d)
    }
    function H8(q, a, b, e, f, g) {
      return HC(HD(HC(HC(a, q), HC(e, g)), f), b)
    }
    function H9(a, b, c, d, e, f, g) {
      return H8((b & c) | ((~b) & d), a, b, e, f, g)
    }

    return function HH(s) {
      var o = H3(H2(H4(s)));
      return o
    }
})();