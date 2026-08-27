(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const vehicles = [...document.querySelectorAll('.vehicle')];
  const copies = [...document.querySelectorAll('.copy')];
  const dots = [...document.querySelectorAll('[data-go]')];
  const read = document.getElementById('read');
  const status = document.getElementById('status');
  const dragLabel = document.getElementById('dragLabel');
  const sceneMark = document.getElementById('sceneMark');
  const max = vehicles.length - 1;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = t => {
    const x = clamp(t, 0, 1);
    return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  let p = 0;
  let dragging = false;
  let inertia = true;
  let parallax = true;
  let startX = 0;
  let startP = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let raf = 0;

  // Stable visual roles. Cars deliberately remain visible at the sides.
  const ROLE = {
    previous: { x: -57, y: 7, s: .79, o: .58 },
    active:   { x:   0, y: 0, s: 1.00, o: 1.00 },
    next:     { x:  57, y: 9, s: .80, o: .64 },
    farLeft:  { x: -94, y: 13, s: .70, o: 0.00 },
    farRight: { x:  94, y: 14, s: .70, o: 0.10 }
  };

  function lerpPose(a, b, t) {
    return {
      x: mix(a.x, b.x, t),
      y: mix(a.y, b.y, t),
      s: mix(a.s, b.s, t),
      o: mix(a.o, b.o, t)
    };
  }

  function segmentData() {
    if (p >= max) return { seg: max, local: 0 };
    const seg = Math.floor(clamp(p, 0, max - 0.00001));
    return { seg, local: p - seg };
  }

  // Choreography is role-based rather than slider-based.
  // During each segment:
  // previous -> farLeft
  // active   -> previous
  // next     -> active
  // future   -> next
  function pose(index) {
    const { seg, local } = segmentData();

    if (seg === max) {
      if (index === max) return { ...ROLE.active, z: 60 };
      if (index === max - 1) return { ...ROLE.previous, z: 42 };
      return { ...(index < max - 1 ? ROLE.farLeft : ROLE.farRight), z: 10 };
    }

    const activeT = easeInOut(local);
    const incomingT = easeOut(clamp((local - .035) / .965, 0, 1));
    const previousT = smooth(clamp(local / .82, 0, 1));
    const futureT = smooth(clamp((local - .16) / .84, 0, 1));

    if (index === seg - 1) {
      const q = lerpPose(ROLE.previous, ROLE.farLeft, previousT);
      return { ...q, z: 24 };
    }

    if (index === seg) {
      const q = lerpPose(ROLE.active, ROLE.previous, activeT);
      // Keep departing hero visually authoritative for first half of transition.
      q.o = mix(1, ROLE.previous.o, smooth(clamp((local - .18) / .82, 0, 1)));
      q.y = parallax ? mix(0, 7, activeT) : 0;
      return { ...q, z: local < .52 ? 62 : 48 };
    }

    if (index === seg + 1) {
      const q = lerpPose(ROLE.next, ROLE.active, incomingT);
      q.y = parallax ? mix(9, 0, incomingT) : 0;
      // The incoming car crosses above the outgoing car after midpoint.
      return { ...q, z: local < .52 ? 50 : 64 };
    }

    if (index === seg + 2) {
      const q = lerpPose(ROLE.farRight, ROLE.next, futureT);
      q.y = parallax ? mix(14, 9, futureT) : 0;
      return { ...q, z: 32 };
    }

    if (index < seg - 1) return { ...ROLE.farLeft, z: 5 };
    return { ...ROLE.farRight, z: 5 };
  }

  function copyWeight(index) {
    const { seg, local } = segmentData();
    if (seg === max) return index === max ? 1 : 0;

    if (index === seg) {
      return 1 - smooth(clamp((local - .24) / .46, 0, 1));
    }
    if (index === seg + 1) {
      return smooth(clamp((local - .38) / .42, 0, 1));
    }
    return 0;
  }

  function render() {
    const active = clamp(Math.round(p), 0, max);
    const { seg, local } = segmentData();

    read.textContent = `${p.toFixed(3)} / ${max}`;
    sceneMark.textContent = String(active + 1).padStart(2, '0');
    stage.dataset.segment = String(seg);
    stage.dataset.local = local.toFixed(3);

    vehicles.forEach((el, i) => {
      const q = pose(i);
      el.style.transform = `translate3d(calc(-50% + ${q.x}vw), calc(-50% + ${q.y}px), 0) scale(${q.s})`;
      el.style.opacity = String(q.o);
      el.style.zIndex = String(q.z);

      const w = copyWeight(i);
      copies[i].style.opacity = String(w);
      copies[i].style.transform = `translate3d(0, ${(1 - w) * 20}px, 0)`;
      dots[i].classList.toggle('on', i === active);
    });
  }

  function go(target) {
    cancelAnimationFrame(raf);
    const from = p;
    const to = clamp(target, 0, max);
    const t0 = performance.now();
    const distance = Math.abs(to - from);
    const duration = 720 + Math.min(distance, 1) * 180;

    function step(now) {
      const t = clamp((now - t0) / duration, 0, 1);
      const e = 1 - Math.pow(1 - t, 4);
      p = mix(from, to, e);
      render();
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  function release(event) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    dragLabel.textContent = 'Drag';

    if (event && stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }

    const projected = p + (inertia ? -velocity * .72 : 0);
    go(Math.round(clamp(projected, 0, max)));
  }

  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    cancelAnimationFrame(raf);
    stage.setPointerCapture(event.pointerId);
    dragging = true;
    stage.classList.add('is-dragging');
    dragLabel.textContent = 'Release';
    startX = lastX = event.clientX;
    startP = p;
    lastT = performance.now();
    velocity = 0;
    event.preventDefault();
  });

  stage.addEventListener('pointermove', event => {
    if (!dragging) return;

    // One viewport-ish drag equals one choreography segment.
    const width = Math.max(stage.clientWidth * .62, 420);
    const now = performance.now();
    const dt = Math.max(1, now - lastT);

    p = clamp(startP - (event.clientX - startX) / width, 0, max);
    velocity = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastT = now;
    render();
    event.preventDefault();
  });

  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  window.addEventListener('blur', () => release());

  document.getElementById('prev').addEventListener('click', () => go(Math.round(p) - 1));
  document.getElementById('next').addEventListener('click', () => go(Math.round(p) + 1));
  document.getElementById('reset').addEventListener('click', () => go(0));
  document.getElementById('inertia').addEventListener('click', e => {
    inertia = !inertia;
    e.currentTarget.classList.toggle('on', inertia);
  });
  document.getElementById('parallax').addEventListener('click', e => {
    parallax = !parallax;
    e.currentTarget.classList.toggle('on', parallax);
    render();
  });
  dots.forEach(button => button.addEventListener('click', () => go(Number(button.dataset.go))));

  let loaded = 0;
  let failed = 0;
  const images = [...document.querySelectorAll('.vehicle img')];
  const updateAssets = () => {
    status.textContent = failed
      ? `CHOREO 06 · IMG ERROR ${failed} · ${loaded}/${images.length}`
      : `CHOREO 06 · IMG ${loaded}/${images.length}`;
    status.className = `status ${failed ? 'bad' : loaded === images.length ? 'ok' : ''}`;
  };

  images.forEach(img => {
    if (img.complete) {
      img.naturalWidth ? loaded++ : failed++;
      updateAssets();
    } else {
      img.addEventListener('load', () => { loaded++; updateAssets(); }, { once: true });
      img.addEventListener('error', () => { failed++; updateAssets(); }, { once: true });
    }
  });

  status.textContent = 'CHOREO 06 · checking images';
  render();
})();
