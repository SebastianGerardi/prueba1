"""Genera una pista original de 10 s (128 BPM) sincronizada con la animación."""
import numpy as np, wave, sys

SR = 44100
DUR = 10.0
BPM = 128
BEAT = 60 / BPM
t_all = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t_all)

def midi(n): return 440 * 2 ** ((n - 69) / 12)

def add(start, dur, freq, vol, kind="sq", att=.005, rel=.08, vib=0.0):
    i0 = int(start * SR); n = int((dur + rel) * SR)
    if i0 >= len(out): return
    n = min(n, len(out) - i0)
    t = np.arange(n) / SR
    f = freq * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == "sq": w = np.sign(np.sin(ph)) * .6 + np.sin(ph) * .4
    elif kind == "tri": w = 2 / np.pi * np.arcsin(np.sin(ph))
    elif kind == "bell": w = np.sin(ph) + .35 * np.sin(2.76 * ph) + .2 * np.sin(5.4 * ph)
    else: w = np.sin(ph)
    env = np.minimum(1, t / att) * np.where(t < dur, 1.0, np.maximum(0, 1 - (t - dur) / rel))
    if kind == "bell": env *= np.exp(-t * 3.2)
    out[i0:i0 + n] += w * env * vol

def kick(s):
    i0 = int(s * SR); n = min(int(.18 * SR), len(out) - i0)
    t = np.arange(n) / SR
    out[i0:i0 + n] += np.sin(2 * np.pi * (50 + 110 * np.exp(-t * 30)) * t) * np.exp(-t * 18) * .55

def noise(s, d, vol, decay):
    i0 = int(s * SR); n = min(int(d * SR), len(out) - i0)
    t = np.arange(n) / SR
    out[i0:i0 + n] += np.random.default_rng(int(s * 1000)).uniform(-1, 1, n) * np.exp(-t * decay) * vol

# 1) Intro mágica: arpegio de campanitas (0 - 3.6 s)
arp = [72, 76, 79, 84, 79, 76]
for i in range(int(3.6 / (BEAT / 2))):
    s = i * BEAT / 2
    vol = .08 + .12 * min(1, s / 2.5)
    add(s, .3, midi(arp[i % len(arp)] + (5 if s > 1.9 else 0)), vol, "bell", rel=.4)
# subida (riser) antes del destello
i0, i1 = int(2.6 * SR), int(3.6 * SR)
t = np.arange(i1 - i0) / SR
f = 300 + 1500 * (t / t[-1]) ** 2
out[i0:i1] += np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / t[-1]) * .12
noise(2.6, 1.0, .0, 1)  # (reservado)
rn = np.random.default_rng(1).uniform(-1, 1, i1 - i0) * (t / t[-1]) ** 2 * .1
out[i0:i1] += rn
# destello: acorde brillante + crash
for n_ in [72, 76, 79, 84, 88]: add(3.6, .5, midi(n_), .07, "bell", rel=1.2)
noise(3.6, 1.2, .25, 3.5)

# 2) Canción: melodía alegre (3.6 - 8.0 s)
start = 3.6
mel = [(76, .5), (79, .5), (81, .5), (79, .5), (76, .5), (74, .5), (72, 1),
       (74, .5), (76, .5), (79, .5), (84, .5), (83, .5), (81, .5), (79, 1)]
s = start
for n_, d in mel:
    if s >= 8.0: break
    add(s, d * BEAT * .85, midi(n_), .16, "sq", rel=.05, vib=.004)
    add(s, d * BEAT * .85, midi(n_ + 12), .04, "tri", rel=.05)
    s += d * BEAT
bass = [48, 48, 55, 55, 53, 53, 55, 55]
chords = [[60, 64, 67], [55, 59, 62], [53, 57, 60], [55, 59, 62]]
b = 0; s = start
while s < 8.0:
    add(s, BEAT * .45, midi(bass[b % 8]), .22, "tri", rel=.03)
    kick(s) if b % 2 == 0 else noise(s, .15, .18, 22)
    noise(s + BEAT / 2, .05, .06, 60)
    if b % 2 == 1:
        for c in chords[(b // 2) % 4]: add(s, BEAT * .3, midi(c + 12), .035, "sq", rel=.03)
    s += BEAT; b += 1

# 3) Final: fanfarria con título (8.0 - 10 s)
for n_, dt in [(72, 0), (76, .12), (79, .24), (84, .36)]:
    add(8.0 + dt, .3, midi(n_), .14, "sq", rel=.05)
for n_ in [60, 64, 67, 72, 76, 84]:
    add(8.5, 1.1, midi(n_), .06, "sq", rel=.4, vib=.006)
add(8.5, 1.1, midi(36), .25, "tri", rel=.4)
kick(8.0); kick(8.5); noise(8.5, 1.0, .22, 4)
for i, n_ in enumerate([96, 91, 88, 84, 88, 91, 96]):
    add(9.0 + i * .08, .15, midi(n_), .05, "bell", rel=.3)

# fundido y normalización
fade = np.clip((DUR - t_all) / .45, 0, 1)
out *= fade
out /= np.max(np.abs(out)) * 1.12
stereo = np.stack([out, np.roll(out, 220) * .92 + out * .08], axis=1)
pcm = (stereo * 32767).astype(np.int16)
path = sys.argv[1] if len(sys.argv) > 1 else "musica.wav"
with wave.open(path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("audio:", path)
