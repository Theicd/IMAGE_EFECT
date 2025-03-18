// imageAppearanceEffects.js - אפקטים הקשורים להופעת התמונה

// משתנה גלובלי לשמירת מהירות האפקט
let effectSpeedMultiplier = 1.0;

// פונקציה לעדכון מהירות האפקט
function updateEffectSpeed(speedValue) {
  effectSpeedMultiplier = parseFloat(speedValue);
}

// פונקציה להמרת זמן אנימציה בהתאם למהירות שנבחרה
function getAdjustedDuration(baseDuration) {
  // הערך הנמוך יותר של המכפיל אומר מהירות גבוהה יותר (זמן קצר יותר)
  return Math.round(baseDuration / effectSpeedMultiplier);
}

// רשימת האפקטים בקטגוריה זו
const imageAppearanceEffects = {
  // אפקט פופ - התמונה מופיעה בפופ
  pop: {
    name: "פופ",
    value: "pop",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      
      // אפקט התחלתי - המישור קטן
      mesh.scale.set(0.01, 0.01, 0.01);
      
      // הגדרת אנימציה - הקטנת מידת ההגדלה מ-1.1 ל-1.05
      new TWEEN.Tween(mesh.scale)
        .to({ x: mesh.userData.originalScale.x * 1.05, 
              y: mesh.userData.originalScale.y * 1.05, 
              z: mesh.userData.originalScale.z * 1.05 }, getAdjustedDuration(300))
        .easing(TWEEN.Easing.Back.Out)
        .onComplete(() => {
          // חזרה לגודל רגיל
          new TWEEN.Tween(mesh.scale)
            .to({ x: mesh.userData.originalScale.x, 
                  y: mesh.userData.originalScale.y, 
                  z: mesh.userData.originalScale.z }, getAdjustedDuration(150))
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        })
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // בדיקה אם האנימציה הסתיימה (אם עברו יותר מ-500 מילישניות)
      if (mesh.userData.animationStartTime && Date.now() - mesh.userData.animationStartTime > 500) {
        // וידוא שהתמונה חזרה לגודל המקורי שלה
        if (mesh.userData.originalScale) {
          mesh.scale.copy(mesh.userData.originalScale);
        }
      }
    }
  },
  
  // אפקט ציור - התמונה מצטיירת בהדרגה
  draw: {
    name: "המשכיות",
    value: "draw",
    apply: function(mesh, scene, composer) {
      console.log("Mesh at apply start:", mesh);
      console.log("Mesh material:", mesh.material);
      console.log("Mesh material map:", mesh.material ? mesh.material.map : "No material");

      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalMaterial = mesh.material;
      
      let texture = null;
      if (mesh.material && mesh.material.map) {
        texture = mesh.material.map;
        console.log("Using original texture from mesh.material.map:", texture);
      } else {
        console.warn("No valid material or texture map found for mesh. Attempting to load local texture 'blure.jpg'.");
        try {
          texture = new THREE.TextureLoader().load(
            'blure.jpg',
            () => console.log("Local texture 'blure.jpg' loaded successfully."),
            undefined,
            (err) => console.error("Error loading local texture 'blure.jpg':", err)
          );
        } catch (e) {
          console.error("Failed to initialize texture loader:", e);
          mesh.scale.set(0.01, 0.01, 0.01);
          new TWEEN.Tween(mesh.scale)
            .to({ 
              x: mesh.userData.originalScale.x, 
              y: mesh.userData.originalScale.y, 
              z: mesh.userData.originalScale.z 
            }, getAdjustedDuration(800))
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
          mesh.userData.animationStartTime = Date.now();
          return;
        }
      }
      
      mesh.material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          map: { value: texture },
          strength: { value: 0.5 },
          center: { value: new THREE.Vector2(0.5, 0.5) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float strength;
          uniform vec2 center;
          varying vec2 vUv;
          float random(vec3 scale, float seed) {
            return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
          }
          void main() {
            vec4 color = vec4(0.0);
            float total = 0.0;
            vec2 toCenter = center - vUv;
            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
            for (float t = 0.0; t <= 20.0; t++) {
              float percent = (t + offset) / 20.0;
              float weight = 4.0 * (percent - percent * percent);
              vec4 texel = texture2D(map, vUv + toCenter * percent * strength);
              texel.rgb *= texel.a;
              color += texel * weight;
              total += weight;
            }
            gl_FragColor = color / total;
            gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
            gl_FragColor.a = 1.0 - strength;
          }
        `
      });
      
      mesh.scale.set(0.01, 0.01, 0.01);
      new TWEEN.Tween(mesh.scale)
        .to({ 
          x: mesh.userData.originalScale.x, 
          y: mesh.userData.originalScale.y, 
          z: mesh.userData.originalScale.z 
        }, getAdjustedDuration(800))
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
      
      new TWEEN.Tween(mesh.material.uniforms.strength)
        .to({ value: 0.0 }, getAdjustedDuration(800))
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          if (mesh.userData.originalMaterial) {
            mesh.material = mesh.userData.originalMaterial;
            console.log("Restored original material:", mesh.material);
          }
        })
        .start();
      
      mesh.userData.animationStartTime = Date.now();
    },
    
    update: function(mesh, delta) {
      if (mesh.userData.animationStartTime && Date.now() - mesh.userData.animationStartTime > 1000) {
        if (mesh.userData.originalScale) {
          mesh.scale.copy(mesh.userData.originalScale);
        }
        if (mesh.userData.originalMaterial && mesh.material !== mesh.userData.originalMaterial) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }
    }
  },

  
  // אפקט גלישה - התמונה נכנסת מצד מסוים
  slide: {
    name: "גלישה",
    value: "slide",
    apply: function(mesh, scene, composer) {
      // שמירת המיקום המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      
      // שמירה על הסקייל המקורי של התמונה
      if (!mesh.userData.originalScale) {
        mesh.userData.originalScale = mesh.scale.clone();
      } else {
        // אם כבר יש סקייל מקורי, נוודא שהוא נשמר (לא יוקטן בטעות)
        mesh.scale.copy(mesh.userData.originalScale);
      }
      
      // העברת המישור מעבר לגבול המסך
      mesh.position.x = 10; // נכנס מימין
      
      // הגדרת אנימציה
      new TWEEN.Tween(mesh.position)
        .to({ x: mesh.userData.originalPosition.x }, getAdjustedDuration(800))
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה במהלך האנימציה
    update: function(mesh, delta) {
      // וידוא שהתמונה נשארת בגודל המקורי שלה לאורך כל האנימציה
      if (mesh.userData.originalScale) {
        mesh.scale.copy(mesh.userData.originalScale);
      }
    }
  },
  
  // אפקט דהייה - התמונה מופיעה בדהייה
  fade: {
    name: "דהייה",
    value: "fade",
    apply: function(object3D, scene, composer) {
        // פונקציה רקורסיבית לעיבוד כל האובייקטים בסצנה
        const processObject = (obj) => {
            if (obj.isMesh) {
                // קוד האפקט המקורי למש
                if (!obj.material) {
                    console.warn('Mesh has no material:', obj);
                    return;
                }

                obj.userData.originalOpacity = obj.material.opacity ?? 1.0;
                obj.userData.startTime = Date.now();
                obj.userData.duration = getAdjustedDuration(1200);
                obj.userData.isFading = true;

                obj.material.transparent = true;
                obj.material.opacity = 0;
                obj.material.needsUpdate = true;

                const animate = () => {
                    if (!obj.userData.isFading) return;

                    const elapsed = Date.now() - obj.userData.startTime;
                    const progress = Math.min(elapsed / obj.userData.duration, 1);

                    obj.material.opacity = TWEEN.Easing.Quadratic.InOut(progress);
                    obj.material.needsUpdate = true;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        obj.userData.isFading = false;
                        obj.material.opacity = obj.userData.originalOpacity;
                    }
                };

                animate();
            } else if (obj.isGroup) {
                // עיבוד רקורסיבי של ילדי הגרופ
                obj.children.forEach(child => processObject(child));
            }
        };

        processObject(object3D);
    },
    
    update: function(object3D, delta) {
        const processObject = (obj) => {
            if (obj.isMesh && obj.userData.isFading === false) {
                if (obj.material) {
                    obj.material.opacity = obj.userData.originalOpacity;
                    obj.material.needsUpdate = true;
                }
                delete obj.userData.isFading;
            } else if (obj.isGroup) {
                obj.children.forEach(child => processObject(child));
            }
        };
        
        processObject(object3D);
    }
},

  
  // אפקט סיבוב - התמונה מסתובבת תוך כדי הופעה
  spin: {
    name: "סיבוב",
    value: "spin",
    apply: function(mesh, scene, composer) {
        // שמירת מצב מקורי משופרת
        mesh.userData.original = {
            scale: mesh.scale.clone(),
            position: mesh.position.clone(),
            rotation: new THREE.Euler().copy(mesh.rotation)
        };

        // אתחול אפקט תלת-מימדי
        mesh.scale.set(0.01, 0.01, 0.01);
        mesh.position.y -= 2; // הזזה התחלתית כלפי מטה
        mesh.rotation.set(
            THREE.MathUtils.degToRad(-30), // הטיה ציר X
            -Math.PI * 2, // סיבוב מלא Y
            THREE.MathUtils.degToRad(15) // הטיה ציר Z
        );

        // יצירת טווינים עם הבדלי easing
        const duration = getAdjustedDuration(1200);
        
        new TWEEN.Tween(mesh.rotation)
            .to({ 
                x: mesh.userData.original.rotation.x,
                y: mesh.userData.original.rotation.y,
                z: mesh.userData.original.rotation.z
            }, duration)
            .easing(TWEEN.Easing.Elastic.Out) // אפקט "קפיצי"
            .start();
            
        new TWEEN.Tween(mesh.scale)
            .to(mesh.userData.original.scale, duration * 0.8) // משך קצר יותר לסקייל
            .easing(TWEEN.Easing.Back.Out)
            .start();
            
        new TWEEN.Tween(mesh.position)
            .to(mesh.userData.original.position, duration)
            .easing(TWEEN.Easing.Bounce.Out) // אפקט "קפיצה" למיקום
            .start();
    },
    
    update: function(mesh, delta) {
        // הוסר הצורך באכיפת סקייל - התנועות מנוהלות ע"י טווינים
    }
} // עדכון כל האנימציות
        // אין צורך באיפוס ידני
    }
 // כאן נגמר אובייקט ה-spin ללא פסיק או סוגר נוסף
  


// פונקציה להחלת אפקט הופעת תמונה
function applyImageAppearanceEffect(effect, mesh, scene, composer) {
  // בדיקה אם האפקט קיים
  if (imageAppearanceEffects[effect] && imageAppearanceEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetAppearanceEffects(mesh);
    
    // הפעלת האפקט
    imageAppearanceEffects[effect].apply(mesh, scene, composer);
    return true;
  }
  return false;
}

// פונקציה לאיפוס אפקטים
function resetAppearanceEffects(mesh) {
  // איפוס סיבוב
  if (mesh.userData.originalRotation) {
    mesh.rotation.copy(mesh.userData.originalRotation);
  }
  
  // איפוס מיקום
  if (mesh.userData.originalPosition) {
    mesh.position.copy(mesh.userData.originalPosition);
  }
  
  // איפוס גודל
  if (mesh.userData.originalScale) {
    mesh.scale.copy(mesh.userData.originalScale);
    // לא מוחקים את originalScale כדי שנוכל להשתמש בו בהמשך
    // delete mesh.userData.originalScale;
  }
  
  // איפוס שקיפות
  if (mesh.material) {
    mesh.material.opacity = 1;
    mesh.material.transparent = false;
  }
}

// ייצוא הפונקציות והאפקטים
window.imageAppearanceEffects = imageAppearanceEffects;
window.applyImageAppearanceEffect = applyImageAppearanceEffect;
window.updateEffectSpeed = updateEffectSpeed;
