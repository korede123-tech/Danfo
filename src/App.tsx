import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Screen = "menu" | "game";
type Panel = "garage" | "map" | "missions" | "settings" | null;
type RideStage = "request" | "walking" | "boarding" | "riding" | "arrived" | "exiting";

type Passenger = {
  name: string;
  role: string;
  from: string;
  to: string;
  fare: number;
  distance: number;
  traffic: "LOW" | "MEDIUM" | "HEAVY" | "GRIDLOCK";
  line: string;
  color: string;
};

const passengers: Passenger[] = [
  { name: "Chinedu Okafor", role: "Student", from: "Yaba", to: "Oshodi", fare: 850, distance: 12.4, traffic: "HEAVY", line: "Oga driver, Oshodi direct — no long story!", color: "#18a873" },
  { name: "Funmi Adeyemi", role: "Office worker", from: "Ikeja", to: "Maryland", fare: 600, distance: 8.2, traffic: "MEDIUM", line: "Please, I need to beat the morning traffic.", color: "#a855f7" },
  { name: "Aisha Bello", role: "Nurse", from: "Surulere", to: "Ojuelegba", fare: 500, distance: 5.8, traffic: "LOW", line: "Ojuelegba under bridge, abeg.", color: "#e54d8d" },
  { name: "Tunde Balogun", role: "Trader", from: "Mile 2", to: "CMS", fare: 1100, distance: 15.1, traffic: "GRIDLOCK", line: "CMS! I have market goods, make we move.", color: "#f97316" },
  { name: "Ngozi Eze", role: "Young professional", from: "Berger", to: "Yaba", fare: 950, distance: 13.6, traffic: "HEAVY", line: "Yaba tech side, and take the faster route.", color: "#2563eb" },
];

const cityNames = ["YABA", "OSHODI", "IKEJA", "MARYLAND", "SURULERE", "OJUELEGBA", "CMS", "LEKKI"];
const backgroundAudioUrl = new URL("../Lovn_-_Over_The_Night_feat_Ayanfe.mp3", import.meta.url).href;

function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.28;
    audio.loop = true;
    audio.preload = "auto";

    const startPlayback = () => {
      void audio.play().catch(() => {
        // Browsers may block autoplay until the first user interaction.
      });
    };

    startPlayback();
    const onInteraction = () => {
      startPlayback();
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };

    window.addEventListener("pointerdown", onInteraction, { once: true });
    window.addEventListener("keydown", onInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };
  }, []);

  return <audio ref={audioRef} src={backgroundAudioUrl} autoPlay loop preload="auto" playsInline style={{ display: "none" }} />;
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    play: <path d="m8 5 11 7-11 7V5Z" />,
    garage: <><path d="M3 21V9l9-6 9 6v12" /><path d="M7 21v-8h10v8M7 17h10" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></>,
    flag: <><path d="M5 22V4" /><path d="M5 5h12l-2 4 2 4H5" /></>,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    fuel: <><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5" /><path d="M15 8h2l3 3v7a2 2 0 0 1-4 0v-4" /></>,
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17a2.1 2.1 0 0 0 3 3l8.3-8.3a4 4 0 0 0-.6-5.4Z" />,
    person: <><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M9 8.5h4a2 2 0 0 1 0 4H9h4a2 2 0 0 1 0 4H9M11 6v12" /></>,
    pause: <path d="M8 5v14M16 5v14" />,
    horn: <><path d="M4 10v4h4l7 4V6l-7 4H4Z" /><path d="M18 9a4 4 0 0 1 0 6M20 6a8 8 0 0 1 0 12" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function GameButton({ icon, children, onClick, primary = false, small = false, disabled = false }: { icon?: string; children: React.ReactNode; onClick?: () => void; primary?: boolean; small?: boolean; disabled?: boolean }) {
  return <button className={`game-button ${primary ? "primary" : ""} ${small ? "small" : ""}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={small ? 17 : 21} />}<span>{children}</span>{primary && <Icon name="arrow" size={18} />}</button>;
}

function LagosScene({ speed, steering, riding, stage, passenger, activePassenger, dropoffReady, onParkingChange, onFuelStationChange, onCrash }: { speed: number; steering: number; riding: boolean; stage: RideStage; passenger: Passenger; activePassenger: number; dropoffReady: boolean; onParkingChange: (parked: boolean) => void; onFuelStationChange: (nearStation: boolean) => void; onCrash: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(speed);
  const steeringRef = useRef(steering);
  const stageRef = useRef(stage);
  const passengerRef = useRef(passenger);
  const activePassengerRef = useRef(activePassenger);
  const dropoffReadyRef = useRef(dropoffReady);
  const parkingStateRef = useRef(false);
  const onParkingChangeRef = useRef(onParkingChange);
  const stageStart = useRef(performance.now());
  useEffect(() => { speedRef.current = speed; steeringRef.current = steering; }, [speed, steering]);
  useEffect(() => { stageRef.current = stage; stageStart.current = performance.now(); }, [stage]);
  useEffect(() => { passengerRef.current = passenger; }, [passenger]);
  useEffect(() => { activePassengerRef.current = activePassenger; }, [activePassenger]);
  useEffect(() => { dropoffReadyRef.current = dropoffReady; }, [dropoffReady]);
  useEffect(() => { onParkingChangeRef.current = onParkingChange; }, [onParkingChange]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7ec7e8);
    scene.fog = new THREE.Fog(0xc5d7c1, 34, 115);
    const camera = new THREE.PerspectiveCamera(56, 1, .1, 250);
    camera.position.set(0, 6.1, 12);
    camera.lookAt(0, 1.2, -10);

    const hemi = new THREE.HemisphereLight(0xc9edff, 0x665c36, 2.5);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe6aa, 3.6);
    sun.position.set(-24, 34, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
    scene.add(sun);

    const mat = (color: number, roughness = .78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const box = (w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
      return mesh;
    };
    const addTextSign = (text: string, width: number, height: number, bg = "#096747", fg = "#ffffff") => {
      const c = document.createElement("canvas"); c.width = 512; c.height = 128;
      const x = c.getContext("2d")!;
      x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = fg; x.font = "800 42px Barlow Condensed, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 256, 64);
      const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
      sign.userData.sign = { canvas: c, context: x, bg, fg, text };
      return sign;
    };
    const updateTextSign = (sign: THREE.Mesh, text: string) => {
      const data = sign.userData.sign as { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; bg: string; fg: string; text: string };
      if (data.text === text) return;
      data.text = text;
      data.context.fillStyle = data.bg;
      data.context.fillRect(0, 0, data.canvas.width, data.canvas.height);
      data.context.fillStyle = data.fg;
      const fontSize = Math.max(25, Math.min(42, 560 / Math.max(text.length * .62, 1)));
      data.context.font = `800 ${fontSize}px Barlow Condensed, sans-serif`;
      data.context.textAlign = "center";
      data.context.textBaseline = "middle";
      data.context.fillText(text, 256, 64);
      const material = sign.material as THREE.MeshBasicMaterial;
      if (material.map) material.map.needsUpdate = true;
    };

    // Road, drainage channels, sidewalks and lane markings are physical geometry.
    const road = box(18, .18, 250, mat(0x292d2e, .95), 0, -.12, -85);
    scene.add(road);
    scene.add(box(2.2, .36, 250, mat(0xb8a674), -10.1, .02, -85), box(2.2, .36, 250, mat(0xb8a674), 10.1, .02, -85));
    scene.add(box(.7, .18, 250, mat(0x182321), -8.65, -.05, -85), box(.7, .18, 250, mat(0x182321), 8.65, -.05, -85));
    scene.add(box(.28, .35, 250, mat(0xe0b81d), -8.2, .08, -85), box(.28, .35, 250, mat(0xe0b81d), 8.2, .08, -85));

    const movers: { object: THREE.Object3D; reset: number; rate: number }[] = [];
    const autonomousVehicles: { object: THREE.Object3D; speed: number; reset: number; halfWidth: number; halfLength: number }[] = [];
    const roadHalfWidth = 7.8;
    const playerCollider = { halfWidth: 1.6, halfLength: 2.7 };
    for (let i = 0; i < 34; i++) {
      [-2.75, 2.75].forEach((x, side) => {
        const stripe = box(.16, .025, 4.2, mat(0xe6dfbd), x, .01, 10 - i * 8.2 - side * 3.9);
        scene.add(stripe); movers.push({ object: stripe, reset: -132, rate: 1 });
      });
    }

    const windowMat = new THREE.MeshPhysicalMaterial({ color: 0x163c46, roughness: .2, metalness: .05, transmission: .08 });
    const yellow = mat(0xe5b817, .56);
    const dark = mat(0x161b1a, .75);
    const createWheel = (x: number, z: number) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.52, .52, .34, 18), dark);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .54, z); wheel.castShadow = true;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .36, 16), mat(0x8b8d85, .4, .6));
      hub.rotation.z = Math.PI / 2; wheel.add(hub); return wheel;
    };
    const createDanfo = (paint = yellow, scale = 1) => {
      const g = new THREE.Group();
      g.add(box(3.2, 1.25, 5.25, paint, 0, 1.18, 0));
      g.add(box(3.08, 1.45, 3.9, paint, 0, 2.42, -.35));
      g.add(box(3.18, .16, 4.25, dark, 0, 1.72, -.3));
      g.add(box(3.16, .22, 4.2, paint, 0, 3.2, -.35));
      // Windshield, back glass and individual side windows.
      const windshield = box(2.72, 1.04, .08, windowMat, 0, 2.52, 1.68); windshield.rotation.x = -.12; g.add(windshield);
      g.add(box(2.65, .82, .07, windowMat, 0, 2.5, -2.33));
      [-1.615, 1.615].forEach(x => [-1.45, -.25, .95].forEach(z => g.add(box(.06, .88, .92, windowMat, x, 2.48, z))));
      // Sliding door seam, mirrors, bumpers, lights and Lagos plate.
      g.add(box(.035, 1.65, 1.12, dark, -1.64, 1.85, .85));
      g.add(box(3.35, .2, .22, dark, 0, .77, 2.66), box(3.35, .2, .22, dark, 0, .77, -2.66));
      [-1.13, 1.13].forEach(x => {
        g.add(box(.38, .28, .08, mat(0xffe6a1, .25), x, 1.24, 2.79));
        const mirror = box(.28, .35, .12, dark, x * 1.53, 2.48, 1.45); g.add(mirror);
      });
      const plate = addTextSign("LAG 406 DF", .92, .24, "#eee9ce", "#17201d"); plate.position.set(0, .92, 2.79); g.add(plate);
      // Interior seats visible through glazing.
      for (let z = -.95; z <= .65; z += .8) {
        g.add(box(2.15, .22, .45, mat(0x69432c), 0, 1.65, z));
        g.add(box(2.15, .72, .16, mat(0x765039), 0, 1.92, z - .2));
      }
      const wheels = [createWheel(-1.55, 1.65), createWheel(1.55, 1.65), createWheel(-1.55, -1.65), createWheel(1.55, -1.65)];
      wheels.forEach(w => g.add(w)); g.userData.wheels = wheels;
      g.scale.setScalar(scale); return g;
    };

    const playerBus = createDanfo();
    playerBus.position.set(0, 0, 4.5);
    playerBus.rotation.y = Math.PI;
    scene.add(playerBus);

    const createPerson = (shirt: number, trousers = 0x253849) => {
      const g = new THREE.Group();
      const skin = mat(0x6b3e27, .8);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.23, 14, 10), skin); head.position.y = 1.68; head.castShadow = true; g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(.235, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x161412)); hair.position.y = 1.76; g.add(hair);
      g.add(box(.58, .72, .32, mat(shirt), 0, 1.16, 0));
      const armL = box(.14, .68, .14, skin, -.39, 1.18, 0), armR = box(.14, .68, .14, skin, .39, 1.18, 0);
      const legL = box(.18, .72, .2, mat(trousers), -.17, .43, 0), legR = box(.18, .72, .2, mat(trousers), .17, .43, 0);
      g.add(armL, armR, legL, legR); g.userData.limbs = [armL, armR, legL, legR]; return g;
    };

    const passenger3ds = passengers.map((passenger, index) => {
      const person = createPerson(Number.parseInt(passenger.color.slice(1), 16));
      person.position.set(-7.6, .18, 4 - index * .55);
      person.rotation.y = Math.PI / 2;
      person.visible = false;
      scene.add(person);
      return person;
    });

    const roadside = new THREE.Group(); scene.add(roadside);
    const fuelStation = new THREE.Group();
    fuelStation.position.set(12.2, 0, -28);
    fuelStation.add(box(2.4, 3.1, 2.4, mat(0x2c7a5b), 0, 1.55, 0));
    fuelStation.add(box(2.7, 0.9, 2.7, mat(0xf6c453), 0, 3.3, 0));
    fuelStation.add(box(0.9, 0.9, 0.25, mat(0x1a1f1b), 0, 3.3, 1.42));
    fuelStation.add(box(0.25, 1.7, 0.25, mat(0x0d1312), -1.1, 2.1, 0.85));
    fuelStation.add(box(0.25, 1.7, 0.25, mat(0x0d1312), 1.1, 2.1, 0.85));
    fuelStation.add(box(0.5, 1.15, 0.4, mat(0xdef1ff), 0, 2.1, 0.9));
    const stationPump = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 18), mat(0xe3e6de));
    stationPump.position.set(-0.9, 1.1, 1.35);
    fuelStation.add(stationPump);
    const stationPumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.18, 18), mat(0xefc828));
    stationPumpTop.position.set(-0.9, 2.0, 1.35);
    fuelStation.add(stationPumpTop);
    const stationText = addTextSign("FUEL", 1.2, 0.38, "#0b1613", "#f4d66c");
    stationText.position.set(0, 4.05, 0);
    fuelStation.add(stationText);
    roadside.add(fuelStation);
    movers.push({ object: fuelStation, reset: -205, rate: 1 });

    const buildingColors = [0xd18a52, 0xc6b177, 0x88a6a1, 0xd0c4a4, 0x798f83, 0xb76f4b];
    for (let i = 0; i < 32; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -5 - i * 6.8;
      const height = 4 + ((i * 17) % 8);
      const width = 4.5 + (i % 3);
      const building = new THREE.Group();
      const shell = box(width, height, 5, mat(buildingColors[i % buildingColors.length]), side * (13 + (i % 3) * 1.2), height / 2, z);
      building.add(shell);
      for (let y = 1.3; y < height - .5; y += 1.65) {
        for (let x = -width / 2 + .7; x < width / 2; x += 1.2) {
          const win = box(.55, .72, .05, mat(0x294c51, .35), side * (13 + (i % 3) * 1.2) + x, y, z + 2.53);
          building.add(win);
        }
      }
      roadside.add(building); movers.push({ object: building, reset: -215, rate: 1 });
    }

    // Lagos roadside stalls, umbrellas, palms, vendors and people waiting for buses.
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1;
      const z = -3 - i * 11;
      const stall = new THREE.Group(); stall.position.set(side * 10.4, 0, z);
      stall.add(box(2.2, .95, 1.4, mat(i % 3 === 0 ? 0x188252 : 0xc3482d), 0, .55, 0));
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.7, .65, 4), mat(i % 2 ? 0xe6b81b : 0x17754f));
      canopy.position.y = 2.1; canopy.rotation.y = Math.PI / 4; stall.add(canopy);
      roadside.add(stall); movers.push({ object: stall, reset: -205, rate: 1 });
      if (i % 3 === 0) {
        const palm = new THREE.Group(); palm.position.set(side * 12, 0, z - 4);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16, .3, 4.8, 8), mat(0x775433)); trunk.position.y = 2.4; palm.add(trunk);
        for (let a = 0; a < 7; a++) {
          const leaf = box(.26, .08, 2.5, mat(0x187448), 0, 4.85, 0); leaf.rotation.y = a * Math.PI / 3.5; leaf.rotation.x = -.24; leaf.translateZ(1); palm.add(leaf);
        }
        roadside.add(palm); movers.push({ object: palm, reset: -205, rate: 1 });
      }
    }

    // Moving private cars, BRT bus, keke and okada are separate 3D vehicles.
    const traffic: THREE.Group[] = [];
    const laneCenters = [-5.2, 0, 5.2];
    laneCenters.forEach((laneX, laneIndex) => {
      [-12, -55, -98].forEach((z, arrowIndex) => {
        const arrow = new THREE.Group();
        const arrowMaterial = mat(0xe6dfbd);
        arrow.add(box(.18, .035, 1.25, arrowMaterial, 0, 0, .55));
        const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(.48, .9, 3), arrowMaterial);
        arrowHead.rotation.x = -Math.PI / 2;
        arrowHead.position.set(0, .02, -.35);
        arrow.add(arrowHead);
        arrow.position.set(laneX, .025, z - laneIndex * 4);
        scene.add(arrow);
        movers.push({object:arrow,reset:-150-arrowIndex*18-laneIndex*5,rate:1});
      });
    });
    const createCar = (color: number) => {
      const g = new THREE.Group();
      const paint = mat(color, .38, .2);
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(.72, 2.6, 8, 18), paint);
      body.rotation.x = Math.PI / 2;
      body.scale.x = 1.46;
      body.position.y = .82;
      body.castShadow = true;
      g.add(body);
      g.add(box(2.08, .28, 3.35, paint, 0, .48, 0));

      const cabinGeometry = new THREE.BufferGeometry();
      cabinGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
        -.91,0,-1.05, .91,0,-1.05, .91,0,1.05, -.91,0,1.05,
        -.7,.72,-.7, .7,.72,-.7, .7,.72,.62, -.7,.72,.62,
      ], 3));
      cabinGeometry.setIndex([
        0,1,5,0,5,4, 1,2,6,1,6,5, 2,3,7,2,7,6, 3,0,4,3,4,7,
        4,5,6,4,6,7,
      ]);
      cabinGeometry.computeVertexNormals();
      const cabin = new THREE.Mesh(cabinGeometry, windowMat);
      cabin.position.y = 1.08;
      cabin.castShadow = true;
      g.add(cabin);
      g.add(box(1.48,.12,1.38,paint,0,1.84,-.05));
      [-.92,.92].forEach(x => {
        g.add(box(.08,.72,.11,dark,x,1.42,-.05));
        g.add(box(.18,.13,.3,dark,x*1.2,1.42,.52));
      });
      const headlightMaterial = new THREE.MeshStandardMaterial({color:0xffedb0,emissive:0xffd75e,emissiveIntensity:1.4});
      const tailMaterial = new THREE.MeshStandardMaterial({color:0xc62f26,emissive:0x7d0905,emissiveIntensity:1});
      [-.68,.68].forEach(x => {
        g.add(box(.42,.23,.08,headlightMaterial,x,.78,2.03));
        g.add(box(.34,.22,.08,tailMaterial,x,.78,-2.03));
      });
      g.add(box(.72,.18,.08,dark,0,.58,2.08));
      g.add(box(2.14,.14,.16,mat(0x777b7a,.3,.65),0,.36,2.08));
      g.add(box(2.14,.14,.16,mat(0x777b7a,.3,.65),0,.36,-2.08));
      const wheels: THREE.Mesh[] = [];
      [-.98,.98].forEach(x => [-1.28,1.28].forEach(z => { const w=createWheel(x,z); w.scale.setScalar(.7); wheels.push(w); g.add(w); }));
      g.userData.wheels = wheels;
      return g;
    };
    const brt = createDanfo(mat(0x1b8458), 1.15); brt.position.set(laneCenters[0], 0, -68); brt.rotation.y=Math.PI; scene.add(brt); traffic.push(brt); movers.push({object:brt,reset:-190,rate:.45});autonomousVehicles.push({object:brt,speed:7,reset:-190,halfWidth:1.85,halfLength:3.1});
    [0xc64a39,0xe7dfcb,0x315d9b,0x222a28].forEach((c,i) => {
      const lane=laneCenters[i%laneCenters.length], reset=-125-i*22;
      const car=createCar(c);car.position.set(lane,0,-22-i*32);car.rotation.y=Math.PI;scene.add(car);traffic.push(car);movers.push({object:car,reset,rate:.5+i*.08});autonomousVehicles.push({object:car,speed:9+i*1.4,reset,halfWidth:1.15,halfLength:2.1});
    });
    const keke = new THREE.Group();
    keke.add(box(1.7,.85,2.4,mat(0xe1b619),0,.75,0),box(1.55,1.1,1.5,windowMat,0,1.45,-.25),box(1.75,.14,1.7,dark,0,2.03,-.25));
    const kw1=createWheel(0,1),kw2=createWheel(-.85,-.75),kw3=createWheel(.85,-.75);[kw1,kw2,kw3].forEach(w=>{w.scale.setScalar(.62);keke.add(w)});keke.userData.wheels=[kw1,kw2,kw3];keke.position.set(laneCenters[2],0,-54);keke.rotation.y=Math.PI;scene.add(keke);movers.push({object:keke,reset:-175,rate:.76});autonomousVehicles.push({object:keke,speed:11.5,reset:-175,halfWidth:.95,halfLength:1.3});
    const okada = new THREE.Group(); okada.add(box(.35,.45,1.5,mat(0xc62f26),0,.65,0));
    [-.64,.64].forEach(z=>{const w=new THREE.Mesh(new THREE.TorusGeometry(.36,.09,8,16),dark);w.position.set(0,.42,z);okada.add(w)});okada.position.set(laneCenters[1],0,-88);okada.rotation.y=Math.PI;scene.add(okada);movers.push({object:okada,reset:-205,rate:1.15});autonomousVehicles.push({object:okada,speed:14,reset:-205,halfWidth:.45,halfLength:.85});

    // Overhead Lagos route sign and a complete roadside pickup area.
    const signGroup = new THREE.Group(); signGroup.position.set(0, 0, -34);
    signGroup.add(box(.18, 6, .18, mat(0x777b72), -6.4, 3, 0), box(.18, 6, .18, mat(0x777b72), 6.4, 3, 0));
    const routeSign=addTextSign("OSHODI  8 km   ↑    IKEJA  12 km   ↑",11.5,2);routeSign.position.y=5.4;signGroup.add(routeSign);
    scene.add(signGroup);movers.push({object:signGroup,reset:-175,rate:1});

    const busStopArea = new THREE.Group();
    busStopArea.position.set(0, 0, 2);
    // A paved lay-by lets the danfo pull out of traffic and stop beside the queue.
    busStopArea.add(box(4.2, .12, 15, mat(0x3a3d3b, .94), -7.2, .02, 0));
    busStopArea.add(box(.22, .24, 15, mat(0xe2bb1d), -5.35, .13, 0));
    const bayLabel = addTextSign("BUS STOP", 4.4, .8, "#3a3d3b", "#e2bb1d");
    bayLabel.rotation.x = -Math.PI / 2;
    bayLabel.rotation.z = Math.PI / 2;
    bayLabel.position.set(-6.9, .09, -3.3);
    busStopArea.add(bayLabel);
    const dropZone = new THREE.Group();
    dropZone.add(box(.16, .055, 11.5, mat(0xf2ca25), -5.35, .08, 0));
    dropZone.add(box(.16, .055, 11.5, mat(0xf2ca25), -8.95, .08, 0));
    dropZone.add(box(3.75, .055, .16, mat(0xf2ca25), -7.15, .08, 5.7));
    dropZone.add(box(3.75, .055, .16, mat(0xf2ca25), -7.15, .08, -5.7));
    const dropLabel = addTextSign("PARK HERE • DROP OFF", 4.8, .72, "#e5bb1b", "#17201d");
    dropLabel.rotation.x = -Math.PI / 2;
    dropLabel.rotation.z = Math.PI / 2;
    dropLabel.position.set(-7.05, .1, 0);
    dropZone.add(dropLabel);
    dropZone.visible = false;
    scene.add(dropZone);

    // Shelter with transparent back panels, corrugated roof and a real bench.
    const shelter = new THREE.Group();
    shelter.position.set(-10.15, 0, -1.1);
    shelter.add(box(4.7, .18, 2.5, mat(0xe2b919, .58, .12), 0, 3.05, 0));
    [-2.05, 2.05].forEach(x => {
      shelter.add(box(.16, 3, .16, mat(0x26312d, .45, .5), x, 1.52, -.95));
      shelter.add(box(.16, 3, .16, mat(0x26312d, .45, .5), x, 1.52, .95));
    });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x6b9ca1, transparent: true, opacity: .34, roughness: .16, side: THREE.DoubleSide });
    shelter.add(box(4.1, 2.35, .06, glass, 0, 1.62, 1.02));
    shelter.add(box(.1, 2.35, 1.8, glass, -2.02, 1.62, .05));
    shelter.add(box(3.35, .22, .65, mat(0x315348), 0, .78, .5));
    shelter.add(box(.18, .72, .55, mat(0x26312d), -1.35, .38, .5));
    shelter.add(box(.18, .72, .55, mat(0x26312d), 1.35, .38, .5));
    const stopName = addTextSign("YABA BUS STOP", 4.05, .72, "#e5bb1b", "#17201d");
    stopName.position.set(0, 2.62, 1.08);
    shelter.add(stopName);
    busStopArea.add(shelter);

    const stopPole = new THREE.Group();
    stopPole.position.set(-7.75, 0, 4.6);
    stopPole.add(box(.14, 3.5, .14, mat(0x65706b, .4, .55), 0, 1.75, 0));
    const stopRoundel = addTextSign("DANFO\nSTOP", 1.25, 1.25, "#14744e", "#ffffff");
    stopRoundel.position.y = 3.25;
    stopPole.add(stopRoundel);
    busStopArea.add(stopPole);

    // A varied passenger queue remains physically present at the stop.
    const waitingColors = [0x325fa1, 0xe07828, 0x9c46a7, 0x16805a, 0xd2475c, 0xe0b91d];
    const waitingPeople: THREE.Group[] = [];
    waitingColors.forEach((color, i) => {
      const waitingPerson = createPerson(color, i % 2 ? 0x4b382c : 0x263b50);
      waitingPerson.scale.setScalar(.78 + (i % 3) * .06);
      waitingPerson.position.set(-10.35 - (i % 2) * .5, .15, 3.4 - i * 1.15);
      waitingPerson.rotation.y = Math.PI / 2 + (i % 2 ? .18 : -.12);
      waitingPerson.userData.queueOffset = i;
      waitingPeople.push(waitingPerson);
      busStopArea.add(waitingPerson);
    });
    const toutBoard = addTextSign("OSHODI!  IKEJA!  LAST BUS!", 3.7, .55, "#17221e", "#f0c421");
    toutBoard.position.set(-8.5, 2.9, -3.7);
    toutBoard.rotation.y = Math.PI / 2;
    busStopArea.add(toutBoard);
    scene.add(busStopArea);

    // Oshodi gets a denser under-bridge environment with weathered market infrastructure.
    const oshodiDetails = new THREE.Group();
    oshodiDetails.visible = false;
    const stainedConcrete = mat(0x5f625d, .98);
    const rustedMetal = mat(0x6f4934, .92, .18);
    const dirtyWater = new THREE.MeshPhysicalMaterial({color:0x354b43,roughness:.22,metalness:.08,transparent:true,opacity:.72});
    const flyover = box(23, 1.05, 20, stainedConcrete, 0, 7.4, -18);
    oshodiDetails.add(flyover);
    [-7.35, 7.35].forEach(x => {
      [-23, -13].forEach(z => {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(.72, .92, 7.2, 12), stainedConcrete);
        column.position.set(x, 3.6, z);
        column.castShadow = true;
        oshodiDetails.add(column);
      });
    });
    const underBridgeSign = addTextSign("OSHODI UNDER BRIDGE", 7.2, 1.1, "#36594c", "#f3d458");
    underBridgeSign.position.set(0, 6.72, -7.95);
    oshodiDetails.add(underBridgeSign);

    // Layered corrugated kiosks and faded shop fronts make the stop feel busier without pedestrians.
    const kioskColors = [0x7f4b35, 0x385d50, 0x9a792d, 0x565b57];
    [-1, 1].forEach(side => {
      for (let i = 0; i < 5; i++) {
        const kiosk = new THREE.Group();
        kiosk.position.set(side * (10.1 + (i % 2) * .4), 0, -4 - i * 5.1);
        kiosk.add(box(3.2, 2.6, 3.4, mat(kioskColors[i % kioskColors.length], .95), 0, 1.3, 0));
        const shutter = box(2.35, 1.75, .08, rustedMetal, 0, 1.15, side < 0 ? 1.74 : -1.74);
        kiosk.add(shutter);
        const awning = box(3.65, .12, 2.1, mat(i % 2 ? 0x315c4d : 0x9b6d25), 0, 2.65, side < 0 ? .7 : -.7);
        awning.rotation.x = side * .12;
        kiosk.add(awning);
        oshodiDetails.add(kiosk);
      }
    });

    // Potholes, muddy puddles and scattered refuse stay near lane edges so traffic remains passable.
    [[-5.1,-8,.52],[4.9,-17,.68],[-2.2,-27,.46],[5.4,-35,.58]].forEach(([x,z,radius]) => {
      const pothole = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .82, .045, 18), mat(0x151b19, 1));
      pothole.position.set(x, .005, z);
      oshodiDetails.add(pothole);
    });
    [[-6.7,-4,1.15,.42],[6.5,-25,.9,.35],[-6.4,-33,1.35,.38]].forEach(([x,z,sx,sz]) => {
      const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 24), dirtyWater);
      puddle.rotation.x = -Math.PI / 2;
      puddle.scale.set(sx, sz, 1);
      puddle.position.set(x, .025, z);
      oshodiDetails.add(puddle);
    });
    const refuseColors = [0x3b4238,0x766643,0x274f48,0x8a6335];
    for (let i = 0; i < 22; i++) {
      const side = i % 2 ? 1 : -1;
      const piece = i % 3 === 0
        ? new THREE.Mesh(new THREE.SphereGeometry(.16 + (i % 4) * .045, 7, 5), mat(refuseColors[i % refuseColors.length], 1))
        : box(.2 + (i % 3) * .09, .08, .28, mat(refuseColors[i % refuseColors.length], 1));
      piece.position.set(side * (7.65 + (i % 4) * .36), .09, 2 - i * 1.75);
      piece.rotation.y = i * .73;
      oshodiDetails.add(piece);
    }
    scene.add(oshodiDetails);

    let raf = 0;
    let last = performance.now();
    const resize = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05);
      last = now;
      const travel = speedRef.current * dt * .22;
      movers.forEach(m => {
        m.object.position.z += travel * m.rate;
        if (m.object.position.z > 22) m.object.position.z = m.reset;
      });
      [...autonomousVehicles].sort((a,b) => b.object.position.z - a.object.position.z).forEach(vehicle => {
        const maxRoadX = roadHalfWidth - vehicle.halfWidth;
        vehicle.object.position.x = THREE.MathUtils.clamp(vehicle.object.position.x, -maxRoadX, maxRoadX);
        (vehicle.object.userData.wheels as THREE.Mesh[] | undefined)?.forEach(wheel => wheel.rotation.x += vehicle.speed * dt * .4);
        const desiredZ = vehicle.object.position.z - vehicle.speed * dt;
        if (desiredZ < vehicle.reset) {
          vehicle.object.position.z = 24;
          return;
        }
        let collisionLimit = Number.NEGATIVE_INFINITY;
        const obstacles = [
          { object: playerBus, halfWidth: playerCollider.halfWidth, halfLength: playerCollider.halfLength },
          ...autonomousVehicles.filter(other => other !== vehicle),
        ];
        obstacles.forEach(obstacle => {
          const overlapsLane = Math.abs(vehicle.object.position.x - obstacle.object.position.x) < vehicle.halfWidth + obstacle.halfWidth + .15;
          const isAhead = obstacle.object.position.z < vehicle.object.position.z;
          if (overlapsLane && isAhead) collisionLimit = Math.max(collisionLimit, obstacle.object.position.z + vehicle.halfLength + obstacle.halfLength + 3.2);
        });
        vehicle.object.position.z = Math.max(desiredZ, collisionLimit);
      });
      const proposedPlayerX = THREE.MathUtils.clamp(playerBus.position.x + steeringRef.current * dt * 4.4, -5.5, 5.5);
      const steeringBlocked = autonomousVehicles.some(vehicle => {
        const overlapsWidth = Math.abs(proposedPlayerX - vehicle.object.position.x) < playerCollider.halfWidth + vehicle.halfWidth + .1;
        const overlapsLength = Math.abs(playerBus.position.z - vehicle.object.position.z) < playerCollider.halfLength + vehicle.halfLength + .2;
        return overlapsWidth && overlapsLength;
      });
      if (!steeringBlocked) playerBus.position.x = proposedPlayerX;
      const collision = autonomousVehicles.some(vehicle => {
        const overlapX = Math.abs(playerBus.position.x - vehicle.object.position.x) < playerCollider.halfWidth + vehicle.halfWidth + .35;
        const overlapZ = Math.abs(playerBus.position.z - vehicle.object.position.z) < playerCollider.halfLength + vehicle.halfLength + .55;
        return overlapX && overlapZ;
      });
      if (collision) {
        onCrash();
        return;
      }
      playerBus.rotation.z = THREE.MathUtils.lerp(playerBus.rotation.z, -steeringRef.current * .045, .1);
      playerBus.rotation.y = Math.PI + steeringRef.current * .035;
      playerBus.position.y = speedRef.current > 3 ? Math.sin(now * .018) * .018 : 0;
      (playerBus.userData.wheels as THREE.Mesh[]).forEach(w => w.rotation.x -= speedRef.current * dt * .12);
      traffic.forEach(vehicle => {
        (vehicle.userData.wheels as THREE.Mesh[] | undefined)?.forEach(w => w.rotation.x -= speedRef.current * dt * .08);
      });
      // A complete 3D passenger approach, boarding and exit sequence.
      const activeStage = stageRef.current;
      const elapsed = (now - stageStart.current) / 1000;
      const activeDestination = passengerRef.current.to.trim().toUpperCase() || "NEXT DESTINATION";
      const isAtDestination = dropoffReadyRef.current || activeStage === "arrived" || activeStage === "exiting";
      const isOshodi = activeDestination.includes("OSHODI") && isAtDestination;
      oshodiDetails.visible = isOshodi;
      busStopArea.visible = isAtDestination;
      dropZone.visible = dropoffReadyRef.current;
      const parkedInBay = dropoffReadyRef.current && playerBus.position.x <= -4.65 && speedRef.current < 1;
      if (parkedInBay !== parkingStateRef.current) {
        parkingStateRef.current = parkedInBay;
        onParkingChangeRef.current(parkedInBay);
      }
      (scene.background as THREE.Color).setHex(isOshodi ? 0x929d95 : 0x7ec7e8);
      scene.fog.color.setHex(isOshodi ? 0x7d8178 : 0xc5d7c1);
      scene.fog.near = isOshodi ? 25 : 34;
      sun.intensity = isOshodi ? 2.25 : 3.6;
      hemi.intensity = isOshodi ? 1.65 : 2.5;
      updateTextSign(stopName, `${activeDestination} BUS STOP`);
      updateTextSign(routeSign, `NEXT STOP  ${activeDestination}  ↑`);
      waitingPeople.forEach(person => { person.visible = activeStage === "request"; });
      passenger3ds.forEach((person, passengerIndex) => {
        const delay = passengerIndex * .2;
        const limbs = person.userData.limbs as THREE.Mesh[];
        const isBoarding = activeStage === "walking" || activeStage === "boarding";
        const isActiveDropoff = (activeStage === "arrived" || activeStage === "exiting") && passengerIndex === activePassengerRef.current;
        person.visible = isBoarding || isActiveDropoff;
        if (person.visible) limbs.forEach((limb, limbIndex) => limb.rotation.x = Math.sin(now * .009 + limbIndex * Math.PI) * .55);
        if (activeStage === "walking") {
          const p = THREE.MathUtils.clamp((elapsed - delay) / 2.3, 0, 1);
          person.position.set(THREE.MathUtils.lerp(-7.6, playerBus.position.x - 1.8, p), .18, 4 - passengerIndex * .55 * (1 - p));
          person.scale.setScalar(1);
          person.rotation.y = Math.PI / 2;
        } else if (activeStage === "boarding") {
          const p = THREE.MathUtils.clamp((elapsed - delay) / 2.2, 0, 1);
          person.position.set(THREE.MathUtils.lerp(playerBus.position.x - 1.8, playerBus.position.x - 1.1, p), .18 + p * .6, 4);
          person.scale.setScalar(1 - p * .55);
          person.visible = p < 1;
        } else if (activeStage === "arrived" || activeStage === "exiting") {
          const p = THREE.MathUtils.clamp((elapsed - delay) / 2.4, 0, 1);
          person.position.set(THREE.MathUtils.lerp(playerBus.position.x - 1.1, playerBus.position.x - 7, p), .18, 4 - passengerIndex * .5);
          person.scale.setScalar(.6 + p * .4);
          person.rotation.y = -Math.PI / 2;
        }
        if (riding) person.visible = false;
      });
      const fuelStationDistance = Math.hypot(playerBus.position.x - fuelStation.position.x, playerBus.position.z - fuelStation.position.z);
      onFuelStationChange(fuelStationDistance < 6);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerBus.position.x * .38, .06);
      camera.lookAt(playerBus.position.x * .22, 1.4, -9);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("resize", resize);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => { if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose(); material.dispose(); });
        }
      });
      renderer.dispose();
    };
  }, []);

  return <div className="scene"><canvas ref={canvasRef} /></div>;
}

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: string; tone?: string }) {
  return <div className="top-stat"><span className={`stat-icon ${tone || ""}`}><Icon name={icon} size={18}/></span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

function PanelModal({ panel, close, coins }: { panel: Exclude<Panel, null>; close: () => void; coins: number }) {
  const content = {
    garage: { title: "Danfo Garage", kicker: "MUSHIN MOTOR WORKS", icon: "garage" },
    map: { title: "Lagos Route Map", kicker: "LIVE TRAFFIC NETWORK", icon: "map" },
    missions: { title: "Shift Missions", kicker: "TODAY'S HUSTLE", icon: "flag" },
    settings: { title: "Game Settings", kicker: "CONTROL YOUR EXPERIENCE", icon: "gear" },
  }[panel];
  return <div className="modal-backdrop"><section className="modal">
    <div className="modal-head"><div className="modal-title"><span className="modal-icon"><Icon name={content.icon}/></span><div><small>{content.kicker}</small><h2>{content.title}</h2></div></div><button className="icon-button" onClick={close} aria-label="Close"><Icon name="close"/></button></div>
    {panel === "garage" && <div className="garage-layout"><div className="garage-bus"><div className="mini-bus"><span>THE HUSTLER</span><i /><b>LAG 406 DF</b></div><div className="garage-caption">1998 VOLKSWAGEN DANFO • CONDITION 86%</div></div><div className="upgrade-list">
      {[["ENGINE","Level 2","+10% acceleration","2,500"],["BRAKES","Level 1","+12% stopping power","1,800"],["CAPACITY","8 seats","Add 2 passenger seats","3,200"],["DURABILITY","Level 2","+15% impact resistance","2,750"]].map((u,i)=><div className="upgrade" key={u[0]}><span className="upgrade-icon"><Icon name={i===1?"gear":i===2?"person":"wrench"}/></span><div><strong>{u[0]} <em>{u[1]}</em></strong><small>{u[2]}</small></div><button>{u[3]} <span>COINS</span></button></div>)}
    </div></div>}
    {panel === "map" && <div className="lagos-map"><div className="lagoon" /><div className="map-road r1"/><div className="map-road r2"/><div className="map-road r3"/><div className="map-road r4"/>{cityNames.map((n,i)=><div className={`map-pin p${i+1}`} key={n}><i />{n}</div>)}<div className="route-line"/><div className="map-legend"><span><i className="green"/>FLOWING</span><span><i className="amber"/>BUSY</span><span><i className="red"/>GRIDLOCK</span></div></div>}
    {panel === "missions" && <div className="mission-list">{[
      ["YABA HUSTLE","Take 5 passengers from Yaba","2 / 5","750 COINS"],
      ["CLEAN DRIVING","Complete 3 trips without damage","1 / 3","1,000 COINS"],
      ["FULL DANFO","Fill every available seat","6 / 8","500 COINS"],
      ["AREA BOY","Visit 4 different bus stops","3 / 4","850 COINS"],
    ].map((m,i)=><div className="mission" key={m[0]}><span>0{i+1}</span><div><strong>{m[0]}</strong><small>{m[1]}</small><div className="progress"><i style={{width:`${[40,33,75,75][i]}%`}}/></div></div><b>{m[2]}<em>{m[3]}</em></b></div>)}</div>}
    {panel === "settings" && <div className="settings-list">{["Traffic ambience","Danfo horn & engine","Passenger dialogue","Camera shake"].map((s,i)=><label key={s}><span>{s}<small>{i===3?"Low intensity":"Enabled"}</small></span><input type="checkbox" defaultChecked={i!==3}/><i/></label>)}</div>}
    <div className="modal-foot"><span><Icon name="coin" size={17}/> {coins.toLocaleString()} COINS</span><GameButton onClick={close} primary small>BACK TO {panel === "garage" ? "MENU" : "GAME"}</GameButton></div>
  </section></div>;
}

function StartScreen({ start, openPanel }: { start: () => void; openPanel: (p: Panel) => void }) {
  return <main className="start-screen">
    <div className="menu-sky"><div className="sun"/><div className="city-silhouette"/><div className="third-mainland"><i/><i/><i/><i/><i/></div></div>
    <div className="menu-danfo"><div className="menu-roof">EKO FOR SHOW</div><div className="menu-window"><i/><i/><i/></div><div className="menu-stripe"/><b>YABA • OJUELEGBA • OSHODI</b><span className="menu-wheel mw1"/><span className="menu-wheel mw2"/></div>
    <div className="menu-content"><div className="brand-mark"><span>THE STREETS OF</span><b>LAGOS</b></div><div className="game-logo"><span>DANFO</span><strong>LAGOS RUSH</strong><i>THE CITY NEVER WAITS</i></div><p>Every passenger has a destination.<br/>Every trip makes you money.</p>
      <div className="menu-actions"><GameButton icon="play" primary onClick={start}>START SHIFT</GameButton><div className="menu-grid"><GameButton icon="garage" onClick={()=>openPanel("garage")}>GARAGE</GameButton><GameButton icon="map" onClick={()=>openPanel("map")}>MAP</GameButton><GameButton icon="flag" onClick={()=>openPanel("missions")}>MISSIONS</GameButton><GameButton icon="gear" onClick={()=>openPanel("settings")}>SETTINGS</GameButton></div></div>
      <div className="menu-profile"><span className="avatar">KB</span><div><small>DRIVER PROFILE</small><strong>KOLA BALOGUN <em>LV. 3</em></strong></div></div>
    </div><div className="menu-bottom"><span><i/> LAGOS, NIGERIA</span><b>SHIFT 07:24 • MORNING RUSH</b></div>
  </main>;
}

export default function App() {
  const [screen,setScreen]=useState<Screen>("menu");
  const [panel,setPanel]=useState<Panel>(null);
  const [stage,setStage]=useState<RideStage>("request");
  const [destinations,setDestinations]=useState(()=>passengers.map(passenger=>passenger.to));
  const [activeDropoff,setActiveDropoff]=useState(0);
  const [speed,setSpeed]=useState(0);
  const [steering,setSteering]=useState(0);
  const [coins,setCoins]=useState(12450);
  const totalDistance=passengers.reduce((sum,passenger)=>sum+passenger.distance,0);
  const totalFare=passengers.reduce((sum,passenger)=>sum+passenger.fare,0);
  const routeCompletionBonus=1500;
  const [distance,setDistance]=useState(passengers[0].distance);
  const [fuel,setFuel]=useState(78);
  const [fuelStationNearby,setFuelStationNearby]=useState(false);
  const [toast,setToast]=useState("");
  const [dropoffReady,setDropoffReady]=useState(false);
  const [parkedAtStop,setParkedAtStop]=useState(false);
  const [routeComplete,setRouteComplete]=useState(false);
  const [gameOver,setGameOver]=useState(false);
  const keys=useRef<Record<string,boolean>>({});
  const passenger={...passengers[activeDropoff],to:destinations[activeDropoff] || passengers[activeDropoff].to};
  const allDestinationsSet=destinations.every(destination=>destination.trim());

  const accept=useCallback(()=>{
    if(!destinations.every(destination=>destination.trim()))return;
    setStage("walking");setToast(`${passengers.length} PASSENGERS ACCEPTED • WALKING TO DANFO`);
    setTimeout(()=>setStage("boarding"),3200);
    setTimeout(()=>{setStage("riding");setToast("ALL PASSENGERS ON BOARD • FOLLOW THE MULTI-STOP ROUTE");},6400);
  },[destinations]);

  const handleCrash=useCallback(()=>{
    if(gameOver) return;
    setGameOver(true);
    setSpeed(0);
    setSteering(0);
    setToast("CRASH! • GAME OVER");
  },[gameOver]);

  const buyFuel=useCallback(()=>{
    if(!fuelStationNearby){
      setToast("DRIVE UP TO THE FUEL STATION FIRST");
      return;
    }
    if(fuel >= 100){
      setToast("TANK IS ALREADY FULL");
      return;
    }
    if(coins < 200){
      setToast("NOT ENOUGH COINS FOR FUEL");
      return;
    }
    setCoins(c => c - 200);
    setFuel(f => Math.min(100, f + 42));
    setToast("FUEL TOP-UP • +42% • ₦200 PAID");
  },[coins,fuel,fuelStationNearby]);

  const finishRide=useCallback(()=>{
    const currentPassenger=passengers[activeDropoff];
    const currentDestination=destinations[activeDropoff].trim();
    const isLastStop=activeDropoff===passengers.length-1;
    setDropoffReady(false);setParkedAtStop(false);
    setStage("arrived");setSpeed(0);setToast(`${currentDestination.toUpperCase()} BUS STOP • ${currentPassenger.name.toUpperCase()} HAS ARRIVED`);
    setTimeout(()=>setStage("exiting"),1000);
    setTimeout(()=>{
      const reward=currentPassenger.fare+(isLastStop?250:0);
      const finalReward=currentPassenger.fare+routeCompletionBonus;
      setCoins(c=>c+(isLastStop?finalReward:reward));
      if(isLastStop){
        setToast(`+${finalReward.toLocaleString()} COINS • ROUTE COMPLETION REWARD`);
        setRouteComplete(true);
        setActiveDropoff(0);setDistance(passengers[0].distance);setStage("request");
      }else{
        const nextStop=activeDropoff+1;
        setActiveDropoff(nextStop);setDistance(passengers[nextStop].distance);setStage("riding");
        setToast(`${currentPassenger.name.toUpperCase()} DROPPED OFF • NEXT: ${destinations[nextStop].trim().toUpperCase()}`);
      }
    },4000);
  },[activeDropoff,destinations]);

  useEffect(()=>{
    if(dropoffReady&&parkedAtStop&&stage==="riding")finishRide();
  },[dropoffReady,parkedAtStop,stage,finishRide]);

  useEffect(()=>{
    if(screen!=="game") return;
    const down=(e:KeyboardEvent)=>{keys.current[e.key.toLowerCase()]=true;if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault();};
    const up=(e:KeyboardEvent)=>{keys.current[e.key.toLowerCase()]=false;};
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);
    const timer=setInterval(()=>{
      setSpeed(s=>{
        const accel=keys.current.w||keys.current.arrowup, brake=keys.current.s||keys.current.arrowdown;
        return Math.max(0,Math.min(86,s+(accel?2.3:brake?-4.2:-.35)));
      });
      setSteering(keys.current.a||keys.current.arrowleft?-1:keys.current.d||keys.current.arrowright?1:0);
    },50);
    return()=>{clearInterval(timer);window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};
  },[screen]);

  useEffect(()=>{
    if(stage!=="riding"||speed<1||dropoffReady)return;
    const t=setInterval(()=>{setDistance(d=>{const next=Math.max(0,d-speed*.003);if(next<=0.02){setTimeout(()=>{setDropoffReady(true);setToast(`${passenger.to.toUpperCase()} REACHED • PULL INTO THE YELLOW DROP BAY AND STOP`);},0);return 0;}return next;});setFuel(f=>{const nextFuel=Math.max(0,f-.008);if(nextFuel<=0){setToast("OUT OF FUEL • HEAD TO THE STATION"); setSpeed(0); return 0;}return nextFuel;});},100);
    return()=>clearInterval(t);
  },[stage,speed,dropoffReady,passenger.to]);

  const press=(key:string,on:boolean)=>{keys.current[key]=on;};

  if(screen==="menu") return <><BackgroundAudio /><StartScreen start={()=>{setScreen("game");setToast("WELCOME TO YABA • FIND YOUR FIRST PASSENGER");}} openPanel={setPanel}/>{panel&&<PanelModal panel={panel} close={()=>setPanel(null)} coins={coins}/>}</>;

  return <main className="game-screen">
    <BackgroundAudio />
    <LagosScene speed={speed} steering={steering} riding={stage==="riding"} stage={stage} passenger={passenger} activePassenger={activeDropoff} dropoffReady={dropoffReady} onParkingChange={setParkedAtStop} onFuelStationChange={setFuelStationNearby} onCrash={handleCrash}/>
    <header className="hud-top"><div className="driver-card"><span className="avatar">KB</span><div><small>KOLA BALOGUN</small><strong>BUS STOP KING <em>LV. 3</em></strong><div className="xp"><i/></div></div></div><div className="location"><span>{stage==="request"?"YABA MAINLAND":passenger.to.toUpperCase()}</span><strong>{stage==="request"?"MORNING RUSH":`NEXT DROP-OFF • STOP ${activeDropoff+1} OF ${passengers.length}`}</strong></div><div className="top-stats"><Stat icon="coin" label="COINS" value={coins.toLocaleString()} tone="gold"/><Stat icon="fuel" label="FUEL" value={`${Math.round(fuel)}%`} tone="green"/><Stat icon="wrench" label="DANFO" value="86%" tone="red"/></div></header>
    {toast&&<div className="game-toast">{toast}</div>}
    <aside className="request-card">
      <div className="request-head"><span><Icon name="person" size={17}/> PASSENGER MANIFEST</span><i>{passengers.length} NEW</i></div>
      <div className="passenger-list">
        {passengers.map((listedPassenger,index)=><label className={`passenger-row ${stage!=="request"&&index<activeDropoff?"completed":stage!=="request"&&index===activeDropoff?"active":""}`} key={listedPassenger.name}>
          <span className="passenger-avatar" style={{background:listedPassenger.color}}>{listedPassenger.name.split(" ").map(name=>name[0]).join("")}</span>
          <span className="passenger-details"><strong>{listedPassenger.name}</strong><small>FROM {listedPassenger.from.toUpperCase()}</small></span>
          <span className="destination-field"><small>{stage!=="request"&&index<activeDropoff?"DROPPED OFF":stage!=="request"&&index===activeDropoff?"NEXT STOP":"DESTINATION"}</small><input aria-label={`${listedPassenger.name}'s destination`} value={destinations[index]} disabled={stage!=="request"} placeholder="Type destination" onChange={event=>setDestinations(current=>current.map((destination,destinationIndex)=>destinationIndex===index?event.target.value:destination))}/></span>
        </label>)}
      </div>
      <div className="ride-facts"><div><small>PASSENGERS</small><strong>{passengers.length}</strong></div><div><small>TOTAL FARE</small><strong>₦{totalFare.toLocaleString()}</strong></div><div><small>ROUTE</small><strong>{totalDistance.toFixed(1)} km</strong></div></div>
      {stage==="request"?<GameButton primary onClick={accept} disabled={!allDestinationsSet}>ACCEPT ALL PASSENGERS</GameButton>:<div className="stage-status"><i/><span>{stage==="walking"?"PASSENGERS WALKING TO DANFO":stage==="boarding"?"BOARDING ALL PASSENGERS":stage==="riding"&&dropoffReady?(parkedAtStop?"PARKED • OPENING DOORS":"PULL INTO DROP BAY & STOP"):stage==="riding"?`${passengers.length-activeDropoff} PASSENGERS ON BOARD`:"PASSENGER GETTING DOWN"}</span></div>}
      {fuelStationNearby && stage==="riding" && <button className="fuel-station-button" onClick={buyFuel} disabled={fuel >= 100 || coins < 200}>BUY FUEL • ₦200</button>}
    </aside>
    <aside className={`mini-map ${dropoffReady?"parking-mode":""}`}><div className="mini-map-head"><span><b>STOP {activeDropoff+1}/{passengers.length}</b> • {passenger.to.toUpperCase()}</span><button onClick={()=>setPanel("map")}><Icon name="map" size={17}/></button></div><div className="mini-map-canvas"><div className="mini-road a"/><div className="mini-road b"/><div className="mini-route"/><span className="bus-dot">DF</span><span className="dest-dot"/><small>{passenger.from.toUpperCase()}</small><small>{passenger.to.toUpperCase()}</small></div><div className="route-summary"><span><Icon name="arrow" size={15}/> {dropoffReady?"PARK LEFT IN YELLOW BAY":`DRIVE TO ${passenger.to.toUpperCase()} STOP`}</span><b>{dropoffReady?"STOP":`${distance.toFixed(1)} km`}</b></div></aside>
    <nav className="game-nav">{[["map","MAP"],["person","PASSENGERS"],["garage","VEHICLE"],["wrench","GARAGE"],["flag","MISSIONS"]].map(([i,n])=><button key={n} onClick={()=>setPanel(n==="MAP"?"map":n==="GARAGE"||n==="VEHICLE"?"garage":n==="MISSIONS"?"missions":null)}><Icon name={i}/><span>{n}</span></button>)}<button onClick={()=>setScreen("menu")}><Icon name="pause"/><span>PAUSE</span></button></nav>
    <div className="speedometer"><div className="speed-ring"><strong>{Math.round(speed)}</strong><small>KM/H</small></div><span>GEAR <b>{speed<1?"N":speed<25?"1":speed<50?"2":"3"}</b></span></div>
    <div className="drive-controls"><div className="steer-controls"><button onPointerDown={()=>press("a",true)} onPointerUp={()=>press("a",false)} onPointerLeave={()=>press("a",false)}>‹</button><button onPointerDown={()=>press("d",true)} onPointerUp={()=>press("d",false)} onPointerLeave={()=>press("d",false)}>›</button></div><button className="horn" onClick={()=>setToast("PON PON! • DANFO HORN")}><Icon name="horn"/></button><div className="pedals"><button className="brake" onPointerDown={()=>press("s",true)} onPointerUp={()=>press("s",false)}>BRAKE</button><button className="gas" onPointerDown={()=>press("w",true)} onPointerUp={()=>press("w",false)}>GAS</button></div></div>
    <div className="controls-hint">WASD / ARROW KEYS TO DRIVE</div>
    {routeComplete&&<div className="route-reward-backdrop"><section className="route-reward-card">
      <span className="reward-coin"><Icon name="coin" size={34}/></span>
      <small>SHIFT COMPLETE</small>
      <strong>ALL PASSENGERS DELIVERED</strong>
      <p>You completed every drop-off and earned the full route payout.</p>
      <div className="reward-total"><span>PASSENGER FARES <b>₦{totalFare.toLocaleString()}</b></span><span>DRIVER BONUS <b>₦{routeCompletionBonus.toLocaleString()}</b></span><strong>₦{(totalFare+routeCompletionBonus).toLocaleString()}</strong></div>
      <GameButton primary onClick={()=>setRouteComplete(false)}>START NEW ROUTE</GameButton>
    </section></div>}
    {gameOver&&<div className="route-reward-backdrop"><section className="route-reward-card">
      <span className="reward-coin" style={{color:"#ff7c6d",borderColor:"#ff7c6d",background:"#421c1a"}}><Icon name="close" size={34}/></span>
      <small>DRIVER DOWN</small>
      <strong>GAME OVER</strong>
      <p>You hit a moving vehicle on the road. The shift ends here.</p>
      <div className="reward-total"><span>LAST RUN <b>₦{coins.toLocaleString()}</b></span><span>STATUS <b>CRASHED</b></span><strong>TRY AGAIN</strong></div>
      <GameButton primary onClick={()=>{setGameOver(false); setScreen("menu"); setStage("request"); setPanel(null); setFuel(78); setToast("WELCOME TO YABA • FIND YOUR FIRST PASSENGER");}}>BACK TO MENU</GameButton>
    </section></div>}
    {panel&&<PanelModal panel={panel} close={()=>setPanel(null)} coins={coins}/>} 
  </main>;
}