#!/usr/bin/env python3
"""トップページの日本地図（輪郭）を作る。

元データ: Natural Earth 1:10m（パブリックドメイン）を TopoJSON にした world-atlas@2（ISC）の countries-10m.json
出力: lib/japan-map.json  {"w","h","lon0","lat1","kx","k","d"}
  画面座標 x = (lon - lon0) * kx * k,  y = (lat1 - lat) * k   （kx = cos(中心緯度) で横方向の縮みを補正）
使い方: python3 _geo/japan_map.py
"""
import json, math, os
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json'
LON0, LON1, LAT0, LAT1 = 128.6, 146.2, 30.2, 45.8     # 九州南部〜北海道（沖縄・小笠原は範囲外）
K = 40.0                                             # 1度 = 40 px
TOL = 0.012                                          # 間引きの許容（度）
MIN_AREA = 0.004                                     # これより小さい島は描かない（平方度）


def decode(topo):
    sx, sy = topo['transform']['scale']
    tx, ty = topo['transform']['translate']
    arcs = []
    for arc in topo['arcs']:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring_pts(arcs, idxs):
    out = []
    for i in idxs:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(a[1:] if out else a)
    return out


def area(r):
    return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1e-12
    best, bi = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > best:
            best, bi = d, i
    if best <= tol:
        return [a, b]
    return simplify(pts[:bi + 1], tol)[:-1] + simplify(pts[bi:], tol)


def main():
    topo = requests.get(URL, timeout=60).json()
    arcs = decode(topo)
    jp = next(g for g in topo['objects']['countries']['geometries'] if g.get('properties', {}).get('name') == 'Japan')
    kx = math.cos(math.radians((LAT0 + LAT1) / 2))
    w, h = (LON1 - LON0) * kx * K, (LAT1 - LAT0) * K
    parts = []
    for poly in jp['arcs']:
        outer = ring_pts(arcs, poly[0])
        if area(outer) < MIN_AREA:
            continue
        if not any(LON0 <= x <= LON1 and LAT0 <= y <= LAT1 for x, y in outer):
            continue
        # 閉じた輪は始点と終点が同じなので、始点からいちばん遠い点で2つに分けて間引く
        far = max(range(len(outer)), key=lambda i: math.hypot(outer[i][0] - outer[0][0], outer[i][1] - outer[0][1]))
        r = simplify(outer[:far + 1], TOL)[:-1] + simplify(outer[far:], TOL)
        if len(r) < 4:
            continue
        parts.append('M' + 'L'.join(f'{(x - LON0) * kx * K:.1f},{(LAT1 - y) * K:.1f}' for x, y in r) + 'Z')
    out = dict(w=round(w, 1), h=round(h, 1), lon0=LON0, lat1=LAT1, kx=round(kx, 6), k=K, d=''.join(parts),
               source='Natural Earth（パブリックドメイン）/ world-atlas@2 countries-10m')
    path = os.path.join(ROOT, 'lib', 'japan-map.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    print(path, len(parts), 'polygons', len(out['d']) // 1024, 'KB')


if __name__ == '__main__':
    main()
