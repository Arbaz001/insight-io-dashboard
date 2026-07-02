#!/usr/bin/env python3
"""
generate_pcd.py
---------------
Generates a synthetic warehouse LiDAR scan and writes it as an ASCII .pcd file
(the standard Point Cloud Data format read by three.js `PCDLoader`).

The scene mimics the occupancy map shown in the Insight.IO demo: a bounded
warehouse floor with perimeter walls, interior partition walls and a handful of
rectangular obstacles (shelving / machinery). Only XYZ is written -- the viewer
colours the cloud by height at load time, the way most real LiDAR maps are shown.

Usage:
    python3 scripts/generate_pcd.py            # -> public/data/warehouse_map.pcd

No third-party dependencies (uses only the standard library) so it runs on a
clean machine offline.
"""

import math
import os
import random

# Deterministic output so the committed map is reproducible.
random.seed(42)

OUT = os.path.join(
    os.path.dirname(__file__), "..", "public", "data", "warehouse_map.pcd"
)

points: list[tuple[float, float, float]] = []


def jitter(scale: float = 0.015) -> float:
    """Small gaussian noise so surfaces look scanned, not perfectly flat."""
    return random.gauss(0.0, scale)


def add_floor(x0, x1, y0, y1, density=7.0):
    """Sparse points across a floor rectangle at z~0."""
    n = int((x1 - x0) * (y1 - y0) * density)
    for _ in range(n):
        x = random.uniform(x0, x1)
        y = random.uniform(y0, y1)
        points.append((x + jitter(), y + jitter(), jitter(0.01)))


def add_wall(x0, y0, x1, y1, height=3.0, density=2600):
    """A vertical wall segment from (x0,y0) to (x1,y1), sampled top to bottom."""
    length = math.hypot(x1 - x0, y1 - y0)
    n = int(length * density / 10)
    for _ in range(n):
        t = random.random()
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t
        z = random.uniform(0, height)
        points.append((x + jitter(0.01), y + jitter(0.01), z))


def add_box(cx, cy, w, d, h, density=700):
    """A solid rectangular obstacle (shelving unit) -- 4 sides + top face."""
    x0, x1 = cx - w / 2, cx + w / 2
    y0, y1 = cy - d / 2, cy + d / 2
    # sides
    add_wall(x0, y0, x1, y0, h, density)
    add_wall(x1, y0, x1, y1, h, density)
    add_wall(x1, y1, x0, y1, h, density)
    add_wall(x0, y1, x0, y0, h, density)
    # top face
    n = int(w * d * 30)
    for _ in range(n):
        x = random.uniform(x0, x1)
        y = random.uniform(y0, y1)
        points.append((x + jitter(), y + jitter(), h + jitter(0.02)))


# --- Warehouse layout (metres) ---------------------------------------------
# Perimeter ~ 44m x 32m centred on the origin.
X0, X1, Y0, Y1 = -22, 22, -16, 16

add_floor(X0, X1, Y0, Y1)

# Perimeter walls
add_wall(X0, Y0, X1, Y0, 3.2)
add_wall(X1, Y0, X1, Y1, 3.2)
add_wall(X1, Y1, X0, Y1, 3.2)
add_wall(X0, Y1, X0, Y0, 3.2)

# Interior partitions creating rooms/aisles
add_wall(-8, Y0, -8, -4, 2.8)
add_wall(6, 4, 6, Y1, 2.8)
add_wall(6, 10, 16, 10, 2.6)

# Obstacle blocks (shelving / machinery) scattered through the space
add_box(-14, 8, 5, 3, 2.2)
add_box(-2, 9, 4, 3, 1.8)
add_box(12, -8, 6, 4, 2.4)
add_box(-13, -9, 4, 5, 2.0)
add_box(2, -3, 3, 3, 1.4)
add_box(15, 6, 3, 6, 2.2)

# Scatter a little sensor speckle in open space for realism
for _ in range(1500):
    x = random.uniform(X0, X1)
    y = random.uniform(Y0, Y1)
    z = random.uniform(0, 2.5)
    if random.random() < 0.04:
        points.append((x, y, z))

# --- Write ASCII PCD --------------------------------------------------------
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    n = len(points)
    f.write("# .PCD v0.7 - Point Cloud Data file format\n")
    f.write("VERSION 0.7\n")
    f.write("FIELDS x y z\n")
    f.write("SIZE 4 4 4\n")
    f.write("TYPE F F F\n")
    f.write("COUNT 1 1 1\n")
    f.write(f"WIDTH {n}\n")
    f.write("HEIGHT 1\n")
    f.write("VIEWPOINT 0 0 0 1 0 0 0\n")
    f.write(f"POINTS {n}\n")
    f.write("DATA ascii\n")
    for x, y, z in points:
        f.write(f"{x:.3f} {y:.3f} {z:.3f}\n")

print(f"Wrote {len(points):,} points -> {os.path.relpath(OUT)}")
