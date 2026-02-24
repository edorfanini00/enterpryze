document.addEventListener('DOMContentLoaded', () => {
    // Basic Button Interactions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.98)');
        btn.addEventListener('mouseup', () => btn.style.transform = '');
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });

    // --- THREE.JS SCENE SETUP ---
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfcfc); // Off-white minimalist background
    //scene.fog = new THREE.FogExp2(0xfcfcfc, 0.005);

    // Isometric Camera Setup (Orthographic)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 100; // Zoomed out to see full operation
    const camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2, frustumSize * aspect / 2,
        frustumSize / 2, frustumSize / - 2,
        1, 1000
    );
    // Isometric angle: 45 deg Y, ~35.264 deg X
    camera.position.set(100, 100, 100);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft base light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(50, 100, 20); // Top-leftish angle
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-20, 50, -20);
    scene.add(pointLight);

    // --- MATERIALS ---
    // Minimalist "white clay" material
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1,
    });

    // Glowing Orange for lines
    const glowOrangeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8c00, // Orange requested
        transparent: true,
        opacity: 0.8
    });

    // Dark grey for icons/floating UI
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
    });

    // --- GROUND & DOT GRID ---
    // Ground Plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const ground = new THREE.Mesh(groundGeometry, baseMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- FACTORY SHAPES (Abstract / Minimalist) ---
    const group = new THREE.Group();
    // Shift slightly right so it's not behind the hero text overlay
    group.position.x = 20;

    function createBuilding(w, h, d, x, z) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, baseMaterial);
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
    }

    function createSilo(r, h, x, z) {
        const geo = new THREE.CylinderGeometry(r, r, h, 32);
        const mesh = new THREE.Mesh(geo, baseMaterial);
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return mesh;
    }

    // Main Factory Complex
    createBuilding(30, 10, 20, 0, 0); // Main floor
    createBuilding(15, 8, 10, -5, 10); // Second tier
    createBuilding(8, 12, 8, 5, -5); // Small tower

    // Silos Cluster
    createSilo(4, 15, -20, -15);
    createSilo(4, 15, -10, -15);
    createSilo(4, 15, -15, -22);

    // Logistics/Warehouse
    createBuilding(25, 6, 15, 25, 20);

    // Trucks (small boxes near warehouse)
    createBuilding(4, 3, 2, 10, 22);
    createBuilding(4, 3, 2, 15, 25);

    scene.add(group);

    // --- GLOWING ORANGE LINES (Circuit/Data flow) ---
    const linesGroup = new THREE.Group();
    linesGroup.position.copy(group.position);
    scene.add(linesGroup);

    // Create a path using Line
    function createCircuitPath(points) {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], 0.1, p[2])));
        const geo = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
        const tube = new THREE.Mesh(geo, glowOrangeMaterial);
        linesGroup.add(tube);
    }

    // Line 1: Main factory to warehouse
    createCircuitPath([[-10, 0, 0], [10, 0, 10], [15, 0, 15], [20, 0, 20]]);
    // Line 2: Silos to factory
    createCircuitPath([[-15, 0, -15], [-15, 0, -5], [-5, 0, 0]]);
    // Line 3: Wandering line
    createCircuitPath([[20, 0, -20], [10, 0, -10], [10, 0, 5], [0, 0, 10]]);

    // --- ANIMATED PULSES ON LINES ---
    const pulses = [];
    function createPulse() {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), glowOrangeMaterial);
        mesh.position.y = 0.2;
        linesGroup.add(mesh);
        pulses.push({
            mesh,
            progress: Math.random(), // Start at random point
            speed: 0.002 + Math.random() * 0.002,
            pathIndex: Math.floor(Math.random() * 3) // Which line to follow
        });
    }
    for (let i = 0; i < 6; i++) createPulse();

    const paths = [
        new THREE.CatmullRomCurve3([[-10, 0, 0], [10, 0, 10], [15, 0, 15], [20, 0, 20]].map(p => new THREE.Vector3(p[0], 0, p[2]))),
        new THREE.CatmullRomCurve3([[-15, 0, -15], [-15, 0, -5], [-5, 0, 0]].map(p => new THREE.Vector3(p[0], 0, p[2]))),
        new THREE.CatmullRomCurve3([[20, 0, -20], [10, 0, -10], [10, 0, 5], [0, 0, 10]].map(p => new THREE.Vector3(p[0], 0, p[2])))
    ];

    // --- FLOATING UI DOTS ---
    const floaters = [];
    function createFloater(x, y, z) {
        // Dark circular base
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16), darkMaterial);
        mesh.rotation.x = Math.PI / 4; // Angle to face camera isometric
        mesh.rotation.z = Math.PI / 4;
        mesh.position.set(x, y, z);

        // Orange inner pulse
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16), glowOrangeMaterial);
        mesh.add(inner);

        group.add(mesh);
        floaters.push({ mesh, inner, baseY: y, phase: Math.random() * Math.PI * 2 });
    }

    createFloater(0, 15, 0); // Over main factory
    createFloater(-15, 20, -15); // Over Silos
    createFloater(25, 12, 20); // Over Warehouse

    // --- MOUSE INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX) * 0.05;
        mouseY = (e.clientY - windowHalfY) * 0.05;
    });

    // --- RENDER LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Ease camera pan toward mouse
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        // Gentle scene rotation based on mouse
        group.position.x += (20 + targetX - group.position.x) * 0.02;
        group.position.z += (targetY - group.position.z) * 0.02;

        // Group floating breath
        group.position.y = Math.sin(time * 0.5) * 1.5;

        // Animate floaters bobbing
        floaters.forEach(f => {
            f.mesh.position.y = f.baseY + Math.sin(time * 2 + f.phase) * 1;
            // Pulse inner orange opacity
            f.inner.material.opacity = 0.5 + Math.sin(time * 4 + f.phase) * 0.5;
        });

        // Animate orange pulses moving along lines
        pulses.forEach(p => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;

            const point = paths[p.pathIndex].getPointAt(p.progress);
            p.mesh.position.copy(point);
            p.mesh.position.y = 0.2; // Keep above ground slightly
        });

        // Slow pulsing of the main orange lines
        glowOrangeMaterial.opacity = 0.6 + Math.sin(time * 3) * 0.4;

        renderer.render(scene, camera);
    }

    animate();

    // --- RESIZE HANDLER ---
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;

        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
    });
});
