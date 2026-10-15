export const KART_RAINBOW = ["#f56c96", "#ffad69", "#f6df76", "#72dbac", "#68d9ec", "#8792f4", "#cc86ea"];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smoothstep = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
const tint = (hex, factor) => `rgb(${[1, 3, 5].map(offset => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * factor)).join(",")})`;
const roadColors = [0.67, 0.84].map(factor => KART_RAINBOW.map(color => tint(color, factor)));

export function getKartSceneBudget(width, height, { light = false, effects = "balanced", dpr = 1 } = {}) {
  const reduced = light || effects === "calm";
  return {
    reduced,
    pixelRatio: Math.min(dpr || 1, reduced ? 1 : 2, Math.sqrt((reduced ? 650000 : 1800000) / Math.max(1, width * height))),
    rows: reduced ? 42 : 84,
    stars: reduced ? 38 : effects === "boost" ? 140 : 100,
    fps: reduced ? 30 : 60,
    items: !reduced,
  };
}

// Reproject for each viewport instead of stretching a fixed desktop drawing.
export function projectKartRoad(z, width, height, distance = 0, direction = 1) {
  const depth = 1 / Math.max(.55, z);
  const bend = Math.pow(clamp(1 - depth, 0, 1), 2);
  return {
    x: width * (.5 + direction * .43 * Math.sin(z * .075 + distance * .012) * bend),
    y: height * (.40 + .76 * depth - .14 * smoothstep((z - 8) / 48)),
    half: width * .82 * depth,
    scale: depth,
  };
}

function quad(ctx, color, ax, ay, bx, by, cx, cy, dx, dy) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill();
}

function star(ctx, x, y, radius, color, turn = 0) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let point = 0; point < 10; point++) {
    const angle = turn - Math.PI / 2 + point * Math.PI / 5;
    const r = point % 2 ? radius * .46 : radius;
    const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r;
    if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}

export function paintKartSky(ctx, width, height, budget) {
  const sky = ctx.createLinearGradient(0, 0, width * .6, height);
  sky.addColorStop(0, "#100b2c"); sky.addColorStop(.47, "#22143e"); sky.addColorStop(1, "#080d23");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  const nebula = ctx.createRadialGradient(width * .68, height * .38, 0, width * .68, height * .38, height * .55);
  nebula.addColorStop(0, "#74528f55"); nebula.addColorStop(.45, "#4f285b35"); nebula.addColorStop(1, "#29173a00");
  ctx.fillStyle = nebula; ctx.fillRect(0, 0, width, height);
  for (let index = 0; index < budget.stars; index++) {
    const x = ((index * .61803398875 + .09) % 1) * width;
    const y = ((index * .38196601125 + index * index * .007) % 1) * height;
    const size = index % 13 === 0 ? 1.5 : .6 + index % 3 * .25;
    ctx.fillStyle = index % 4 ? "#c4c4e8aa" : "#fff4d7";
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    if (index % 13 === 0) { ctx.fillRect(x - size * 3, y - .35, size * 6, .7); ctx.fillRect(x - .35, y - size * 3, .7, size * 6); }
  }
  const px = width * .82, py = height * .24, radius = Math.min(width * .105, height * .09);
  ctx.save(); ctx.translate(px, py); ctx.rotate(-.35);
  ctx.strokeStyle = "#c3a1ef48"; ctx.lineWidth = radius * .18;
  ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.8, radius * .35, 0, 0, Math.PI * 2); ctx.stroke();
  const planet = ctx.createRadialGradient(-radius * .4, -radius * .5, 0, 0, 0, radius);
  planet.addColorStop(0, "#d7b5e0"); planet.addColorStop(.45, "#8c71ae"); planet.addColorStop(1, "#2f244d");
  ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#edcaf38c"; ctx.lineWidth = radius * .10;
  ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.8, radius * .35, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
  star(ctx, width * .13, height * .31, Math.min(width * .026, 17), "#ffe6a1", -.2);
  star(ctx, width * .9, height * .66, Math.min(width * .016, 11), "#99e6e5", .2);
}

function coin(ctx, x, y, radius, angle) {
  const squash = .4 + Math.abs(Math.cos(angle)) * .45;
  ctx.fillStyle = "#a16a25"; ctx.beginPath(); ctx.ellipse(x + radius * .14, y, radius * squash, radius, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffdc6c"; ctx.beginPath(); ctx.ellipse(x, y, radius * squash, radius, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#fff3bc"; ctx.lineWidth = Math.max(.7, radius * .12);
  ctx.beginPath(); ctx.ellipse(x, y, radius * squash * .7, radius * .76, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#bd8328"; ctx.fillRect(x - radius * .08, y - radius * .47, radius * .16, radius * .94);
}

function itemBox(ctx, x, y, size, time) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(time * 1.3) * .14);
  const s = size;
  quad(ctx, "#b7eaff", -s, -s, s * .55, -s * 1.35, s * 1.25, -s * .8, -s * .3, -s * .45);
  quad(ctx, "#ae83e6", s * .55, -s * 1.35, s * 1.25, -s * .8, s * 1.25, s * .7, s * .55, s);
  quad(ctx, "#6bbed8", -s, -s, s * .55, -s * .65, s * .55, s, -s, s * .65);
  ctx.strokeStyle = "#ecfaff"; ctx.lineWidth = Math.max(.6, s * .06); ctx.strokeRect(-s, -s * .85, s * 1.55, s * 1.6);
  ctx.fillStyle = "#fff9e5"; ctx.font = `900 ${s * 1.5}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("?", -s * .22, s * .02); ctx.restore();
}

export function paintKartRoad(ctx, width, height, distance, time, { budget, direction = 1, boost = false }) {
  const step = 64 / budget.rows;
  const offset = distance % step;
  const worldRow = Math.floor(distance / step);
  const rows = Array.from({ length: budget.rows + 1 }, (_, index) => projectKartRoad(.95 + index * step - offset, width, height, distance, direction));
  for (let index = budget.rows - 1; index >= 0; index--) {
    const near = rows[index], far = rows[index + 1];
    const row = index + worldRow;
    if (near.y < 0 || far.y > height * 1.2) continue;
    const colors = roadColors[row % 2];
    const boostTile = boost && row % 17 < 2;
    for (const side of [-1, 1]) {
      const xn = near.x + side * near.half, xf = far.x + side * far.half;
      quad(ctx, side < 0 ? "#704f89" : "#367587", xn, near.y, xf, far.y, xf, far.y + 5 * far.scale, xn, near.y + 5 * near.scale);
    }
    for (let lane = 0; lane < 7; lane++) {
      const left = lane * 2 / 7 - 1, right = (lane + 1) * 2 / 7 - 1;
      quad(ctx, boostTile ? (lane % 2 ? "#c1eced" : "#fff0a0") : colors[lane], near.x + left * near.half, near.y, far.x + left * far.half, far.y, far.x + right * far.half, far.y, near.x + right * near.half, near.y);
      if (boostTile && near.y - far.y > 3) {
        const half = (near.half + far.half) / 2;
        const cx = (near.x + far.x) / 2 + (left + right) / 2 * half;
        const cy = (near.y + far.y) / 2, dy = (near.y - far.y) * .27, dx = half * .09;
        ctx.fillStyle = "#9463a3"; ctx.beginPath();
        ctx.moveTo(cx - dx, cy + dy); ctx.lineTo(cx, cy - dy); ctx.lineTo(cx + dx, cy + dy);
        ctx.lineTo(cx + dx * .65, cy + dy); ctx.lineTo(cx, cy - dy * .3); ctx.lineTo(cx - dx * .65, cy + dy); ctx.closePath(); ctx.fill();
      }
    }
    ctx.strokeStyle = "#fff3ff35"; ctx.lineWidth = Math.max(.4, near.scale * 1.3);
    ctx.beginPath(); ctx.moveTo(near.x - near.half, near.y); ctx.lineTo(near.x + near.half, near.y); ctx.stroke();
    for (const side of [-1, 1]) {
      const n = near.x + side * near.half, f = far.x + side * far.half;
      quad(ctx, side < 0 ? "#ffc0e5" : "#c1faff", n, near.y, f, far.y, f + side * 3 * far.scale, far.y, n + side * 3 * near.scale, near.y);
      if (row % 3 === 0) {
        ctx.strokeStyle = side < 0 ? "#ffb0d8" : "#9ee9f5"; ctx.lineWidth = Math.max(.6, near.scale * 2);
        ctx.beginPath(); ctx.moveTo(n, near.y); ctx.lineTo(n, near.y - near.scale * 17); ctx.stroke();
      }
    }
    if (budget.items && index > 2 && index < 24 && row % 11 === 5) {
      const size = Math.min(22, near.half * .065);
      coin(ctx, near.x + near.half * .35, near.y - size * 1.5, size, time * 2.4 + index);
    }
    if (budget.items && index > 4 && index < 18 && row % 21 === 9) itemBox(ctx, near.x - near.half * .4, near.y - near.half * .11, near.half * .075, time);
  }
  if (boost && !budget.reduced) {
    ctx.lineCap = "round";
    const rays = budget.stars > 100 ? 30 : 18;
    for (let index = 0; index < rays; index++) {
      const angle = index * Math.PI * 2 / rays + .13;
      const travel = (time * 1.8 + index * .618) % 1;
      const radius = .25 + travel * .55;
      const x = width * .5, y = height * .43;
      ctx.strokeStyle = `${KART_RAINBOW[index % 7]}${Math.round(Math.sin(travel * Math.PI) * 120).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 1 + travel * 2;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * width * radius, y + Math.sin(angle) * height * radius);
      ctx.lineTo(x + Math.cos(angle) * width * (radius + .15), y + Math.sin(angle) * height * (radius + .15)); ctx.stroke();
    }
  }
}
