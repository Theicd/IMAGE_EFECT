// sceneSetup.js - יצירת הסצנה, החדר, התאורה והאובייקטים הבסיסיים

// יצירת סצנה ואתחול רנדרר
function setupScene() {
  // יצירת סצנה
  scene = new THREE.Scene();
  
  // יצירת מצלמה
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 3);
  
  // יצירת רנדרר
  const canvas = document.getElementById('scene');
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // יצירת בקרי מצלמה
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 10;
}

// יצירת אפקט Bloom
function setupPostProcessing() {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // אפקט Bloom
  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);
  
  // אפקט Glitch
  glitchPass = new THREE.GlitchPass();
  glitchPass.enabled = false;
  composer.addPass(glitchPass);
  
  // אפקט Bokeh (עומק שדה)
  try {
    bokehPass = new THREE.BokehPass(scene, camera, {
      focus: 3.0,
      aperture: 0.025,
      maxblur: 0.01,
      width: window.innerWidth,
      height: window.innerHeight
    });
    bokehPass.enabled = false;
    composer.addPass(bokehPass);
  } catch (e) {
    console.error('שגיאה בטעינת BokehPass:', e);
  }
  
  // אפקט FXAA (Anti-aliasing)
  try {
    fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
    fxaaPass.enabled = true;
    composer.addPass(fxaaPass);
  } catch (e) {
    console.error('שגיאה בטעינת FXAAShader:', e);
  }
  
  // אפקט עריכת צבעים
  try {
    colorPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
    colorPass.uniforms['powRGB'].value = new THREE.Vector3(1.0, 1.0, 1.0);
    colorPass.uniforms['mulRGB'].value = new THREE.Vector3(1.0, 1.0, 1.0);
    colorPass.enabled = false;
    composer.addPass(colorPass);
  } catch (e) {
    console.error('שגיאה בטעינת ColorCorrectionShader:', e);
  }
  
  // אפקט פילם ישן
  try {
    filmPass = new THREE.FilmPass(0.35, 0.025, 648, false);
    filmPass.enabled = false;
    composer.addPass(filmPass);
  } catch (e) {
    console.error('שגיאה בטעינת FilmPass:', e);
  }
}

// יצירת חדר
function createRoom() {
  // יצירת גיאומטריה של חדר
  const roomGeometry = new THREE.BoxGeometry(10, 6, 10);
  roomGeometry.scale(1, 1, 1);
  
  // יצירת חומרים לחדר
  const roomMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide }), // ימין
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide }), // שמאל
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide }), // למעלה
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide }), // למטה
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide }), // קדימה
    new THREE.MeshStandardMaterial({ color: 0x151515, side: THREE.BackSide })  // אחורה
  ];
  
  // יצירת מש של החדר
  room = new THREE.Mesh(roomGeometry, roomMaterials);
  scene.add(room);
  
  // יצירת רצפה מבריקה
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111, 
    metalness: 0.8,
    roughness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3;
  scene.add(floor);
  
  // יצירת טקסט כותרת
  createHeaderText();
}

// הגדרת תאורה
function setupLighting() {
  // תאורת אמביינט
  const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
  scene.add(ambientLight);
  
  // תאורת ניאון כחולה
  const blueLight = new THREE.PointLight(0x0088ff, 2, 10);
  blueLight.position.set(-3, 2, -3);
  scene.add(blueLight);
  
  // תאורת ניאון ורודה
  const pinkLight = new THREE.PointLight(0xff00ff, 2, 10);
  pinkLight.position.set(3, 2, -3);
  scene.add(pinkLight);
  
  // אור לבן מהתקרה
  const ceilingLight = new THREE.PointLight(0xffffff, 0.5, 10);
  ceilingLight.position.set(0, 2.5, 0);
  scene.add(ceilingLight);
}

// התאמת גודל החלון
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  
  // עדכון ה-resolution של ה-FXAA
  if (fxaaPass && fxaaPass.material && fxaaPass.material.uniforms) {
    fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
  }
  
  // עדכון ה-BokehPass
  if (bokehPass && bokehPass.uniforms && bokehPass.uniforms.aspect) {
    bokehPass.uniforms.aspect.value = camera.aspect;
  }
}

// ייצוא הפונקציות
window.sceneSetup = {
  setupScene,
  setupPostProcessing,
  createRoom,
  setupLighting,
  onWindowResize
};
