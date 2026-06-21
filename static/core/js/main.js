const glow = document.querySelector('.cursor-glow');
const revealItems = document.querySelectorAll('.section-reveal, .scroll-fade');
const stagePanels = document.querySelectorAll('.stage-panel');
const reelColumns = document.querySelectorAll('.reel-column');

document.body.classList.add('reveal-ready');

window.addEventListener('pointermove', (event) => {
  if (!glow) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener('scroll', () => {
  const progress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
  stagePanels.forEach((panel, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    panel.style.setProperty('--mx', `${direction * progress * 90}px`);
    panel.style.setProperty('--my', `${(index + 1) * progress * -70}px`);
  });
  reelColumns.forEach((column, index) => {
    column.style.setProperty('--scroll-push', `${(index + 1) * progress * -26}px`);
  });
}, { passive: true });

document.querySelectorAll('.tilt-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = `translateY(-0.6rem) rotateX(${y}deg) rotateY(${x}deg)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

function makeCodeTexture(THREE, title, lines, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const context = canvas.getContext('2d');

  context.fillStyle = '#07101a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = accent;
  context.fillRect(0, 0, canvas.width, 8);

  context.fillStyle = 'rgba(255,255,255,0.10)';
  context.fillRect(28, 34, 584, 44);
  context.fillStyle = accent;
  context.font = '700 28px Consolas, monospace';
  context.fillText(title, 48, 64);

  context.font = '600 24px Consolas, monospace';
  lines.forEach((line, index) => {
    context.fillStyle = index % 2 === 0 ? '#d8f7e3' : '#82d7ff';
    context.fillText(line, 48, 128 + index * 44);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

async function initHeroScene() {
  const canvas = document.querySelector('#hero-canvas');
  if (!canvas) return;

  try {
    const THREE = await import('/static/core/vendor/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    const workspace = new THREE.Group();
    const floaters = new THREE.Group();
    const colors = [0x55f08e, 0x4aa3ff, 0xff4fa3, 0xffb454];

    camera.position.set(0, 0.45, 8.2);
    scene.add(workspace, floaters);
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));

    const blueLight = new THREE.PointLight(0x4aa3ff, 44, 16);
    blueLight.position.set(3.5, 4.2, 4);
    scene.add(blueLight);

    const greenLight = new THREE.PointLight(0x55f08e, 34, 14);
    greenLight.position.set(-3.5, -1.7, 3.2);
    scene.add(greenLight);

    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x07101a,
      metalness: 0.42,
      roughness: 0.22,
      emissive: 0x071a20,
      emissiveIntensity: 0.7,
    });
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x141b27,
      metalness: 0.65,
      roughness: 0.28,
    });

    const screen = new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.55, 0.16), screenMaterial);
    screen.position.set(0, 0.8, -0.45);
    screen.rotation.x = -0.13;
    workspace.add(screen);

    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(3.45, 2.05),
      new THREE.MeshBasicMaterial({
        map: makeCodeTexture(THREE, 'Django Workspace', [
          'class ReportView(APIView):',
          '    parser_classes = [MultiPartParser]',
          '    return build_pdf(dataset)',
          'status = HTTP_201_CREATED',
        ], '#55f08e'),
      })
    );
    display.position.set(0, 0.8, -0.35);
    display.rotation.x = -0.13;
    workspace.add(display);

    const base = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.22, 2.85), bodyMaterial);
    base.position.set(0, -0.92, 0.85);
    base.rotation.x = 0.32;
    workspace.add(base);

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.035, 0.64),
      new THREE.MeshStandardMaterial({ color: 0x0a111a, metalness: 0.35, roughness: 0.34 })
    );
    trackpad.position.set(0, -0.75, 1.23);
    trackpad.rotation.x = 0.32;
    workspace.add(trackpad);

    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 11; col += 1) {
        const key = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.045, 0.15),
          new THREE.MeshStandardMaterial({
            color: colors[(row + col) % colors.length],
            metalness: 0.2,
            roughness: 0.4,
            emissive: colors[(row + col) % colors.length],
            emissiveIntensity: 0.08,
          })
        );
        key.position.set(-1.4 + col * 0.28, -0.68 + row * 0.006, 0.35 - row * 0.22);
        key.rotation.x = 0.32;
        workspace.add(key);
      }
    }

    const panelData = [
      ['models.py', ['Product', 'Order', 'Wishlist'], '#4aa3ff', [-2.8, 1.55, 0.6], 0.18],
      ['api.py', ['serializer', 'APIView', 'Response'], '#ff4fa3', [2.8, 1.25, 0.75], -0.22],
      ['reports.py', ['Excel', 'Charts', 'PDF'], '#ffb454', [2.25, -1.05, 1.2], 0.28],
    ];

    panelData.forEach(([title, lines, accent, position, rotation]) => {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, 0.95),
        new THREE.MeshBasicMaterial({
          map: makeCodeTexture(THREE, title, lines, accent),
          transparent: true,
        })
      );
      panel.position.set(...position);
      panel.rotation.set(-0.06, rotation, 0.02);
      floaters.add(panel);
    });

    for (let i = 0; i < 38; i += 1) {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.13, 0.13),
        new THREE.MeshStandardMaterial({
          color: colors[i % colors.length],
          metalness: 0.28,
          roughness: 0.22,
          emissive: colors[i % colors.length],
          emissiveIntensity: 0.12,
        })
      );
      block.position.set(
        (Math.random() - 0.5) * 6.4,
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 2.2 + 0.8
      );
      block.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      floaters.add(block);
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(rect.width, rect.height, false);
      renderer.setPixelRatio(dpr);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      const time = Date.now() * 0.001;
      const scrollLift = window.scrollY * 0.00028;
      workspace.rotation.y = Math.sin(time * 0.45) * 0.17;
      workspace.rotation.x = -0.05 + Math.sin(time * 0.55) * 0.035 + scrollLift;
      workspace.position.y = Math.sin(time * 0.8) * 0.08;
      floaters.rotation.y = Math.sin(time * 0.35) * 0.12;
      floaters.position.y = Math.cos(time * 0.7) * 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    document.querySelector('.fallback-workspace')?.setAttribute('hidden', '');
    animate();
  } catch (error) {
    canvas.setAttribute('hidden', '');
  }
}

initHeroScene();
