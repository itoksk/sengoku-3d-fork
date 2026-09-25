#!/usr/bin/env python3
"""地理院標高タイル（dem5a / dem）と OpenStreetMap から、各合戦ページ用の地形データを焼き込む。

出力（<battle>/geo/）:
  terrain.bin   Uint16 LE, N×N, 値 v → 標高[m] = v/10 - 100。行は北→南、列は西→東
  cover.png     N×N グレースケール土地被覆（0=田畑, 128=林, 255=水面）
  relief.jpg    TEX×TEX 地表テクスチャ（標高から作った陰影＋当時を想定した色分け）
  meta.json     縮尺・原点・出典など

使い方: python3 _geo/build.py [合戦のフォルダ名 ...]（省略すると battle.json のある全フォルダ）
設定: <合戦>/battle.json の "build" 欄（原点の緯度経度・範囲・旧街道の概略線・季節など）
"""
import io, json, math, os, sys, time
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '_geo', 'cache')
UA = {'User-Agent': 'sengoku-3d-edu/1.0 (github.com/itoksk/sengoku-3d)'}

M_PER_UNIT = 30.0   # 1単位 = 30m（全合戦共通。変えるとカメラや人形の大きさの前提が崩れます）


def load_battle(name):
    """<合戦>/battle.json を読む。build 欄が地形生成の設定。"""
    path = os.path.join(ROOT, name, 'battle.json')
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    cfg = d['build']
    cfg.setdefault('N', 301)
    cfg.setdefault('TEX', 2048)
    cfg.setdefault('season', 'summer')
    cfg.setdefault('roads', {})
    cfg.setdefault('checks', [])
    return cfg


def all_battles():
    return sorted(n for n in os.listdir(ROOT)
                  if not n.startswith(('_', '.')) and os.path.exists(os.path.join(ROOT, n, 'battle.json')))


# ---------------- 座標 ----------------
R_EARTH = 6378137.0

def enu_to_ll(lat0, lon0, east, north):
    lat = lat0 + math.degrees(north / R_EARTH)
    lon = lon0 + math.degrees(east / (R_EARTH * math.cos(math.radians(lat0))))
    return lat, lon

def ll_to_enu(lat0, lon0, lat, lon):
    north = math.radians(lat - lat0) * R_EARTH
    east = math.radians(lon - lon0) * R_EARTH * math.cos(math.radians(lat0))
    return east, north

def ll_to_px(lat, lon, z):
    n = 256 * 2 ** z
    x = (lon + 180) / 360 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y

# ---------------- 標高タイル ----------------
def fetch(url, path):
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return f.read()
    for i in range(4):
        r = requests.get(url, headers=UA, timeout=30)
        if r.status_code == 404:
            data = b''
            break
        if r.ok:
            data = r.content
            break
        time.sleep(1 + i)
    else:
        raise RuntimeError(url)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)
    time.sleep(0.05)
    return data

def decode_dem(png):
    a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(np.int64)
    x = (a[..., 0] << 16) | (a[..., 1] << 8) | a[..., 2]
    h = np.where(x < 2 ** 23, x, x - 2 ** 24).astype(np.float64) * 0.01
    h[x == 2 ** 23] = np.nan
    return h

class Dem:
    """dem5a(z15) を優先し、欠損は dem10b(z14) で埋めるサンプラ。"""
    def __init__(self):
        self.tiles = {}

    def tile(self, kind, z, tx, ty):
        key = (kind, z, tx, ty)
        if key not in self.tiles:
            url = f'https://cyberjapandata.gsi.go.jp/xyz/{kind}/{z}/{tx}/{ty}.png'
            data = fetch(url, os.path.join(CACHE, kind, str(z), f'{tx}_{ty}.png'))
            self.tiles[key] = decode_dem(data) if data else None
        return self.tiles[key]

    def sample_grid(self, lats, lons, kind, z):
        px, py = zip(*(ll_to_px(la, lo, z) for la, lo in zip(lats.ravel(), lons.ravel())))
        px = np.array(px) - 0.5
        py = np.array(py) - 0.5
        x0 = np.floor(px).astype(int); y0 = np.floor(py).astype(int)
        fx = px - x0; fy = py - y0
        out = np.zeros(px.shape)
        corners = [(0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)]
        for dx, dy, w in corners:
            gx = x0 + dx; gy = y0 + dy
            tx = gx // 256; ty = gy // 256
            v = np.full(px.shape, np.nan)
            for key in set(zip(tx.tolist(), ty.tolist())):
                t = self.tile(kind, z, *key)
                if t is None:
                    continue
                m = (tx == key[0]) & (ty == key[1])
                v[m] = t[gy[m] - key[1] * 256, gx[m] - key[0] * 256]
            out += v * w
        return out.reshape(lats.shape)

    def grid(self, lats, lons):
        h = self.sample_grid(lats, lons, 'dem5a_png', 15)
        miss = np.isnan(h)
        if miss.any():
            h2 = self.sample_grid(lats, lons, 'dem_png', 14)
            h[miss] = h2[miss]
        if np.isnan(h).any():
            # 水面などの欠損は近傍の最小値で埋める
            h = fill_nan(h)
        return h

def fill_nan(h):
    h = h.copy()
    for _ in range(64):
        m = np.isnan(h)
        if not m.any():
            break
        p = np.pad(h, 1, mode='edge')
        nb = np.stack([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]])
        h[m] = np.nanmin(np.where(np.isnan(nb), np.inf, nb), axis=0)[m]
        h[np.isinf(h)] = np.nan
    return np.nan_to_num(h, nan=np.nanmin(h))

# ---------------- OSM ----------------
def overpass(q, path):
    if os.path.exists(path):
        return json.load(open(path))
    urls = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
    for url in urls * 2:
        try:
            r = requests.post(url, data={'data': q}, headers=UA, timeout=240)
            r.raise_for_status()
            d = r.json()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            json.dump(d, open(path, 'w'), ensure_ascii=False)
            return d
        except Exception as e:  # noqa
            print('overpass fail', url, e)
            time.sleep(5)
    raise RuntimeError('overpass')

def osm_features(name, bbox):
    s = ','.join(f'{v:.5f}' for v in bbox)
    q = f'''[out:json][timeout:200];
(
  way["waterway"~"^(river|stream|canal)$"]({s});
  way["natural"="water"]({s});
  relation["natural"="water"]({s});
  way["water"="river"]({s});
  way["landuse"="reservoir"]({s});
  way["name"~"中山道|東海道|北国|伊勢街道|牧田|旧街道|金谷坂|菊川坂"]({s});
  way["highway"]["historic"]({s});
);
out body geom;'''
    return overpass(q, os.path.join(CACHE, f'osm_{name}.json'))

def join_rings(ways):
    """マルチポリゴンの outer を端点でつないで輪にする。"""
    key = lambda p: (round(p['lat'], 7), round(p['lon'], 7))
    ways = [list(w) for w in ways if len(w) > 1]
    rings = []
    while ways:
        ring = ways.pop(0)
        changed = True
        while changed and key(ring[0]) != key(ring[-1]):
            changed = False
            for i, w in enumerate(ways):
                if key(w[0]) == key(ring[-1]):
                    ring += w[1:]
                elif key(w[-1]) == key(ring[-1]):
                    ring += w[::-1][1:]
                elif key(w[-1]) == key(ring[0]):
                    ring = w[:-1] + ring
                elif key(w[0]) == key(ring[0]):
                    ring = w[::-1][:-1] + ring
                else:
                    continue
                ways.pop(i)
                changed = True
                break
        rings.append(ring)
    return rings

# ---------------- ノイズ ----------------
def value_noise(shape, cell, rng):
    h, w = shape
    gh, gw = h // cell + 2, w // cell + 2
    g = rng.random((gh, gw)).astype(np.float32)
    img = Image.fromarray((g * 255).astype(np.uint8)).resize((gw * cell, gh * cell), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32)[:h, :w] / 255.0

def fbm(shape, rng, cells=(256, 96, 32, 12, 4), amps=(0.35, 0.3, 0.2, 0.1, 0.05)):
    out = np.zeros(shape, np.float32)
    for c, a in zip(cells, amps):
        out += value_noise(shape, c, rng) * a
    return out / sum(amps)

def _box(a, r, axis):
    if r < 1:
        return a
    p = np.pad(a, [(r + 1, r) if i == axis else (0, 0) for i in range(a.ndim)], mode='edge')
    c = np.cumsum(p, axis=axis, dtype=np.float64)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)

def blur(a, sigma):
    """3 回のボックスぼかしでガウスぼかしを近似する。"""
    a = np.asarray(a, np.float32)
    r = int(round(math.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2) if sigma >= 0.8 else 0
    if r < 1:
        return a
    for _ in range(3):
        a = _box(_box(a, r, 0), r, 1)
    return a

# ---------------- 本体 ----------------
def build(name):
    cfg = load_battle(name)
    lat0, lon0 = cfg['origin']
    S, N, TEX = cfg['size_m'], cfg['N'], cfg['TEX']
    out = os.path.join(ROOT, name, 'geo')
    os.makedirs(out, exist_ok=True)
    dem = Dem()

    def ll_grid(n):
        c = (np.arange(n) + 0.5) / n if n == TEX_DEM else np.linspace(0, 1, n)
        east = (c - 0.5) * S
        north = (0.5 - c) * S
        E, No = np.meshgrid(east, north)
        la = lat0 + np.degrees(No / R_EARTH)
        lo = lon0 + np.degrees(E / (R_EARTH * math.cos(math.radians(lat0))))
        return la, lo

    # 1) メッシュ用の標高グリッド（頂点位置 = 端から端まで N 点）
    TEX_DEM = -1
    la, lo = ll_grid(N)
    H = dem.grid(la, lo)
    print(name, 'height', round(float(H.min()), 1), '..', round(float(H.max()), 1))
    v = np.clip(np.round((H + 100) * 10), 0, 65535).astype('<u2')
    v.tofile(os.path.join(out, 'terrain.bin'))

    # 2) テクスチャ用の高解像度標高（ピクセル中心）
    TEX_DEM = 1024
    la2, lo2 = ll_grid(TEX_DEM)
    Hd = dem.grid(la2, lo2).astype(np.float32)
    px_m = S / TEX_DEM
    Hs = blur(Hd, 1.2)  # 近代の盛土・切土の細い線を少し弱める
    gy_, gx_ = np.gradient(Hs, px_m)
    slope = np.degrees(np.arctan(np.hypot(gx_, gy_)))
    # 北西からの光（地図の慣例）
    az, alt = math.radians(315), math.radians(40)
    nx, ny, nz = -gx_, gy_, np.ones_like(gx_)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    lx, ly, lz = math.cos(alt) * math.sin(az), math.cos(alt) * math.cos(az), math.sin(alt)
    shade = np.clip((nx * lx + ny * ly + nz * lz) / ln, 0, 1)
    rel = Hs - blur(Hs, 40)            # 周囲より高い=尾根 / 低い=谷
    basin = Hs - blur(Hs, 160)

    # 3) OSM の水系・街道
    bbox = (lat0 - math.degrees(S / 2 / R_EARTH) - 0.002,
            lon0 - math.degrees(S / 2 / (R_EARTH * math.cos(math.radians(lat0)))) - 0.002,
            lat0 + math.degrees(S / 2 / R_EARTH) + 0.002,
            lon0 + math.degrees(S / 2 / (R_EARTH * math.cos(math.radians(lat0)))) + 0.002)
    osm = osm_features(name, bbox)

    def to_tex(lat, lon, n):
        e, no = ll_to_enu(lat0, lon0, lat, lon)
        return ((e / S) + 0.5) * n, (0.5 - no / S) * n

    def mask_from(n, pick, width_m):
        img = Image.new('L', (n, n), 0)
        d = ImageDraw.Draw(img)
        for el in osm['elements']:
            t = el.get('tags', {})
            wm = pick(el, t)
            if not wm:
                continue
            geoms = []
            if el['type'] == 'way' and 'geometry' in el:
                geoms = [el['geometry']]
            elif el['type'] == 'relation':
                geoms = join_rings([m['geometry'] for m in el.get('members', []) if m.get('role') == 'outer' and 'geometry' in m])
            for g in geoms:
                pts = [to_tex(p['lat'], p['lon'], n) for p in g]
                if len(pts) < 2:
                    continue
                if wm == 'area':
                    if len(pts) > 2:
                        d.polygon(pts, fill=255)
                else:
                    d.line(pts, fill=255, width=max(1, int(round(wm / (S / n)))), joint='curve')
        return np.asarray(img, dtype=np.float32) / 255.0

    def water_pick(el, t):
        if t.get('natural') == 'water' or t.get('water') == 'river' or t.get('landuse') == 'reservoir':
            if t.get('water') in ('pond', 'reservoir', 'basin', 'wastewater') or t.get('landuse') == 'reservoir':
                return None  # 近代のため池・調整池は描かない
            return 'area'
        ww = t.get('waterway')
        if ww == 'river':
            return 22
        if ww == 'stream':
            return 7 if t.get('name') else None
        return None

    def road_pick(el, t):
        n = t.get('name', '')
        if 'waterway' in t or 'natural' in t:
            return None
        if any(k in n for k in ('中山道', '東海道', '北国', '伊勢街道', '牧田', '旧街道', '金谷坂', '菊川坂')) or t.get('historic'):
            return 7
        return None

    water = mask_from(TEX, water_pick, 0)
    rimg = Image.new('L', (TEX, TEX), 0)
    rd_ = ImageDraw.Draw(rimg)
    for pts in cfg['roads'].values():
        rd_.line([to_tex(la_, lo_, TEX) for la_, lo_ in pts], fill=255, width=max(3, int(round(16 / (S / TEX)))), joint='curve')
    roads = np.asarray(rimg, dtype=np.float32) / 255.0
    water_s = mask_from(N, water_pick, 0)

    # 4) 土地被覆（当時を想定: 平地=田畑、斜面・尾根=林、河原=砂礫）
    up = lambda a: np.asarray(Image.fromarray(a.astype(np.float32), mode='F').resize((TEX, TEX), Image.BICUBIC), dtype=np.float32)
    slope_t, rel_t, shade_t, basin_t, H_t = map(up, (slope, rel, shade, basin, Hs))
    rng = np.random.default_rng(7 if name == 'sekigahara' else 11)
    n1 = fbm((TEX, TEX), rng)
    forest = np.clip((slope_t - 7) / 6, 0, 1)
    forest = np.maximum(forest, np.clip((basin_t - 25) / 20, 0, 1))
    forest = np.clip(forest + (n1 - 0.5) * 0.9, 0, 1)
    forest = blur(forest, 4)
    forest = np.clip((forest - 0.5) * 5 + 0.5, 0, 1)
    forest = blur(forest, 1.2)

    # 田畑のパッチワーク（区画ごとに色を変える）
    cell = 18
    gh = TEX // cell + 2
    pal = (np.array([[176, 160, 92], [160, 150, 88], [190, 170, 104], [148, 140, 84], [168, 146, 96]], np.float32)
           if cfg['season'] == 'autumn' else
           np.array([[120, 146, 74], [138, 156, 82], [108, 134, 66], [150, 160, 92], [128, 140, 70]], np.float32))
    idx = rng.integers(0, len(pal), (gh, gh))
    jitter = rng.integers(0, cell, (gh, 2))
    yy, xx = np.mgrid[0:TEX, 0:TEX]
    cy = (yy + jitter[(xx // cell) % gh, 0]) // cell
    cx = (xx + jitter[(yy // cell) % gh, 1]) // cell
    pal = pal * 0.55 + pal.mean(0) * 0.45
    field = pal[idx[cy % gh, cx % gh]]
    edge = (((yy + jitter[(xx // cell) % gh, 0]) % cell) < 1) | (((xx + jitter[(yy // cell) % gh, 1]) % cell) < 1)
    field = np.where(edge[..., None], field * 0.93, field)
    field *= (0.92 + n1[..., None] * 0.16)

    fr = np.array([52, 74, 44], np.float32) if cfg['season'] == 'autumn' else np.array([46, 72, 40], np.float32)
    fr2 = np.array([82, 100, 58], np.float32)
    canopy = fbm((TEX, TEX), rng, cells=(64, 16, 6, 3), amps=(0.3, 0.3, 0.25, 0.15))
    woods = fr[None, None] * (1 - canopy[..., None] * 0.5) + fr2[None, None] * canopy[..., None] * 0.5
    woods *= 0.8 + canopy[..., None] * 0.45

    grass = np.clip((basin_t - 20) / 15, 0, 1) * np.clip((6 - slope_t) / 3, 0, 1)
    grass = np.clip(blur(grass, 3) + (n1 - 0.5) * 0.6, 0, 1)
    forest = forest * (1 - grass * 0.85)
    gcol = np.array([150, 150, 92], np.float32) if cfg['season'] == 'autumn' else np.array([128, 146, 78], np.float32)
    gcol = gcol[None, None] * (0.9 + n1[..., None] * 0.2)
    field = field * (1 - grass[..., None]) + gcol * grass[..., None]
    col = field * (1 - forest[..., None]) + woods * forest[..., None]
    # 急崖は土の色
    cliff = np.clip((slope_t - 28) / 12, 0, 1)
    col = col * (1 - cliff[..., None]) + np.array([118, 100, 74], np.float32) * cliff[..., None]
    # 河原（水面の周り）
    wb = blur(water, 5)
    gravel = np.clip(wb * 2.2, 0, 1) * (1 - water)
    col = col * (1 - gravel[..., None] * 0.8) + np.array([196, 186, 160], np.float32) * gravel[..., None] * 0.8
    # 大河の河原（川面から一定距離内で、川面との高低差が小さい平地）
    rb_m = cfg.get('riverbed_m', 0)
    if rb_m:
        wmask = (water > 0.5).astype(np.float32)
        sig = rb_m / (S / TEX) / 2.5
        wsum = blur(wmask, sig)
        wh = blur(H_t * wmask, sig) / np.maximum(wsum, 1e-4)
        near = np.clip((wsum - 0.06) * 8, 0, 1)
        bed = near * np.clip((2.5 - (H_t - wh)) / 1.5, 0, 1) * np.clip((4 - slope_t) / 2, 0, 1)
        bed = np.clip(blur(bed, 2) + (n1 - 0.5) * 0.5, 0, 1)
        bed = np.clip((bed - 0.35) * 3, 0, 1)
        grav = np.array([192, 184, 160], np.float32)[None, None] * (0.88 + canopy[..., None] * 0.2)
        col = col * (1 - bed[..., None]) + grav * bed[..., None]
    # 街道
    rd = blur(roads, 0.8)
    col = col * (1 - rd[..., None] * 0.85) + np.array([206, 190, 150], np.float32) * rd[..., None] * 0.85
    # 水面
    wat = blur(water, 0.8)
    col = col * (1 - wat[..., None]) + np.array([86, 124, 138], np.float32) * wat[..., None]
    # 陰影は控えめに（ライティングは 3D 側で行う）＋谷のアンビエントオクルージョン
    ao = np.clip(1 + rel_t / 60, 0.78, 1.08)
    sh = 0.78 + 0.34 * shade_t
    col *= (sh * ao)[..., None]
    img = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))
    img.save(os.path.join(out, 'relief.jpg'), quality=84, optimize=True, progressive=True)

    # 5) 樹木配置用の粗い被覆マップ（頂点グリッドと同じ N×N）
    cov_forest = np.asarray(Image.fromarray((forest * 255).astype(np.uint8)).resize((N, N), Image.BILINEAR), dtype=np.float32) / 255
    cover = np.where(water_s > 0.3, 255, np.where(cov_forest > 0.55, 128, 0)).astype(np.uint8)
    Image.fromarray(cover).save(os.path.join(out, 'cover.png'))

    meta = dict(
        name=name, origin=dict(lat=lat0, lon=lon0), size_m=S, N=N, m_per_unit=M_PER_UNIT,
        size_units=S / M_PER_UNIT, height='v/10-100 [m]', hmin=float(H.min()), hmax=float(H.max()),
        attribution='地形: 国土地理院 標高タイル（基盤地図情報 数値標高モデル）／水系・街道: © OpenStreetMap contributors',
    )
    json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'), ensure_ascii=False, indent=1)
    return meta, H

def sample_H(meta, H, lat, lon):
    e, no = ll_to_enu(meta['origin']['lat'], meta['origin']['lon'], lat, lon)
    S, N = meta['size_m'], meta['N']
    fx = (e / S + 0.5) * (N - 1); fy = (0.5 - no / S) * (N - 1)
    x0, y0 = int(fx), int(fy); tx, ty = fx - x0, fy - y0
    return (H[y0, x0] * (1 - tx) * (1 - ty) + H[y0, x0 + 1] * tx * (1 - ty)
            + H[y0 + 1, x0] * (1 - tx) * ty + H[y0 + 1, x0 + 1] * tx * ty)

if __name__ == '__main__':
    for nm in (sys.argv[1:] or all_battles()):
        meta, H = build(nm)
        for c in load_battle(nm)['checks']:
            print(f"  check {c['name']}: {sample_H(meta, H, c['lat'], c['lon']):.1f} m (目安 {c['expect_m']} m)")
