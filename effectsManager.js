// effectsManager.js - ניהול והחלת אפקטים

// עדכון אפקטים
function updateEffects() {
  if (!imageMesh) return;
  
  const time = Date.now() * 0.001;
  const delta = 0.016; // כ-60 פריימים בשנייה
  
  // הפעלת פונקציות עדכון מותאמות אישית אם קיימות
  if (imageMesh.userData.updateFunction) {
    // שימוש בנתוני המימדים האמיתיים של התמונה כדי שחלקיקים יישארו בגבולות
    const bounds = {
      width: imageMesh.userData.originalImageWidth || 1,
      height: imageMesh.userData.originalImageHeight || 1,
      aspectRatio: (imageMesh.userData.originalImageWidth || 1) / (imageMesh.userData.originalImageHeight || 1)
    };
    
    try {
      imageMesh.userData.updateFunction(delta, bounds);
    } catch (e) {
      console.error("Error updating effect:", e);
    }
  }
  
  // שמירה על עדכון אנימציות מהקוד הקיים למקרה שיש אפקטים ישנים פעילים
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
function applyEffect(category, effect) {
  if (!imageMesh) return;
  
  // בדיקה אם האפקט של קטגוריה זו קיים
  let applied = false;
  
  switch (category) {
    case 'appearance':
      if (window.applyImageAppearanceEffect) {
        applied = window.applyImageAppearanceEffect(effect, imageMesh, scene, composer);
      }
      break;
    case 'camera':
      if (window.applyCameraMovementEffect) {
        applied = window.applyCameraMovementEffect(effect, imageMesh, scene, composer);
      }
      break;
    case 'objects':
      if (window.applyMovingObjectsEffect) {
        applied = window.applyMovingObjectsEffect(effect, imageMesh, scene, composer);
      }
      break;
    case 'light':
      if (window.applyLightAndColorEffect) {
        applied = window.applyLightAndColorEffect(effect, imageMesh, scene, composer);
      }
      break;
    default:
      // אם אין קטגוריה, נפעיל את האפקטים הישנים
      applyLegacyEffect(effect);
      return;
  }
  
  if (!applied) {
    console.warn(`האפקט ${effect} בקטגוריה ${category} לא נמצא או נכשל`);
  } else {
    console.log(`הוחל האפקט ${effect} מקטגוריה ${category}`);
  }
}

// החלת אפקט מהגרסה הישנה, לצורך תאימות לאחור
function applyLegacyEffect(effect) {
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

// עדכון רשימת האפקטים בהתאם לקטגוריה הנבחרת
function updateEffectsList(category) {
  const effectSelect = document.getElementById('effect-select');
  
  // ניקוי רשימת האפקטים הקודמת
  while (effectSelect.options.length > 1) {
    effectSelect.remove(1);
  }
  
  // אפקטים לפי קטגוריה
  let effects = [];
  
  switch (category) {
    case 'appearance':
      effects = Object.values(window.imageAppearanceEffects || {});
      break;
    case 'camera':
      effects = Object.values(window.cameraMovementEffects || {});
      break;
    case 'objects':
      effects = Object.values(window.movingObjectsEffects || {});
      break;
    case 'light':
      effects = Object.values(window.lightAndColorEffects || {});
      break;
  }
  
  // הוספת האפקטים לרשימה
  effects.forEach(effect => {
    const option = document.createElement('option');
    option.value = effect.value;
    option.textContent = effect.name;
    effectSelect.appendChild(option);
  });
  
  // בחירת אפקט אם כבר יש אפקט פעיל בקטגוריה זו
  if (activeEffects[category]) {
    effectSelect.value = activeEffects[category];
  }
}

// ייצוא הפונקציות
window.effectsManager = {
  updateEffects,
  applyEffect,
  applyLegacyEffect,
  createParticleSystem,
  updateEffectsList
};
