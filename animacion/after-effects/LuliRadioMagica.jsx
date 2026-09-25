/*
  Luli Pampín y la Radio Mágica — generador de composición para After Effects 2025
  --------------------------------------------------------------------------------
  Uso: Archivo > Scripts > Ejecutar archivo de script...  y elige este archivo.
  Si "musica.wav" está en la misma carpeta que este script, se añade también el audio.

  Crea la composición "Luli y la Radio Mágica" (1280x720, 30 fps, 10 s) con:
   - Fondo con degradado animado (noche -> mágico), estrellas, luna, nubes y rayos.
   - La Radio (radiocasete morado con cara) que duerme, despierta, canta y salta.
   - Luli (estilo anime) que aparece con un destello, baila, canta y guiña un ojo.
   - Notas y corazones, ondas de sonido, líneas de velocidad, título y confeti.
  Todo son capas de forma vectoriales y editables, organizadas con nulos de control.
*/

(function () {
  var W = 1280, H = 720, FPS = 30, DUR = 10;
  var BEAT = 60 / 128;
  var INK = "#3a1b33";

  /* ------------------------------------------------------------------ utilidades */
  function hex(h) {
    h = h.replace("#", "");
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
  }

  // Constructor de trazados al estilo canvas (M, L, C, Q) -> Shape de AE
  function P() { this.v = []; this.i = []; this.o = []; }
  P.prototype.M = function (x, y) { this.v.push([x, y]); this.i.push([0, 0]); this.o.push([0, 0]); return this; };
  P.prototype.L = function (x, y) { return this.M(x, y); };
  P.prototype.C = function (a, b, c, d, x, y) {
    var n = this.v.length - 1, p = this.v[n];
    this.o[n] = [a - p[0], b - p[1]];
    this.v.push([x, y]); this.i.push([c - x, d - y]); this.o.push([0, 0]);
    return this;
  };
  P.prototype.Q = function (cx, cy, x, y) {
    var p = this.v[this.v.length - 1];
    return this.C(p[0] + 2 / 3 * (cx - p[0]), p[1] + 2 / 3 * (cy - p[1]), x + 2 / 3 * (cx - x), y + 2 / 3 * (cy - y), x, y);
  };
  P.prototype.shape = function (closed) {
    var v = this.v.slice(0), i = this.i.slice(0), o = this.o.slice(0);
    if (closed && v.length > 2) {
      var a = v[0], b = v[v.length - 1];
      if (Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01) {
        i[0] = i[i.length - 1]; v.pop(); i.pop(); o.pop();
      }
    }
    var s = new Shape();
    s.vertices = v; s.inTangents = i; s.outTangents = o; s.closed = !!closed;
    return s;
  };
  function heartPath(x, y, s) {
    return new P().M(x, y + s * 0.35)
      .C(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45)
      .C(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
  }

  /* ------------------------------------------------------------------ proyecto y composición */
  if (!app.project) app.newProject();
  app.beginUndoGroup("Luli y la Radio Mágica");

  var comp = app.project.items.addComp("Luli y la Radio Mágica", W, H, 1, DUR, FPS);
  comp.bgColor = [0, 0, 0];
  comp.motionBlur = true;

  /* ------------------------------------------------------------------ capas y grupos */
  function tr(layer) { return layer.property("ADBE Transform Group"); }
  function setXf(layer, anchor, pos, parent) {
    if (parent) layer.setParentWithJump(parent);
    tr(layer).property("ADBE Anchor Point").setValue(anchor);
    tr(layer).property("ADBE Position").setValue(pos);
  }
  function nul(name, pos, parent) {
    var l = comp.layers.addNull(DUR);
    l.name = name; l.enabled = true;
    setXf(l, [0, 0], pos, parent);
    return l;
  }
  // Capa de forma. anchor = pivote en coordenadas del personaje; se coloca en su sitio (pivote = posición).
  function shp(name, parent, anchor, pos) {
    var l = comp.layers.addShape();
    l.name = name;
    anchor = anchor || [0, 0];
    setXf(l, anchor, pos || anchor, parent);
    return l;
  }
  function root(l) { return l.property("ADBE Root Vectors Group"); }
  // Grupo nuevo al frente (pintado como en canvas: lo último, encima).
  function G(layer, name, build, xf) {
    var g = root(layer).addProperty("ADBE Vector Group");
    g.name = name;
    build(g.property("ADBE Vectors Group"));
    if (xf) {
      var t = g.property("ADBE Vector Transform Group");
      if (xf.pos) t.property("ADBE Vector Position").setValue(xf.pos);
      if (xf.rot) t.property("ADBE Vector Rotation").setValue(xf.rot);
      if (xf.scale) t.property("ADBE Vector Scale").setValue(xf.scale);
      if (xf.op !== undefined) t.property("ADBE Vector Group Opacity").setValue(xf.op);
    }
    g.moveTo(1);
  }
  function path(c, p, closed) { c.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape").setValue(p.shape(closed)); }
  function ell(c, x, y, w, h) {
    var e = c.addProperty("ADBE Vector Shape - Ellipse");
    e.property("ADBE Vector Ellipse Size").setValue([w, h]);
    e.property("ADBE Vector Ellipse Position").setValue([x, y]);
  }
  function rect(c, x, y, w, h, r) {
    var e = c.addProperty("ADBE Vector Shape - Rect");
    e.property("ADBE Vector Rect Size").setValue([w, h]);
    e.property("ADBE Vector Rect Position").setValue([x, y]);
    e.property("ADBE Vector Rect Roundness").setValue(r || 0);
  }
  function star(c, x, y, pts, outer, inner, rot) {
    var s = c.addProperty("ADBE Vector Shape - Star");
    s.property("ADBE Vector Star Type").setValue(1);
    s.property("ADBE Vector Star Points").setValue(pts);
    s.property("ADBE Vector Star Position").setValue([x, y]);
    s.property("ADBE Vector Star Outer Radius").setValue(outer);
    s.property("ADBE Vector Star Inner Radius").setValue(inner);
    if (rot) s.property("ADBE Vector Star Rotation").setValue(rot);
  }
  function stroke(c, col, w, op) {
    var s = c.addProperty("ADBE Vector Graphic - Stroke");
    s.property("ADBE Vector Stroke Color").setValue(hex(col));
    s.property("ADBE Vector Stroke Width").setValue(w);
    s.property("ADBE Vector Stroke Line Cap").setValue(2);
    s.property("ADBE Vector Stroke Line Join").setValue(2);
    if (op !== undefined) s.property("ADBE Vector Stroke Opacity").setValue(op);
    return s;
  }
  function fill(c, col, op) {
    var f = c.addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(hex(col));
    if (op !== undefined) f.property("ADBE Vector Fill Opacity").setValue(op);
    return f;
  }
  // relleno + contorno de tinta (el contorno queda encima del relleno)
  function fs(c, col, w) { if (w) stroke(c, INK, w); fill(c, col); }
  // línea gruesa con borde: color encima de tinta
  function line2(c, col, w) { stroke(c, col, w); stroke(c, INK, w + 6); }

  /* ------------------------------------------------------------------ fotogramas clave */
  function ease(prop) {
    for (var k = 1; k <= prop.numKeys; k++) {
      if (prop.keyInInterpolationType(k) === KeyframeInterpolationType.HOLD) continue;
      try {
        var n = 1;
        var vt = prop.propertyValueType;
        if (vt !== PropertyValueType.TwoD_SPATIAL && vt !== PropertyValueType.ThreeD_SPATIAL && prop.value instanceof Array) n = prop.value.length;
        var e = [], j;
        for (j = 0; j < n; j++) e.push(new KeyframeEase(0, 55));
        prop.setTemporalEaseAtKey(k, e, e);
      } catch (err) { /* sin suavizado si la propiedad no lo admite */ }
    }
  }
  function keys(prop, list, hold) {
    for (var k = 0; k < list.length; k++) prop.setValueAtTime(list[k][0], list[k][1]);
    if (hold) {
      for (k = 1; k <= prop.numKeys; k++) prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
    } else ease(prop);
  }
  function X(layer, name) { return tr(layer).property(name); }
  function expr(prop, lines) { prop.expression = (lines instanceof Array) ? lines.join("\n") : lines; }
  function effect(layer, match) { return layer.property("ADBE Effect Parade").addProperty(match); }
  function blur(layer, amount) {
    try { effect(layer, "ADBE Gaussian Blur 2").property("ADBE Gaussian Blur 2-0001").setValue(amount); } catch (e) {}
  }
  function glow(layer, radius, intensity) {
    try {
      var g = effect(layer, "ADBE Glo2");
      g.property("ADBE Glo2-0003").setValue(radius);
      g.property("ADBE Glo2-0004").setValue(intensity);
    } catch (e) {}
  }
  function solid(name, col, w, h, parent) {
    var l = comp.layers.addSolid(hex(col), name, w || W, h || H, 1, DUR);
    if (parent) { l.setParentWithJump(parent); X(l, "ADBE Position").setValue([W / 2, H / 2]); }
    return l;
  }

  // Expresiones comunes (motor JavaScript de AE)
  var E_BEAT = "var b = " + BEAT + "; var pulse = Math.pow(1 - ((time / b) % 1), 3);";
  var E_SWAY = "var b = " + BEAT + "; var d = Math.max(0, time - 3.6); var sw = Math.sin(d * Math.PI / b / 2) * Math.min(1, d * 2);";

  /* ================================================================== CÁMARA */
  var CAM = nul("CAM (zoom y temblor)", [W / 2, H / 2]);
  X(CAM, "ADBE Anchor Point").setValue([W / 2, H / 2]);
  keys(X(CAM, "ADBE Scale"), [[0, [100, 100]], [3.5, [115, 115]], [3.6, [112, 112]], [5, [100, 100]], [8, [104, 104]], [10, [96, 96]]]);
  expr(X(CAM, "ADBE Position"), [
    "var k = Math.max(0, Math.min(1, (time - 2.8) / 0.75)) * (time < 3.7 ? 1 : 0);",
    "add(value, [Math.sin(time * 90) * 6 * k, Math.cos(time * 77) * 5 * k]);"
  ]);

  /* ================================================================== FONDO */
  var bg = solid("Cielo", "#000000", 1600, 1000, CAM);
  try {
    var ramp = effect(bg, "ADBE Ramp");
    ramp.property("ADBE Ramp-0001").setValue([800, 0]);
    ramp.property("ADBE Ramp-0003").setValue([800, 1000]);
    keys(ramp.property("ADBE Ramp-0002"), [[1.6, hex("#070420")], [4.2, hex("#2b0f5e")]]);
    keys(ramp.property("ADBE Ramp-0004"), [[1.6, hex("#3a1d63")], [4.2, hex("#ff8fc0")]]);
  } catch (e) {}

  var stars = shp("Estrellas", CAM);
  (function () {
    var seed = 20251105;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var i;
    G(stars, "puntos", function (c) {
      for (i = 0; i < 120; i++) { var r = 1 + rnd() * 3; ell(c, rnd() * W, rnd() * H * 0.8, r, r); }
      fill(c, "#ffffff");
    });
    G(stars, "destellos", function (c) {
      for (i = 0; i < 14; i++) star(c, rnd() * W, rnd() * H * 0.75, 4, 7 + rnd() * 6, 1.5, 0);
      fill(c, "#ffffff");
    });
  })();
  expr(X(stars, "ADBE Opacity"), "wiggle(4, 25) - 10");

  var moon = shp("Luna", CAM, [0, 0], [1060, 130]);
  G(moon, "halo", function (c) { ell(c, 0, 0, 300, 300); fill(c, "#fff0c8", 30); });
  G(moon, "luna", function (c) { ell(c, 0, 0, 104, 104); fill(c, "#fff4d6"); });
  G(moon, "sombra", function (c) { ell(c, 22, -12, 92, 92); fill(c, "#1a0c45"); });

  var burst = shp("Rayos de sol", CAM, [0, 0], [W / 2, 330]);
  G(burst, "rayos", function (c) {
    for (var i = 0; i < 20; i += 2) {
      var a0 = i * Math.PI * 2 / 20, a1 = a0 + Math.PI * 2 / 40;
      path(c, new P().M(0, 0).L(Math.cos(a0) * 1300, Math.sin(a0) * 1300).L(Math.cos(a1) * 1300, Math.sin(a1) * 1300), true);
    }
    fill(c, "#ffe9a8");
  });
  keys(X(burst, "ADBE Opacity"), [[3.6, 0], [4.6, 35]]);
  expr(X(burst, "ADBE Rotation"), "time * 20");

  function cloudGroup(layer, name, x, y, s, col, op) {
    G(layer, name, function (c) {
      ell(c, -60, 10, 76, 76); ell(c, -15, -12, 104, 104); ell(c, 45, 0, 84, 84); ell(c, 85, 18, 56, 56);
      ell(c, -40, 32, 68, 68); ell(c, 20, 34, 80, 80); ell(c, 72, 34, 56, 56);
      fill(c, col, op);
    }, { pos: [x, y], scale: [s * 100, s * 100] });
  }
  var clouds = shp("Nubes", CAM);
  cloudGroup(clouds, "n1", 120, 470, 0.9, "#e59be0", 55);
  cloudGroup(clouds, "n2", 420, 640, 1.3, "#ffc1e0", 50);
  cloudGroup(clouds, "n3", 900, 480, 0.8, "#e59be0", 55);
  cloudGroup(clouds, "n4", 1180, 620, 1.2, "#ffc1e0", 50);
  cloudGroup(clouds, "n5", -80, 650, 1.4, "#d38fe0", 45);
  keys(X(clouds, "ADBE Opacity"), [[1.6, 45], [4.2, 100]]);
  expr(X(clouds, "ADBE Position"), "add(value, [time * 14, 0])");

  /* ================================================================== ESCENA 1: pedestal y efectos */
  var pedestal = shp("Nube pedestal", CAM, [0, 0], [630, 550]);
  cloudGroup(pedestal, "nube", 0, 0, 1.5, "#ffd6ee", 100);
  keys(X(pedestal, "ADBE Opacity"), [[0, 60], [2.4, 100], [3.6, 0]], true);

  var speed = shp("Lineas de velocidad", CAM, [0, 0], [640, 400]);
  G(speed, "lineas", function (c) {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 70; i++) {
      var a = rnd() * Math.PI * 2, w = 0.004 + rnd() * 0.012, inner = 260 + rnd() * 200;
      path(c, new P().M(Math.cos(a) * inner, Math.sin(a) * inner).L(Math.cos(a - w) * 1100, Math.sin(a - w) * 1100).L(Math.cos(a + w) * 1100, Math.sin(a + w) * 1100), true);
    }
    fill(c, "#ffffff");
  });
  keys(X(speed, "ADBE Opacity"), [[2.7, 0], [3.5, 85], [3.62, 0]]);
  expr(X(speed, "ADBE Rotation"), "posterizeTime(15); random(0, 360)");

  // Ondas de sonido (arcos arcoíris que se expanden)
  var RING_COLS = ["#ff7cc4", "#ffd84d", "#5ee6d8", "#b48bff", "#ff9b54", "#7dff9b"];
  for (var ri = 0; ri < 6; ri++) {
    var ring = shp("Onda " + (ri + 1), CAM, [0, 0], [640, 400]);
    G(ring, "arco", function (c) {
      path(c, new P().M(-100, 0).C(-100, -55, -55, -100, 0, -100).C(55, -100, 100, -55, 100, 0), false);
      stroke(c, RING_COLS[ri], 8);
    });
    keys(X(ring, "ADBE Position"), [[0, [640, 400]], [3.6, [930, 500]]], true);
    expr(X(ring, "ADBE Scale"), [
      "var st = time < 3.6 ? 1.9 : 3.6; var k = (((time - st) / (" + BEAT + " * 2)) + " + (ri / 6) + ") % 1;",
      "var s = 50 + k * 520; [s, s];"
    ]);
    expr(X(ring, "ADBE Opacity"), [
      "var st = time < 3.6 ? 1.9 : 3.6; if (time < st) 0; else {",
      "var k = (((time - st) / (" + BEAT + " * 2)) + " + (ri / 6) + ") % 1;",
      "var pw = time < 3.6 ? Math.min(1, (time - 1.7) / 0.7) : 1; (1 - k) * 80 * pw; }"
    ]);
  }

  /* ================================================================== LA RADIO */
  var RADIO = nul("RADIO (control)", [640, 520], CAM);
  X(RADIO, "ADBE Anchor Point").setValue([0, 122]);
  keys(X(RADIO, "ADBE Position"), [[0, [640, 520]], [3.6, [930, 648]]], true);
  keys(X(RADIO, "ADBE Scale"), [[0, [125, 125]], [3.6, [0, 0]]], true);
  (function () {
    var sc = X(RADIO, "ADBE Scale");
    sc.setValueAtTime(3.75, [0, 0]); sc.setValueAtTime(4.1, [112, 112]); sc.setValueAtTime(4.3, [100, 100]);
    for (var k = 1; k <= sc.numKeys; k++) {
      var t = sc.keyTime(k);
      if (t >= 3.75) sc.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    }
    sc.setInterpolationTypeAtKey(sc.nearestKeyIndex(3.6), KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
  })();
  expr(X(RADIO, "ADBE Position"), [
    "var b = " + BEAT + ";",
    "if (time < 3.6) add(value, [0, Math.sin(time * 2) * 6]);",
    "else sub(value, [0, Math.abs(Math.sin((time - 3.6) * Math.PI / b)) * 26]);"
  ]);
  expr(X(RADIO, "ADBE Scale"), [
    E_BEAT,
    "var on = time < 1.7 ? 0 : 1;",
    "var sur = (time > 1.25 && time < 1.75) ? Math.sin((time - 1.25) / 0.5 * Math.PI) : 0;",
    "var q = pulse * 0.07 * on;",
    "[value[0] * (1 + q - sur * 0.06), value[1] * (1 - q + sur * 0.1)];"
  ]);
  expr(X(RADIO, "ADBE Rotation"), [
    E_SWAY,
    "var k = Math.max(0, Math.min(1, (time - 2.8) / 0.75)) * (time < 3.7 ? 1 : 0);",
    "time < 3.6 ? Math.sin(time * 60) * 2.5 * k : -sw * 3.4;"
  ]);

  var rGlow = shp("Radio - brillo", RADIO);
  G(rGlow, "brillo", function (c) { ell(c, 0, 0, 480, 480); fill(c, "#d2a0ff", 60); });
  blur(rGlow, 80);
  keys(X(rGlow, "ADBE Opacity"), [[1.7, 0], [2.4, 100]]);

  var rBody = shp("Radio - cuerpo", RADIO);
  G(rBody, "asa", function (c) { rect(c, 0, -101, 180, 66, 20); line2(c, "#6a3cb4", 11); });
  G(rBody, "pies", function (c) { rect(c, -84, 112, 48, 24, 9); rect(c, 84, 112, 48, 24, 9); fs(c, "#4b2a7c", 3.5); });
  G(rBody, "cuerpo", function (c) { rect(c, 0, 12, 280, 196, 30); fs(c, "#9767e0", 5); });
  G(rBody, "sombra inferior", function (c) { rect(c, 0, 94, 262, 26, 12); fill(c, "#4a1a8a", 35); });
  G(rBody, "placa", function (c) { rect(c, 0, 13, 248, 166, 22); fill(c, "#ffffff", 12); });
  G(rBody, "reflejo", function (c) { rect(c, -58, -75, 120, 10, 5); fill(c, "#ffffff", 40); });
  G(rBody, "boton1", function (c) { rect(c, -108, -91, 18, 14, 4); fs(c, "#ff7cc4", 3); });
  G(rBody, "boton2", function (c) { rect(c, -84, -91, 18, 14, 4); fs(c, "#ffd84d", 3); });
  G(rBody, "boton3", function (c) { rect(c, 84, -91, 18, 14, 4); fs(c, "#5ee6d8", 3); });
  G(rBody, "boton4", function (c) { rect(c, 108, -91, 18, 14, 4); fs(c, "#ff7cc4", 3); });
  G(rBody, "casete", function (c) { rect(c, 0, -56, 80, 36, 9); fs(c, "#efe4ff", 3.5); });

  for (var rs = -1; rs <= 1; rs += 2) {
    var reel = shp("Radio - bobina " + (rs < 0 ? "I" : "D"), RADIO, [rs * 18, -56]);
    G(reel, "bobina", function (c) {
      ell(c, rs * 18, -56, 18, 18); fs(c, "#7b4cc9", 2.5);
    });
    G(reel, "radios", function (c) {
      for (var k = 0; k < 3; k++) {
        var a = k * Math.PI * 2 / 3;
        path(c, new P().M(rs * 18 + Math.cos(a) * 2, -56 + Math.sin(a) * 2).L(rs * 18 + Math.cos(a) * 7, -56 + Math.sin(a) * 7), false);
      }
      stroke(c, "#efe4ff", 3);
    });
    expr(X(reel, "ADBE Rotation"), "time > 1.7 ? (time - 1.7) * 230 : 0");
  }

  // Ojos-altavoz
  var radioLids = [];
  for (var es = -1; es <= 1; es += 2) {
    var ex = es * 74, side = es < 0 ? "I" : "D";
    var rEye = shp("Radio - altavoz " + side, RADIO, [ex, 0]);
    G(rEye, "altavoz", function (c) { ell(c, ex, 0, 108, 108); fs(c, "#4b2a7c", 4); });
    G(rEye, "aro", function (c) { ell(c, ex, 0, 94, 94); stroke(c, "#cfaeff", 4); });
    G(rEye, "tornillos", function (c) {
      for (var a = 0; a < 16; a++) { var aa = a * Math.PI * 2 / 16; ell(c, ex + Math.cos(aa) * 50.5, Math.sin(aa) * 50.5, 3, 3); }
      fill(c, "#cfaeff", 60);
    });
    G(rEye, "globo", function (c) { ell(c, ex, 0, 80, 80); fs(c, "#ffffff", 3.5); });
    expr(X(rEye, "ADBE Scale"), [E_BEAT, "var pw = time < 1.7 ? 0 : Math.min(1, (time - 1.7) / 0.7); var s = 100 + pulse * 7 * pw; [s, s];"]);

    var pupil = shp("Radio - pupila " + side, rEye, [ex, 0]);
    G(pupil, "pupila", function (c) { ell(c, ex - es * 2, 4, 38, 42); fill(c, "#1d1026"); });
    G(pupil, "brillo1", function (c) { ell(c, ex - es * 2 - 6, -4, 14, 14); fill(c, "#ffffff"); });
    G(pupil, "brillo2", function (c) { ell(c, ex - es * 2 + 7, 12, 6, 6); fill(c, "#ffffff"); });
    expr(X(pupil, "ADBE Position"), [
      E_SWAY,
      "var look = 0;",
      "if (time > 1.45 && time < 1.9) look = Math.sin((time - 1.45) / 0.45 * Math.PI * 2);",
      "else if (time >= 3.6) look = -0.5 + sw * 0.3;",
      "add(value, [look * 12, 0]);"
    ]);

    var lid = shp("Radio - parpado " + side, rEye, [ex, 0]);
    G(lid, "parpado", function (c) { ell(c, ex, 0, 80, 80); fs(c, "#8a58d6", 3.5); });
    G(lid, "ojo dormido", function (c) { path(c, new P().M(ex - 24, 4).Q(ex, 20, ex + 24, 4), false); stroke(c, INK, 5); });
    radioLids.push(lid);
  }
  for (var li = 0; li < radioLids.length; li++) {
    expr(X(radioLids[li], "ADBE Opacity"), [
      "var bl = [5.3, 6.55, 9.2]; var closed = time < 1.3;",
      "for (var i = 0; i < bl.length; i++) if (Math.abs(time - bl[i]) < 0.08) closed = true;",
      "closed ? 100 : 0;"
    ]);
  }

  var E_RSING = [
    "var s = 0;",
    "if (time >= 3.6) s = time > 4.2 ? Math.sin(time * Math.PI * 4.2 + 1.2) * 0.5 + 0.5 : 0.3;",
    "else if (time > 1.9) s = Math.sin(time * Math.PI * 4.2) * 0.5 + 0.5;",
    "else if (time > 1.45) s = 0.15;"
  ].join("\n");
  var rMouth = shp("Radio - boca abierta", RADIO, [0, 62]);
  G(rMouth, "boca", function (c) {
    path(c, new P().M(-34, 62).Q(0, 70, 34, 62).Q(30, 98, 0, 100).Q(-30, 98, -34, 62), true); fs(c, "#2a1238", 3.5);
  });
  G(rMouth, "lengua", function (c) { ell(c, 0, 92, 34, 16); fill(c, "#ff6f9e"); });
  G(rMouth, "dientes", function (c) { rect(c, 0, 66, 36, 6, 2); fill(c, "#ffffff"); });
  expr(X(rMouth, "ADBE Scale"), [E_RSING, "[100, 35 + 65 * s];"]);
  expr(X(rMouth, "ADBE Opacity"), [E_RSING, "s > 0.05 ? 100 : 0;"]);
  var rSmile = shp("Radio - sonrisa", RADIO);
  G(rSmile, "sonrisa", function (c) { path(c, new P().M(-20, 66).Q(0, 76, 20, 66), false); stroke(c, INK, 4); });
  expr(X(rSmile, "ADBE Opacity"), [E_RSING, "s > 0.05 ? 0 : 100;"]);

  function textLayer(name, txt, size, col, strokeCol, strokeW, parent, pos) {
    var l = comp.layers.addText(txt);
    l.name = name;
    var tp = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = tp.value;
    td.resetCharStyle(); td.resetParagraphStyle();
    td.fontSize = size;
    try { td.font = "Arial-BoldMT"; } catch (e) {}
    td.applyFill = true; td.fillColor = hex(col);
    if (strokeCol) { td.applyStroke = true; td.strokeColor = hex(strokeCol); td.strokeWidth = strokeW; td.strokeOverFill = false; }
    td.justification = ParagraphJustification.CENTER_JUSTIFY;
    tp.setValue(td);
    if (parent) l.setParentWithJump(parent);
    X(l, "ADBE Position").setValue(pos);
    return l;
  }

  var zzz = textLayer("Zzz", "Z z Z", 40, "#e9dcff", "#3a1b5a", 5, CAM, [790, 300]);
  expr(X(zzz, "ADBE Position"), "var k = (time * 0.6) % 1; add(value, [k * 60 + Math.sin(k * 6) * 8, -k * 90]);");
  expr(X(zzz, "ADBE Opacity"), "time < 1.1 ? 100 : Math.max(0, 100 - (time - 1.1) * 500);");

  var bang = textLayer("Sorpresa !", "!", 80, "#ffe14d", INK, 8, CAM, [810, 270]);
  keys(X(bang, "ADBE Scale"), [[1.25, [0, 0]], [1.38, [130, 130]], [1.5, [100, 100]], [1.62, [100, 100]], [1.8, [0, 0]]]);
  keys(X(bang, "ADBE Opacity"), [[0, 0], [1.25, 100], [1.8, 0]], true);

  /* ================================================================== LULI */
  var SKIN = "#ffe3d6", SKIN_SH = "#f6b9a8", HAIR = "#f7a6cc", HAIR_SH = "#df77ab", HAIR_HI = "#ffd9ec";
  var GLOVE = "#ff6fb5", GOLD = "#ffd35c", GOLD_SH = "#d9982c";

  var LULI = nul("LULI (control)", [520, 205], CAM);
  keys(X(LULI, "ADBE Scale"), [[0, [0, 0]]], true);
  (function () {
    var sc = X(LULI, "ADBE Scale"), po = X(LULI, "ADBE Position");
    sc.setValueAtTime(3.6, [20, 20]); sc.setValueAtTime(3.95, [126, 126]); sc.setValueAtTime(4.15, [112, 112]);
    po.setValueAtTime(3.6, [520, 285]); po.setValueAtTime(4.15, [520, 205]);
    ease(po);
  })();
  expr(X(LULI, "ADBE Position"), "var b = " + BEAT + "; sub(value, [0, Math.abs(Math.sin(Math.max(0, time - 3.6) * Math.PI / b)) * 11]);");
  expr(X(LULI, "ADBE Rotation"), [E_SWAY, "sw * 2.3;"]);

  // Capa (amarilla)
  var cape = shp("Luli - capa", LULI, [0, 104]);
  G(cape, "capa", function (c) {
    path(c, new P().M(-48, 104).C(-130, 140, -170, 260, -195, 370).Q(-150, 352, -110, 378).Q(-50, 356, 0, 372)
      .Q(55, 356, 110, 378).Q(150, 352, 195, 370).C(170, 260, 130, 140, 48, 104), true);
    fs(c, GOLD, 3.5);
  });
  G(cape, "pliegues", function (c) {
    path(c, new P().M(-70, 130).Q(-115, 250, -135, 365), false);
    path(c, new P().M(70, 130).Q(115, 250, 135, 365), false);
    stroke(c, "#c8781a", 3, 45);
  });
  G(cape, "brillo", function (c) {
    path(c, new P().M(-20, 120).C(-40, 200, -30, 300, -10, 360).L(20, 360).C(10, 300, 0, 200, 20, 120), true);
    fill(c, "#fff1b0", 55);
  });
  expr(X(cape, "ADBE Rotation"), [E_SWAY, "Math.sin(time * 3) * 1.5 + sw * 2;"]);

  // Trenzas
  function braidLayer(name, x0, y0, x1, y1, cx, cy, withBow) {
    var l = shp(name, LULI, [x0, y0]);
    var n = 12;
    for (var i = 0; i <= n; i++) {
      var k = i / n, a = 1 - k;
      var x = a * a * x0 + 2 * a * k * cx + k * k * x1, y = a * a * y0 + 2 * a * k * cy + k * k * y1;
      var dx = 2 * a * (cx - x0) + 2 * k * (x1 - cx), dy = 2 * a * (cy - y0) + 2 * k * (y1 - cy);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI + (i % 2 ? 20 : -20), r = 20 - k * 8;
      G(l, "mechon " + i, function (c) { ell(c, 0, 0, r * 2.1, r * 1.6); fs(c, i % 2 ? HAIR : HAIR_HI, 2.5); }, { pos: [x, y], rot: ang });
    }
    G(l, "punta", function (c) { path(c, new P().M(-10, 0).Q(-14, 40, 0, 62).Q(12, 40, 10, 0), true); fs(c, HAIR, 2.5); }, { pos: [x1, y1] });
    if (withBow) {
      G(l, "cintas", function (c) {
        path(c, new P().M(0, 2).Q(-10, 24, -18, 40), false);
        path(c, new P().M(0, 2).Q(10, 24, 18, 40), false);
        line2(c, "#ffd84d", 4);
      }, { pos: [x1, y1] });
      G(l, "lazo", function (c) {
        path(c, new P().M(0, 0).C(-26, -26, -44, -6, -38, 12).C(-30, 22, -12, 10, 0, 0), true);
        path(c, new P().M(0, 0).C(26, -26, 44, -6, 38, 12).C(30, 22, 12, 10, 0, 0), true);
        fs(c, "#ffd84d", 2.5);
      }, { pos: [x1, y1] });
      G(l, "nudo", function (c) { ell(c, 0, 1, 14, 14); fs(c, "#f5b23a", 2.5); }, { pos: [x1, y1] });
    }
    expr(X(l, "ADBE Rotation"), [E_SWAY, "-sw * 3 + Math.sin(time * 2.4) * 1.5;"]);
    return l;
  }
  braidLayer("Luli - trenza izquierda", -70, 60, -118, 300, -120, 170, false);
  braidLayer("Luli - trenza derecha (lazo)", 70, 60, 126, 290, 124, 170, true);

  // Pelo de atrás
  var backHair = shp("Luli - pelo trasero", LULI, [0, -20]);
  G(backHair, "pelo", function (c) {
    path(c, new P().M(-78, -20).C(-106, 50, -104, 130, -122, 210).Q(-100, 226, -86, 204).Q(-70, 150, -62, 110).L(62, 110)
      .Q(70, 150, 86, 204).Q(100, 226, 122, 210).C(104, 130, 106, 50, 78, -20)
      .C(78, -63.08, 43.08, -98, 0, -98).C(-43.08, -98, -78, -63.08, -78, -20), true);
    fs(c, HAIR, 3.5);
  });
  G(backHair, "sombra", function (c) {
    path(c, new P().M(-70, 20).Q(-86, 120, -96, 200).L(-84, 196).Q(-72, 120, -60, 40), true);
    path(c, new P().M(70, 20).Q(86, 120, 96, 200).L(84, 196).Q(72, 120, 60, 40), true);
    fill(c, HAIR_SH, 70);
  });
  expr(X(backHair, "ADBE Rotation"), [E_SWAY, "-sw * 1.2;"]);

  // Piernas y botas
  var legs = shp("Luli - piernas", LULI);
  G(legs, "piernas", function (c) {
    path(c, new P().M(-60, 330).L(-16, 330).L(-23, 420).L(-53, 420), true);
    path(c, new P().M(16, 330).L(60, 330).L(53, 420).L(23, 420), true);
    fs(c, SKIN, 3);
  });
  G(legs, "botas", function (c) { rect(c, -38, 430, 38, 60, 12); rect(c, 38, 430, 38, 60, 12); fs(c, "#ffb3d9", 3); });

  // Torso: cuello, hombros, gargantilla, falda, corpiño, hombrera
  var torso = shp("Luli - cuerpo y vestido", LULI);
  G(torso, "cuello", function (c) { rect(c, 0, 78, 28, 52, 8); fs(c, SKIN, 3); });
  G(torso, "sombra cuello", function (c) { rect(c, 0, 64, 26, 22, 6); fill(c, SKIN_SH); });
  G(torso, "hombros", function (c) {
    path(c, new P().M(-16, 92).Q(-52, 96, -62, 116).L(-54, 160).L(54, 160).L(62, 116).Q(52, 96, 16, 92), true); fs(c, SKIN, 3);
  });
  G(torso, "gargantilla", function (c) { rect(c, 0, 76.5, 32, 9, 4); fs(c, "#7b3fc4", 2.5); });
  G(torso, "dije", function (c) { star(c, 0, 86, 5, 6, 2.7, 0); fs(c, GOLD, 2); });
  G(torso, "falda", function (c) {
    path(c, new P().M(-42, 214).C(-80, 250, -120, 300, -142, 340).Q(-70, 356, 0, 350).Q(70, 356, 142, 340).C(120, 300, 80, 250, 42, 214), true);
    fs(c, "#7d42cc", 3.5);
  });
  G(torso, "tablas", function (c) {
    var xs = [-70, -30, 10, 50, 90];
    for (var i = 0; i < xs.length; i++) path(c, new P().M(xs[i] * 0.4, 222).L(xs[i] * 1.3, 346), false);
    stroke(c, "#28104f", 3, 35);
  });
  G(torso, "borde brillante", function (c) {
    path(c, new P().M(-142, 340).Q(-70, 356, 0, 350).Q(70, 356, 142, 340), false); line2(c, GLOVE, 13);
  });
  G(torso, "purpurina", function (c) {
    for (var i = 0; i < 24; i++) { var k = i / 23, x = -138 + k * 276; ell(c, x, 343 + Math.sin(k * Math.PI) * 9 + (i % 3 - 1) * 3, 3.5, 3.5); }
    fill(c, "#ffffff", 85);
  });
  G(torso, "corpino", function (c) {
    path(c, new P().M(-52, 130).Q(-28, 108, 0, 132).Q(28, 108, 52, 130).L(44, 216).Q(0, 228, -44, 216), true); fs(c, GOLD, 3.5);
  });
  G(torso, "corpino sombras", function (c) {
    path(c, new P().M(-50, 132).L(-43, 214).L(-30, 219).Q(-40, 180, -32, 138), true);
    path(c, new P().M(50, 132).L(43, 214).L(30, 219).Q(40, 180, 32, 138), true);
    fill(c, GOLD_SH, 70);
  });
  G(torso, "corpino lineas", function (c) {
    path(c, new P().M(-48, 178).Q(0, 196, 48, 178), false);
    path(c, new P().M(0, 180).L(0, 222), false);
    stroke(c, "#96590a", 2.5, 70);
  });
  G(torso, "corpino brillo", function (c) { ell(c, -22, 146, 20, 10); fill(c, "#ffffff", 50); });
  G(torso, "emblema", function (c) { ell(c, 0, 162, 34, 34); fs(c, "#b07bf0", 3); });
  G(torso, "corazon", function (c) { path(c, heartPath(0, 165, 11), true); fs(c, "#ff5fa2", 2); });
  G(torso, "cinturon", function (c) { path(c, new P().M(-45, 208).Q(0, 222, 45, 208), false); line2(c, GLOVE, 5); });
  G(torso, "hombrera 3", function (c) { ell(c, 0, 8, 68, 44); fs(c, GOLD_SH, 3); }, { pos: [60, 112], rot: 20 });
  G(torso, "hombrera 2", function (c) { ell(c, 0, 0, 56, 36); fs(c, GOLD, 3); }, { pos: [60, 112], rot: 20 });
  G(torso, "hombrera 1", function (c) { ell(c, 0, -7, 40, 26); fs(c, "#ffeaa6", 3); }, { pos: [60, 112], rot: 20 });

  // Cabeza (nulo con inclinación)
  var HEAD = nul("Luli - CABEZA", [0, 20], LULI);
  X(HEAD, "ADBE Anchor Point").setValue([0, 20]);
  expr(X(HEAD, "ADBE Rotation"), [E_SWAY, "sw * 3.4;"]);

  var face = shp("Luli - cara", HEAD);
  G(face, "cara", function (c) {
    path(c, new P().M(-60, -12).C(-60, 30, -24, 68, 0, 78).C(24, 68, 60, 30, 60, -12).C(60, -84, -60, -84, -60, -12), true);
    fs(c, SKIN, 3.5);
  });
  G(face, "sombra flequillo", function (c) {
    var p = new P().M(-56, -10);
    for (var i = 1; i <= 10; i++) p.L(-56 + i * 11.2, i % 2 ? 0 : -12);
    p.L(50, -58).L(-50, -58);
    path(c, p, true); fill(c, "#f096a0", 45);
  });
  G(face, "cejas", function (c) {
    path(c, new P().M(-16, -12).Q(-34, -20, -52, -14), false);
    path(c, new P().M(16, -12).Q(34, -20, 52, -14), false);
    stroke(c, "#b9557f", 2.5);
  });
  G(face, "nariz", function (c) { path(c, new P().M(2, 40).L(-1, 44), false); stroke(c, "#d98c78", 2); });

  var blush = shp("Luli - rubor", HEAD);
  G(blush, "rubor", function (c) { ell(c, -40, 46, 40, 24); ell(c, 40, 46, 40, 24); fill(c, "#ff6ea0", 55); });
  blur(blush, 12);

  function eyeLayer(name, x, side) {
    var l = shp(name, HEAD, [x, 22]);
    X(l, "ADBE Scale").setValue([84, 84]);
    function Pt(px, py) { return [x + px, 22 + py]; }
    G(l, "blanco", function (c) {
      var a = Pt(-23, -6);
      var p = new P().M(a[0], a[1]);
      var b1 = Pt(-22, -26), b2 = Pt(22, -30), b3 = Pt(24, -8); p.C(b1[0], b1[1], b2[0], b2[1], b3[0], b3[1]);
      b1 = Pt(24, 16); b2 = Pt(12, 24); b3 = Pt(0, 24); p.C(b1[0], b1[1], b2[0], b2[1], b3[0], b3[1]);
      b1 = Pt(-14, 24); b2 = Pt(-24, 14); b3 = Pt(-23, -6); p.C(b1[0], b1[1], b2[0], b2[1], b3[0], b3[1]);
      path(c, p, true); fill(c, "#ffffff");
    });
    G(l, "iris", function (c) { ell(c, x + side * 1.5, 25, 34, 44); stroke(c, "#3a0c30", 2.5); fill(c, "#c2338a"); });
    G(l, "iris superior", function (c) { ell(c, x + side * 1.5, 14, 30, 22); fill(c, "#4a1240", 80); });
    G(l, "iris brillo", function (c) { ell(c, x + side * 1.5, 37, 22, 12); fill(c, "#ffa8da", 85); });
    G(l, "pupila", function (c) { ell(c, x + side * 1.5, 26, 14, 20); fill(c, "#2a0620"); });
    G(l, "reflejos", function (c) {
      ell(c, x - side * 5 + 2, 16, 13, 17); ell(c, x + side * 8, 35, 6, 6); star(c, x + side * 7, 12, 4, 6, 1.4, 0);
      fill(c, "#ffffff");
    });
    G(l, "pestanas", function (c) {
      var a = Pt(-side * 24, -2), b1 = Pt(-side * 22, -28), b2 = Pt(side * 20, -34), b3 = Pt(side * 30, -10);
      path(c, new P().M(a[0], a[1]).C(b1[0], b1[1], b2[0], b2[1], b3[0], b3[1]), false);
      stroke(c, INK, 7);
    });
    G(l, "pestanas ala", function (c) {
      var a = Pt(side * 26, -14), q = Pt(side * 34, -16), e = Pt(side * 40, -24);
      path(c, new P().M(a[0], a[1]).Q(q[0], q[1], e[0], e[1]), false);
      a = Pt(side * 28, -8); q = Pt(side * 36, -8); e = Pt(side * 40, -12);
      path(c, new P().M(a[0], a[1]).Q(q[0], q[1], e[0], e[1]), false);
      a = Pt(-6, 25); q = Pt(6, 27); e = Pt(16, 21);
      path(c, new P().M(a[0], a[1]).Q(q[0], q[1], e[0], e[1]), false);
      stroke(c, INK, 3.5);
    });
    // parpadeo
    var sc = X(l, "ADBE Scale"), bl = [5.3, 6.55, 9.2];
    for (var i = 0; i < bl.length; i++) { sc.setValueAtTime(bl[i] - 0.09, [84, 84]); sc.setValueAtTime(bl[i], [84, 6]); sc.setValueAtTime(bl[i] + 0.09, [84, 84]); }
    return l;
  }
  eyeLayer("Luli - ojo izquierdo", -30, -1);
  var eyeR = eyeLayer("Luli - ojo derecho", 30, 1);
  keys(X(eyeR, "ADBE Opacity"), [[0, 100], [7.35, 0], [7.95, 100]], true);

  var wink = shp("Luli - guiño", HEAD);
  G(wink, "guiño", function (c) {
    path(c, new P().M(30 - 18.5, 27).Q(30, 8.5, 30 + 18.5, 27), false);
    path(c, new P().M(30 + 17, 23.5).L(30 + 27, 15), false);
    stroke(c, INK, 5);
  });
  keys(X(wink, "ADBE Opacity"), [[0, 0], [7.35, 100], [7.95, 0]], true);

  var E_SING = [
    "var s = 0;",
    "if (time > 4.3 && time < 8.1) s = (Math.sin(time * Math.PI * 4.2) * 0.5 + 0.5) * (Math.sin(time * 5.1) > -0.4 ? 1 : 0);",
    "else if (time >= 8.1) s = 0.9;"
  ].join("\n");
  var mOpen = shp("Luli - boca abierta", HEAD, [0, 53]);
  G(mOpen, "boca", function (c) { path(c, new P().M(-12, 53).Q(0, 50, 12, 53).Q(10, 72, 0, 72).Q(-10, 72, -12, 53), true); fs(c, "#a8184a", 2.5); });
  G(mOpen, "lengua", function (c) { ell(c, 0, 67, 14, 8); fill(c, "#ff7d9c"); });
  G(mOpen, "dientes", function (c) { rect(c, 0, 54, 16, 3, 1); fill(c, "#ffffff"); });
  expr(X(mOpen, "ADBE Scale"), [E_SING, "[100, 40 + 60 * s];"]);
  expr(X(mOpen, "ADBE Opacity"), [E_SING, "s > 0.08 ? 100 : 0;"]);
  var mSmile = shp("Luli - sonrisa", HEAD);
  G(mSmile, "sonrisa", function (c) { path(c, new P().M(-11, 54).Q(0, 64, 11, 54).Q(0, 59, -11, 54), true); fs(c, "#ff4f8e", 2.2); });
  expr(X(mSmile, "ADBE Opacity"), [E_SING, "s > 0.08 ? 0 : 100;"]);

  var bangs = shp("Luli - flequillo", HEAD);
  G(bangs, "mechones delanteros", function (c) {
    for (var s = -1; s <= 1; s += 2) {
      path(c, new P().M(s * 80, -30).C(s * 108, 60, s * 96, 140, s * 104, 196).Q(s * 84, 150, s * 76, 80).Q(s * 74, 20, s * 68, -8), true);
    }
    fs(c, HAIR, 3);
  });
  G(bangs, "lineas mechones", function (c) {
    path(c, new P().M(-86, 0).Q(-96, 90, -98, 170), false);
    path(c, new P().M(86, 0).Q(96, 90, 98, 170), false);
    stroke(c, HAIR_SH, 2.5);
  });
  G(bangs, "flequillo", function (c) {
    var p = new P().M(-84, 30).C(-98, -64, -40, -106, 18, -104).C(70, -100, 98, -58, 84, 30);
    var pts = [[74, 4], [66, -34], [56, -8], [44, -52], [30, -20], [34, -62], [8, -8], [-4, -44], [-26, 0], [-24, -40], [-50, 6], [-52, -30], [-72, 12]];
    var px = 84, py = 30;
    for (var i = 0; i < pts.length; i++) {
      var x = pts[i][0], y = pts[i][1], down = y > py;
      p.Q(down ? px * 0.25 + x * 0.75 : px * 0.75 + x * 0.25, down ? py * 0.8 + y * 0.2 : py * 0.2 + y * 0.8, x, y);
      px = x; py = y;
    }
    p.Q(-80, 16, -84, 30);
    path(c, p, true); fs(c, HAIR, 3.5);
  });
  G(bangs, "brillo pelo", function (c) {
    var arcs = [[-2.6, -2.3], [-2.15, -1.85], [-1.55, -1.25], [-1.05, -0.75]];
    for (var i = 0; i < arcs.length; i++) {
      var a0 = arcs[i][0], a1 = arcs[i][1], am = (a0 + a1) / 2, rr = 80 / Math.cos((a1 - a0) / 2);
      path(c, new P().M(Math.cos(a0) * 80, -8 + Math.sin(a0) * 80).Q(Math.cos(am) * rr, -8 + Math.sin(am) * rr, Math.cos(a1) * 80, -8 + Math.sin(a1) * 80), false);
    }
    stroke(c, "#ffffff", 6, 75);
  });

  var clip = shp("Luli - horquilla estrella", HEAD, [64, -58]);
  G(clip, "estrella", function (c) { star(c, 64, -58, 5, 15, 6.75, 17); fs(c, "#ffe14d", 3); });
  G(clip, "corazon", function (c) { path(c, heartPath(80, -44, 7), true); fs(c, "#ff8cc6", 2); });
  expr(X(clip, "ADBE Rotation"), "Math.sin(time * 3) * 3;");

  // Brazos
  function sparkles(c, a, b, n) {
    for (var i = 0; i < n; i++) { var k = (i + 0.5) / n; ell(c, a[0] + (b[0] - a[0]) * k + ((i % 3) - 1) * 5, a[1] + (b[1] - a[1]) * k + ((i % 2) * 2 - 1) * 5, 3.5, 3.5); }
    fill(c, "#ffffff", 80);
  }
  var armL = shp("Luli - brazo izquierdo (mano abierta)", LULI, [-56, 116]);
  G(armL, "brazo", function (c) { path(c, new P().M(-56, 116).L(-104, 182), false); line2(c, SKIN, 22); });
  G(armL, "guante", function (c) { path(c, new P().M(-96.8, 172.1).L(-150, 150), false); line2(c, GLOVE, 25); });
  G(armL, "brillos", function (c) { sparkles(c, [-100, 176], [-146, 152], 7); });
  G(armL, "puño guante", function (c) { ell(c, -102, 180, 32, 22); fs(c, "#ffa6d3", 3); }, {});
  G(armL, "mano", function (c) {
    ell(c, 0, 0, 36, 26); fs(c, GLOVE, 3);
  }, { pos: [-150, 150], rot: -28 });
  G(armL, "dedos", function (c) {
    for (var i = 0; i < 4; i++) ell(c, -20 + i * 2, -14 + i * 8, 22, 10);
    ell(c, 6, -16, 10, 20);
    fs(c, GLOVE, 2.5);
  }, { pos: [-150, 150], rot: -28 });
  expr(X(armL, "ADBE Rotation"), "Math.sin(time * 4) * 4;");

  var armR = shp("Luli - brazo derecho (puño)", LULI, [56, 116]);
  G(armR, "brazo", function (c) { path(c, new P().M(56, 116).L(118, 150), false); line2(c, SKIN, 22); });
  G(armR, "guante", function (c) { path(c, new P().M(108.7, 144.9).L(104, 72), false); line2(c, GLOVE, 25); });
  G(armR, "brillos", function (c) { sparkles(c, [114, 146], [104, 78], 7); });
  G(armR, "puño guante", function (c) { ell(c, 116, 152, 32, 22); fs(c, "#ffa6d3", 3); });
  G(armR, "puño", function (c) { rect(c, 104, 70, 34, 32, 11); fs(c, GLOVE, 3); });
  G(armR, "dedos", function (c) {
    path(c, new P().M(98, 55).L(98, 66), false); path(c, new P().M(108, 55).L(108, 66), false); stroke(c, INK, 2);
  });
  G(armR, "pulgar", function (c) { ell(c, 90, 74, 12, 18); fs(c, GLOVE, 2); });
  expr(X(armR, "ADBE Rotation"), [E_BEAT, "time > 3.6 ? -pulse * 8 : 0;"]);

  // Chispa del guiño
  var winkFx = shp("Chispa del guiño", CAM, [0, 0], [600, 200]);
  G(winkFx, "estrella", function (c) { star(c, 0, 0, 4, 40, 6, 0); fill(c, "#fff6a8"); });
  G(winkFx, "estrella2", function (c) { star(c, 36, -34, 4, 18, 3, 0); fill(c, "#ffffff"); });
  G(winkFx, "corazon", function (c) { path(c, heartPath(50, 20, 14), true); fill(c, "#ff5fa2"); });
  keys(X(winkFx, "ADBE Scale"), [[7.35, [0, 0]], [7.65, [100, 100]], [7.95, [0, 0]]]);
  expr(X(winkFx, "ADBE Rotation"), "time * 180");
  glow(winkFx, 25, 1.2);

  /* ================================================================== NOTAS Y CORAZONES */
  var NOTE_COLS = ["#ff5fa2", "#ffd84d", "#5ee6d8", "#b48bff", "#ff9b54", "#7dff9b"];
  var GLYPHS = ["♪", "♫", "♪", "♥", "♫", "♪"];
  var NN = 30;
  for (var ni = 0; ni < NN; ni++) {
    var nt = textLayer("Nota " + (ni + 1), GLYPHS[ni % GLYPHS.length], 44, NOTE_COLS[ni % NOTE_COLS.length], null, 0, CAM, [0, 0]);
    var off = (ni * 2.6 / NN).toFixed(4);
    var head = [
      "var off = " + off + ", life = 2.6;",
      "var st = time < 3.6 ? 1.9 : 3.6; var u = time - st - off;",
      "var cyc = Math.floor(u / life); var age = u - cyc * life;",
      "seedRandom(index * 97 + cyc, true);",
      "var a = -Math.PI / 2 + (random() - 0.5) * 2.6, v = 160 + random() * 180, sz = 0.8 + random() * 0.7;"
    ].join("\n");
    expr(X(nt, "ADBE Position"), [head,
      "var o = time < 3.6 ? [640, 380] : [930, 440];",
      "if (u < 0) [-400, -400]; else add(o, [Math.cos(a) * v * age + Math.sin(age * 3 + index) * 18, Math.sin(a) * v * age - 40 * age * age]);"]);
    expr(X(nt, "ADBE Scale"), [head,
      "var k = Math.min(1, age / 0.3); var s = (u < 0 ? 0 : sz * 100 * (k < 1 ? (1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2)) : 1)); [s, s];"]);
    expr(X(nt, "ADBE Opacity"), [head, "u < 0 ? 0 : 100 * Math.min(1, (life - age) / 0.7);"]);
    expr(X(nt, "ADBE Rotation"), "Math.sin(time * 4 + index) * 18;");
    glow(nt, 15, 0.8);
    nt.motionBlur = true;
  }

  /* ================================================================== DESTELLO, TÍTULO, CONFETI */
  var flash = solid("Destello", "#fff8eb");
  keys(X(flash, "ADBE Opacity"), [[0, 0], [3.3, 0], [3.62, 100], [4.1, 0]]);

  var TITLE = nul("TITULO (control)", [640, 590]);
  keys(X(TITLE, "ADBE Scale"), [[0, [0, 0]]], true);
  (function () {
    var sc = X(TITLE, "ADBE Scale");
    sc.setValueAtTime(8.0, [0, 0]); sc.setValueAtTime(8.45, [116, 116]); sc.setValueAtTime(8.6, [100, 100]);
    ease(sc);
  })();
  var banner = shp("Titulo - cinta", TITLE);
  G(banner, "cinta", function (c) {
    path(c, new P().M(-430, -62).Q(0, -92, 430, -62).L(450, 70).Q(0, 40, -450, 70), true);
    fs(c, "#ff4f9a", 5);
  });
  G(banner, "degradado izq", function (c) { path(c, new P().M(-430, -62).Q(-200, -80, -150, -78).L(-150, 58).Q(-300, 62, -450, 70), true); fill(c, "#7a3cff", 70); });
  G(banner, "degradado der", function (c) { path(c, new P().M(430, -62).Q(200, -80, 150, -78).L(150, 58).Q(300, 62, 450, 70), true); fill(c, "#ff9b54", 70); });
  var t1 = textLayer("Titulo - Luli Pampín", "Luli Pampín", 66, "#ffe14d", "#2a0f3a", 10, TITLE, [0, 4]);
  var t2 = textLayer("Titulo - y la Radio Mágica", "y la Radio Mágica", 34, "#fffbe0", "#2a0f3a", 7, TITLE, [0, 52]);
  try {
    var sweep = effect(t1, "CC Light Sweep");
    keys(sweep.property(1), [[8.7, [-400, 0]], [9.5, [800, 0]]]);
  } catch (e) {}

  for (var ci = 0; ci < 40; ci++) {
    var cf = shp("Confeti " + (ci + 1), null, [0, 0], [0, 0]);
    G(cf, "papel", function (c) { rect(c, 0, 0, 12, 6, 1); fill(c, NOTE_COLS[ci % NOTE_COLS.length]); });
    var cexp = "seedRandom(index, true); var x0 = random(0, " + W + "), vy = random(120, 340), vx = random(-60, 60), d = random(0, 0.6), r0 = random(0, 360), vr = random(-500, 500);\n" +
      "var age = time - 8 - d;\n";
    expr(X(cf, "ADBE Position"), cexp + "age < 0 ? [-100, -100] : [x0 + vx * age + Math.sin(age * 3 + r0) * 20, -20 + vy * age];");
    expr(X(cf, "ADBE Rotation"), cexp + "r0 + vr * Math.max(0, age);");
    expr(X(cf, "ADBE Scale"), cexp + "[100, 100 * Math.cos(Math.max(0, age) * 6 + r0)];");
  }

  var fade = solid("Fundido", "#000000");
  keys(X(fade, "ADBE Opacity"), [[0, 100], [0.8, 0], [9.6, 0], [10, 100]]);

  var bars = shp("Franjas de cine");
  G(bars, "franjas", function (c) { rect(c, W / 2, 9, W, 18, 0); rect(c, W / 2, H - 9, W, 18, 0); fill(c, "#000000"); });

  /* ================================================================== AUDIO */
  try {
    var here = File($.fileName).parent;
    var wav = new File(here.fsName + "/musica.wav");
    if (!wav.exists) wav = new File(here.parent.fsName + "/musica.wav");
    if (wav.exists) {
      var footage = app.project.importFile(new ImportOptions(wav));
      var al = comp.layers.add(footage);
      al.moveToEnd();
      al.name = "Música";
    }
  } catch (e) {}

  // Desenfoque de movimiento en los controles de personajes
  for (var li2 = 1; li2 <= comp.numLayers; li2++) {
    var L = comp.layer(li2);
    if (L.name.indexOf("Luli") === 0 || L.name.indexOf("Radio") === 0) { try { L.motionBlur = true; } catch (e) {} }
  }

  comp.openInViewer();
  app.endUndoGroup();
  alert("¡Listo! Composición \"Luli y la Radio Mágica\" creada (10 s).\nPulsa la barra espaciadora para verla.");
})();
