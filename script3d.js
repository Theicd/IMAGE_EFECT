// משתנים גלובליים
let scene, camera, renderer, composer;
let room, imageTexture, imageMesh;
let controls;
let currentEffect = 'neon';
let animationFrameId;
let neonText, neonTextMaterial;
let particleSystem;
let bloomPass, glitchPass, bokehPass, fxaaPass, colorPass, filmPass;
let waveUniforms;

// מאזיני אירועים
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', onWindowResize);
document.getElementById('image-upload').addEventListener('change', handleImageUpload);
document.getElementById('effect-select').addEventListener('change', (e) => {
  currentEffect = e.target.value;
  applyEffect(currentEffect);
});
document.getElementById('create-video').addEventListener('click', createVideo);
document.getElementById('back-to-editor').addEventListener('click', () => {
  document.getElementById('video-container').style.display = 'none';
});

// פונקציית אתחול
async function init() {
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
  
  // יצירת אפקט Bloom
  setupPostProcessing();
  
  // יצירת חדר
  createRoom();
  
  // יצירת תאורה
  setupLighting();
  
  // הסתרת מסך הטעינה
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 1500);
  
  // התחלת לולאת האנימציה
  animate();
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

// יצירת טקסט כותרת
function createHeaderText() {
  console.log("יצירת טקסט כותרת");
  const loader = new THREE.TextureLoader();
  
  // יצירת canvas לטקסט
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // הגדרת סגנון הטקסט
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // יצירת רקע מגניב עם עומק
  createCoolBackground(ctx, canvas.width, canvas.height);
  
  // הכנת הטקסטורה
  const textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  
  // יצירת חומר לטקסט
  neonTextMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });
  
  // יצירת גיאומטריה לטקסט
  const textGeometry = new THREE.PlaneGeometry(5, 3);
  neonText = new THREE.Mesh(textGeometry, neonTextMaterial);
  neonText.position.set(0, 0.5, -4.5);
  scene.add(neonText);
  
  // הגדרת טקסט הכותרת והתת-כותרת
  const mainText = 'חדר האפקטים התלת-מימדי';
  const subText = 'העלו תמונה ← בחרו אפקט ← צרו וידאו';
  
  console.log("קריאה לפונקציית animateTypingEffect");
  // הפעלת אנימציית הקלדה
  animateTypingEffect(canvas, ctx, mainText, subText);
  console.log("סיום קריאה לפונקציית animateTypingEffect");
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

// טיפול בהעלאת תמונה
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      if (imageMesh) scene.remove(imageMesh);
      
      // יצירת טקסטורה מהתמונה
      imageTexture = new THREE.Texture(img);
      imageTexture.needsUpdate = true;
      
      // יצירת מש לתמונה
      const aspectRatio = img.width / img.height;
      const width = 4;
      const height = width / aspectRatio;
      
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ 
        map: imageTexture,
        side: THREE.DoubleSide
      });
      
      imageMesh = new THREE.Mesh(geometry, material);
      imageMesh.position.z = -4;
      scene.add(imageMesh);
      
      // הפעלת כפתור יצירת וידאו
      document.getElementById('create-video').disabled = false;
      
      // החלת האפקט הנוכחי
      applyEffect(currentEffect);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// פונקציית אנימציה
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // עדכון בקרי מצלמה
  controls.update();
  
  // עדכון אפקטים
  updateEffects();
  
  // רינדור הסצנה
  composer.render();
}

// עדכון אפקטים
function updateEffects() {
  if (!imageMesh) return;
  
  const time = Date.now() * 0.001;
  
  switch (currentEffect) {
    case 'neon':
      // אפקט ניאון - שינוי צבעים
      if (bloomPass) {
        bloomPass.strength = 1.5 + Math.sin(time) * 0.5;
      }
      break;
      
    case 'glitch':
      // אפקט גליץ' - שינוי מיקום אקראי
      if (Math.random() > 0.9) {
        imageMesh.position.x = (Math.random() - 0.5) * 0.1;
        setTimeout(() => {
          imageMesh.position.x = 0;
        }, 50);
      }
      break;
      
    case 'wave':
      // אפקט גלים - עיוות התמונה
      imageMesh.rotation.z = Math.sin(time) * 0.1;
      imageMesh.position.y = Math.sin(time * 2) * 0.2;
      
      // עדכון ערכי ה-uniform אם משתמשים ב-shader
      if (waveUniforms) {
        waveUniforms.time.value = time;
      }
      break;
      
    case 'rotate':
      // אפקט סיבוב
      imageMesh.rotation.y = time * 0.5;
      break;
      
    case 'particles':
      // עדכון מערכת החלקיקים
      if (particleSystem) {
        particleSystem.rotation.y = time * 0.2;
        
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.01;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }
      break;
      
    case 'bokeh':
      // אפקט עומק שדה
      if (bokehPass && bokehPass.uniforms && bokehPass.uniforms.focus) {
        bokehPass.uniforms.focus.value = 3.0 + Math.sin(time) * 0.5;
      }
      break;
      
    case 'film':
      // אפקט פילם ישן
      if (filmPass && filmPass.uniforms && filmPass.uniforms.time) {
        filmPass.uniforms.time.value = time;
      }
      break;
      
    case 'color':
      // אפקט עריכת צבעים
      if (colorPass && colorPass.uniforms && colorPass.uniforms['powRGB']) {
        const r = 1.0 + 0.3 * Math.sin(time * 0.5);
        const g = 1.0 + 0.3 * Math.sin(time * 0.5 + 2);
        const b = 1.0 + 0.3 * Math.sin(time * 0.5 + 4);
        colorPass.uniforms['powRGB'].value.set(r, g, b);
      }
      break;
  }
  
  // אנימציה לטקסט הכותרת
  if (neonText) {
    neonText.material.opacity = 1.0; // קבוע ללא הבהוב
  }
}

// החלת אפקט
function applyEffect(effect) {
  if (!imageMesh) return;
  
  // איפוס אפקטים קודמים
  imageMesh.rotation.set(0, 0, 0);
  imageMesh.position.set(0, 0, -4);
  imageMesh.scale.set(1, 1, 1);
  
  // בדיקה שה-material וה-color קיימים לפני שימוש ב-set
  if (imageMesh.material && imageMesh.material.color) {
    imageMesh.material.color.set(0xffffff);
  }
  
  if (particleSystem) {
    scene.remove(particleSystem);
    particleSystem = null;
  }
  
  // ביטול כל האפקטים
  if (glitchPass) glitchPass.enabled = false;
  if (bokehPass) bokehPass.enabled = false;
  if (colorPass) colorPass.enabled = false;
  if (filmPass) filmPass.enabled = false;
  
  // החזרת ה-material המקורי אם יש צורך
  if (imageMesh.userData.originalMaterial) {
    if (imageMesh.material) {
      imageMesh.material.dispose();
    }
    imageMesh.material = imageMesh.userData.originalMaterial;
    delete imageMesh.userData.originalMaterial;
  }
  
  // החלת האפקט החדש
  switch (effect) {
    case 'neon':
      if (bloomPass) {
        bloomPass.strength = 1.5;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0.85;
      }
      break;
      
    case 'glitch':
      if (bloomPass) {
        bloomPass.strength = 1.2;
        bloomPass.radius = 0.3;
        bloomPass.threshold = 0.9;
      }
      if (glitchPass) glitchPass.enabled = true;
      break;
      
    case 'wave':
      if (bloomPass) {
        bloomPass.strength = 1.3;
        bloomPass.radius = 0.5;
        bloomPass.threshold = 0.8;
      }
      
      // שימוש ב-shader לאפקט גלים
      if (imageTexture) {
        try {
          // שמירת ה-material המקורי
          imageMesh.userData.originalMaterial = imageMesh.material;
          
          // יצירת uniforms
          waveUniforms = {
            time: { type: 'f', value: 1.0 },
            texture1: { type: 't', value: imageTexture }
          };
          
          // יצירת material חדש עם shader
          const waveMaterial = new THREE.ShaderMaterial({
            uniforms: waveUniforms,
            vertexShader: `
              varying vec2 vUv;
              uniform float time;
              void main() {
                vUv = uv;
                vec3 pos = position;
                pos.z += sin(pos.y * 5.0 + time) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
              }
            `,
            fragmentShader: `
              uniform sampler2D texture1;
              varying vec2 vUv;
              void main() {
                gl_FragColor = texture2D(texture1, vUv);
              }
            `
          });
          
          // החלפת ה-material
          if (imageMesh.material) {
            imageMesh.material.dispose();
          }
          imageMesh.material = waveMaterial;
        } catch (e) {
          console.error('שגיאה ביצירת אפקט גלים:', e);
        }
      }
      break;
      
    case 'rotate':
      if (bloomPass) {
        bloomPass.strength = 1.4;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0.85;
      }
      break;
      
    case 'particles':
      if (bloomPass) {
        bloomPass.strength = 1.6;
        bloomPass.radius = 0.6;
        bloomPass.threshold = 0.7;
      }
      
      // יצירת מערכת חלקיקים
      createParticleSystem();
      break;
      
    case 'bokeh':
      if (bloomPass) {
        bloomPass.strength = 1.0;
        bloomPass.radius = 0.3;
        bloomPass.threshold = 0.9;
      }
      if (bokehPass) bokehPass.enabled = true;
      break;
      
    case 'film':
      if (bloomPass) {
        bloomPass.strength = 1.2;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0.8;
      }
      if (filmPass) filmPass.enabled = true;
      break;
      
    case 'color':
      if (bloomPass) {
        bloomPass.strength = 1.3;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0.85;
      }
      if (colorPass) {
        colorPass.enabled = true;
        colorPass.uniforms['powRGB'].value = new THREE.Vector3(1.4, 1.2, 1.0);
      }
      break;
  }
}

// יצירת מערכת חלקיקים
function createParticleSystem() {
  try {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x00ffff);
    const color2 = new THREE.Color(0xff00ff);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // מיקום אקראי בחלל
      positions[i3] = (Math.random() - 0.5) * 8;
      positions[i3 + 1] = (Math.random() - 0.5) * 8;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;
      
      // צבע אקראי בין כחול לוורוד
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  } catch (e) {
    console.error('שגיאה ביצירת מערכת חלקיקים:', e);
  }
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

// יצירת וידאו
async function createVideo() {
  if (!imageMesh) return;
  
  // הצגת פס התקדמות
  const progressContainer = document.querySelector('.progress-container');
  const progressFill = document.querySelector('.progress-fill');
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';
  
  // הקלטת הסצנה
  const stream = renderer.domElement.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  
  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
  mediaRecorder.start();
  
  // עדכון פס התקדמות
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
  }, 100);
  
  // הקלטה למשך 5 שניות
  await new Promise(resolve => setTimeout(resolve, 5000));
  mediaRecorder.stop();
  
  return new Promise(resolve => {
    mediaRecorder.onstop = async () => {
      clearInterval(progressInterval);
      progressFill.style.width = '100%';
      
      try {
        // יצירת קובץ webm ישירות ללא המרה
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(webmBlob);
        
        // הצגת הווידאו
        const videoPlayer = document.getElementById('output-video');
        videoPlayer.src = videoUrl;
        document.getElementById('video-container').style.display = 'block';
        
        // הגדרת כפתור ההורדה
        document.getElementById('download-video').onclick = () => {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = `${currentEffect}_effect.webm`;
          a.click();
        };
        
        progressContainer.style.display = 'none';
        resolve();
      } catch (error) {
        console.error('שגיאה ביצירת הווידאו:', error);
        alert('אירעה שגיאה ביצירת הווידאו: ' + error.message);
        progressContainer.style.display = 'none';
        resolve();
      }
    };
  });
}

// אנימציית הקלדה
function animateTypingEffect(canvas, ctx, mainText, subText) {
  console.log("התחלת אנימציית הקלדה");
  let mainTextIndex = 0;
  let subTextIndex = 0;
  let frameCount = 0;
  
  function animate() {
    frameCount++;
    
    // האט את קצב האנימציה - רק כל 5 פריימים
    if (frameCount % 5 === 0) {
      console.log("אנימציית הקלדה פריים:", frameCount, "טקסט:", mainText.substring(0, mainTextIndex));
      
      // נקה את הקנבס
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // יצירת רקע מגניב עם עומק
      createCoolBackground(ctx, canvas.width, canvas.height, frameCount);
      
      // הגדרת סגנון הטקסט הראשי
      ctx.font = 'bold 48px Heebo';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // יצירת מסגרת זוהרת לטקסט
      drawGlowingTextWithFrame(ctx, mainText.substring(0, mainTextIndex), canvas.width / 2, canvas.height / 2 - 40, 48, frameCount);
      
      // הגדרת סגנון הטקסט המשני
      ctx.font = 'bold 32px Heebo';
      
      // יצירת מסגרת זוהרת לטקסט המשני
      drawGlowingTextWithFrame(ctx, subText.substring(0, subTextIndex), canvas.width / 2, canvas.height / 2 + 40, 32, frameCount);
      
      // עדכון הטקסטורה
      neonText.material.map.needsUpdate = true;
      
      // הגדלת האינדקסים - אט יותר
      mainTextIndex = Math.min(mainTextIndex + 1, mainText.length);
      if (mainTextIndex >= mainText.length) {
        subTextIndex = Math.min(subTextIndex + 1, subText.length);
      }
    }
    
    // המשך האנימציה
    if (mainTextIndex < mainText.length || subTextIndex < subText.length) {
      requestAnimationFrame(animate);
    } else {
      console.log("סיום אנימציית הקלדה, מעבר לאנימציית רקע");
      // המשך אנימציית הרקע גם אחרי סיום ההקלדה
      animateBackground(canvas, ctx, mainText, subText);
    }
  }
  
  // התחל את האנימציה
  animate();
}

// יצירת רקע מגניב עם עומק
function createCoolBackground(ctx, width, height, frameCount = 0) {
  // רקע כהה עם גרדיאנט
  const gradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width/2);
  gradient.addColorStop(0, 'rgba(0, 40, 80, 0.8)');
  gradient.addColorStop(0.5, 'rgba(0, 20, 40, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 10, 20, 0.9)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // יצירת מסגרת ניאון מרובעת עם פינות מעוגלות
  const padding = 40;
  const cornerRadius = 20;
  
  ctx.beginPath();
  ctx.moveTo(padding + cornerRadius, padding);
  ctx.lineTo(width - padding - cornerRadius, padding);
  ctx.quadraticCurveTo(width - padding, padding, width - padding, padding + cornerRadius);
  ctx.lineTo(width - padding, height - padding - cornerRadius);
  ctx.quadraticCurveTo(width - padding, height - padding, width - padding - cornerRadius, height - padding);
  ctx.lineTo(padding + cornerRadius, height - padding);
  ctx.quadraticCurveTo(padding, height - padding, padding, height - padding - cornerRadius);
  ctx.lineTo(padding, padding + cornerRadius);
  ctx.quadraticCurveTo(padding, padding, padding + cornerRadius, padding);
  ctx.closePath();
  
  // אפקט זוהר למסגרת
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // יצירת קווי רשת תלת-מימדיים ברקע
  drawGridLines(ctx, width, height, frameCount);
}

// יצירת קווי רשת תלת-מימדיים
function drawGridLines(ctx, width, height, frameCount = 0) {
  const gridSize = 40;
  const perspective = 800;
  const horizonY = height / 2;
  
  // שמירת מצב הקנבס
  ctx.save();
  
  // הגדרת סגנון הקווים
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // קווים אופקיים
  for (let y = horizonY; y <= height; y += gridSize) {
    const perspectiveFactor = (y - horizonY) / perspective;
    const xOffset = width * perspectiveFactor * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(xOffset, y);
    ctx.lineTo(width - xOffset, y);
    ctx.stroke();
  }
  
  // קווים אנכיים עם עיוות פרספקטיבה
  const gridColumns = 20;
  for (let i = 0; i <= gridColumns; i++) {
    const xPercent = i / gridColumns;
    const x1 = width * xPercent;
    const x2 = width * 0.1 + width * 0.8 * xPercent;
    
    ctx.beginPath();
    ctx.moveTo(x1, height);
    ctx.lineTo(x2, horizonY);
    ctx.stroke();
  }
  
  // שחזור מצב הקנבס
  ctx.restore();
}

// יצירת טקסט זוהר עם מסגרת
function drawGlowingTextWithFrame(ctx, text, x, y, fontSize, frameCount = 0) {
  // מדידת רוחב הטקסט
  const textWidth = ctx.measureText(text).width;
  
  // חישוב גודל המסגרת יחסית לרוחב הקנבס
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // הגדלת המסגרת למקסימום שיתאים לטלפון נייד
  // השתמש ב-80% מרוחב הקנבס
  const frameWidth = canvasWidth * 0.8;
  // גובה המסגרת יהיה יחסי לגודל הפונט אבל גדול יותר
  const frameHeight = fontSize * 2.5;
  const cornerRadius = 15;
  
  // שמירת מצב הקנבס
  ctx.save();
  
  // יצירת מסגרת
  ctx.beginPath();
  ctx.moveTo(x - frameWidth/2 + cornerRadius, y - frameHeight/2);
  ctx.lineTo(x + frameWidth/2 - cornerRadius, y - frameHeight/2);
  ctx.quadraticCurveTo(x + frameWidth/2, y - frameHeight/2, x + frameWidth/2, y - frameHeight/2 + cornerRadius);
  ctx.lineTo(x + frameWidth/2, y + frameHeight/2 - cornerRadius);
  ctx.quadraticCurveTo(x + frameWidth/2, y + frameHeight/2, x + frameWidth/2 - cornerRadius, y + frameHeight/2);
  ctx.lineTo(x - frameWidth/2 + cornerRadius, y + frameHeight/2);
  ctx.quadraticCurveTo(x - frameWidth/2, y + frameHeight/2, x - frameWidth/2, y + frameHeight/2 - cornerRadius);
  ctx.lineTo(x - frameWidth/2, y - frameHeight/2 + cornerRadius);
  ctx.quadraticCurveTo(x - frameWidth/2, y - frameHeight/2, x - frameWidth/2 + cornerRadius, y - frameHeight/2);
  ctx.closePath();
  
  // צביעת הרקע של המסגרת - רקע כהה יותר להבלטת הטקסט
  const gradient = ctx.createLinearGradient(
    x - frameWidth/2, y, 
    x + frameWidth/2, y
  );
  gradient.addColorStop(0, 'rgba(0, 10, 30, 0.9)'); // רקע אטום יותר
  gradient.addColorStop(0.5, 'rgba(0, 20, 50, 0.9)');
  gradient.addColorStop(1, 'rgba(0, 10, 30, 0.9)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // מסגרת רגילה ללא אפקט ניאון
  ctx.shadowBlur = 0; // ביטול אפקט הזוהר
  ctx.strokeStyle = '#4080a0'; // צבע מסגרת רגיל במקום ניאון
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // הגדרת סגנון הטקסט - ללא אפקט זוהר
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // טקסט לבן בהיר עם קו מתאר דק
  ctx.strokeStyle = '#000000'; // קו מתאר שחור דק סביב הטקסט לשיפור הקריאות
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  
  ctx.fillStyle = '#ffffff'; // טקסט לבן בהיר
  ctx.fillText(text, x, y);
  
  // שחזור מצב הקנבס
  ctx.restore();
}

// פונקציה לקבלת צבע ניאון משתנה לפי זמן
function getNeonColorByTime(frameCount) {
  // שינוי צבעים עדין בין גווני כחול, טורקיז וסגול
  const time = frameCount * 0.01; // האטת קצב שינוי הצבע
  
  // ערכי HSL בסיס - גוון (0-360), רוויה (0-100), בהירות (0-100)
  const hue = (180 + 30 * Math.sin(time)) % 360; // נע בין 150-210 (טורקיז-כחול-סגול)
  const saturation = 100; // רוויה מלאה
  const lightness = 60 + 10 * Math.sin(time * 1.5); // בהירות משתנה
  
  // צבע בסיסי לגבול
  const borderColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  // צבע זוהר (בהיר יותר)
  const glowColor = `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`;
  
  return {
    border: borderColor,
    glow: glowColor
  };
}

// אנימציית רקע מתמשכת
function animateBackground(canvas, ctx, mainText, subText) {
  console.log("התחלת אנימציית רקע");
  let frameCount = 0;
  
  function animate() {
    frameCount++;
    if (frameCount % 10 === 0) {
      console.log("אנימציית רקע פריים:", frameCount);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // יצירת רקע מגניב עם עומק
    createCoolBackground(ctx, canvas.width, canvas.height, frameCount);
    
    // הגדרת סגנון הטקסט הראשי
    ctx.font = 'bold 48px Heebo';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // יצירת מסגרת זוהרת לטקסט
    drawGlowingTextWithFrame(ctx, mainText, canvas.width / 2, canvas.height / 2 - 40, 48, frameCount);
    
    // הגדרת סגנון הטקסט המשני
    ctx.font = 'bold 32px Heebo';
    
    // יצירת מסגרת זוהרת לטקסט המשני
    drawGlowingTextWithFrame(ctx, subText, canvas.width / 2, canvas.height / 2 + 40, 32, frameCount);
    
    // עדכון הטקסטורה
    neonText.material.map.needsUpdate = true;
    
    // המשך האנימציה
    requestAnimationFrame(animate);
  }
  
  animate();
}
