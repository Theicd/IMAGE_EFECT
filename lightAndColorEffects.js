// lightAndColorEffects.js - אפקטים של צבע ואור

// רשימת האפקטים בקטגוריה זו
const lightAndColorEffects = {
  // אפקט שחור-לבן
  blackAndWhite: {
    name: "שחור-לבן",
    value: "blackAndWhite",
    apply: function(mesh, scene, composer) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט שחור-לבן");
      }
      
      if (targetMesh.material) {
        // שמירת ה-material המקורי
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // הוספת אפקט שחור-לבן באמצעות shader
        const bwShader = {
          uniforms: {
            tDiffuse: { value: null }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            void main() {
              vec4 texel = texture2D(tDiffuse, vUv);
              float gray = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
              gl_FragColor = vec4(vec3(gray), texel.a);
            }
          `
        };
        
        // יצירת pass שחור-לבן
        const blackAndWhitePass = new THREE.ShaderPass(bwShader);
        blackAndWhitePass.enabled = true;
        
        if (composer) {
          composer.addPass(blackAndWhitePass);
          
          // שמירת ה-pass לניקוי מאוחר יותר
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(blackAndWhitePass);
        }
      }
    }
  },
  
  // אפקט ספיה
  sepia: {
    name: "ספיה",
    value: "sepia",
    apply: function(mesh, scene, composer) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט ספיה");
      }
      
      if (targetMesh.material) {
        // שמירת ה-material המקורי
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // הוספת אפקט ספיה באמצעות shader
        const sepiaShader = {
          uniforms: {
            tDiffuse: { value: null },
            amount: { value: 0.9 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float amount;
            varying vec2 vUv;
            void main() {
              vec4 color = texture2D(tDiffuse, vUv);
              float r = color.r;
              float g = color.g;
              float b = color.b;
              
              color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
              color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
              color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));
              
              gl_FragColor = vec4(color.rgb, color.a);
            }
          `
        };
        
        // יצירת pass ספיה
        const sepiaPass = new THREE.ShaderPass(sepiaShader);
        sepiaPass.enabled = true;
        
        // הוספת ה-pass לקומפוזר
        if (composer) {
          composer.addPass(sepiaPass);
          
          // שמירת ה-pass לניקוי מאוחר יותר
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(sepiaPass);
        }
      }
    }
  },
  
  // אפקט ניגודיות
  contrastBoost: {
    name: "ניגודיות",
    value: "contrastBoost",
    apply: function(mesh, scene, composer) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט ניגודיות");
      }
      
      if (targetMesh.material) {
        // שמירת ה-material המקורי
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // הוספת אפקט ניגודיות באמצעות shader
        const contrastShader = {
          uniforms: {
            tDiffuse: { value: null },
            contrast: { value: 1.5 },
            brightness: { value: 0.1 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float contrast;
            uniform float brightness;
            varying vec2 vUv;
            void main() {
              vec4 texel = texture2D(tDiffuse, vUv);
              texel.rgb = (texel.rgb - 0.5) * contrast + 0.5 + brightness;
              gl_FragColor = texel;
            }
          `
        };
        
        // יצירת pass ניגודיות
        const contrastPass = new THREE.ShaderPass(contrastShader);
        contrastPass.enabled = true;
        
        // הוספת ה-pass לקומפוזר
        if (composer) {
          composer.addPass(contrastPass);
          
          // שמירת ה-pass לניקוי מאוחר יותר
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(contrastPass);
        }
      }
    }
  },
  
  // אפקט זוהר
  glow: {
    name: "זוהר",
    value: "glow",
    apply: function(mesh, scene, composer) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט זוהר");
      }
      
      if (targetMesh.material) {
        // שמירת ה-material המקורי
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // הוספת אפקט זוהר באמצעות bloom pass
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.5,  // חוזק
          0.4,  // רדיוס
          0.85  // סף
        );
        
        // הוספת ה-pass לקומפוזר
        if (composer) {
          composer.addPass(bloomPass);
          
          // שמירת ה-pass לניקוי מאוחר יותר
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(bloomPass);
        }
      }
    }
  },
  
  // אפקט שינוי גוון
  hueShift: {
    name: "שינוי גוון",
    value: "hueShift",
    apply: function(mesh, scene, composer) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט שינוי גוון");
      }
      
      if (targetMesh.material) {
        // שמירת ה-material המקורי
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // הוספת אפקט שינוי גוון באמצעות shader
        const hueShiftShader = {
          uniforms: {
            tDiffuse: { value: null },
            hue: { value: 0.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float hue;
            varying vec2 vUv;
            
            vec3 rgb2hsl(vec3 rgb) {
              float maxColor = max(max(rgb.r, rgb.g), rgb.b);
              float minColor = min(min(rgb.r, rgb.g), rgb.b);
              float delta = maxColor - minColor;
              
              vec3 hsl = vec3(0.0, 0.0, (maxColor + minColor) / 2.0);
              
              if (delta != 0.0) {
                hsl.y = hsl.z < 0.5 ? delta / (maxColor + minColor) : delta / (2.0 - maxColor - minColor);
                
                if (rgb.r == maxColor) {
                  hsl.x = (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6.0 : 0.0);
                } else if (rgb.g == maxColor) {
                  hsl.x = ((rgb.b - rgb.r) / delta) + 2.0;
                } else {
                  hsl.x = ((rgb.r - rgb.g) / delta) + 4.0;
                }
                
                hsl.x /= 6.0;
              }
              
              return hsl;
            }
            
            float hue2rgb(float p, float q, float t) {
              if (t < 0.0) t += 1.0;
              if (t > 1.0) t -= 1.0;
              if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
              if (t < 1.0/2.0) return q;
              if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
              return p;
            }
            
            vec3 hsl2rgb(vec3 hsl) {
              vec3 rgb = vec3(0.0);
              
              if (hsl.y == 0.0) {
                rgb = vec3(hsl.z);
              } else {
                float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
                float p = 2.0 * hsl.z - q;
                rgb.r = hue2rgb(p, q, hsl.x + 1.0/3.0);
                rgb.g = hue2rgb(p, q, hsl.x);
                rgb.b = hue2rgb(p, q, hsl.x - 1.0/3.0);
              }
              
              return rgb;
            }
            
            void main() {
              vec4 texel = texture2D(tDiffuse, vUv);
              vec3 hsl = rgb2hsl(texel.rgb);
              hsl.x = mod(hsl.x + hue, 1.0);
              vec3 rgb = hsl2rgb(hsl);
              gl_FragColor = vec4(rgb, texel.a);
            }
          `
        };
        
        // יצירת pass שינוי גוון
        const hueShiftPass = new THREE.ShaderPass(hueShiftShader);
        hueShiftPass.enabled = true;
        
        // הוספת ה-pass לקומפוזר
        composer.addPass(hueShiftPass);
        
        // שמירת ה-pass לניקוי מאוחר יותר
        mesh.userData.customPasses = mesh.userData.customPasses || [];
        mesh.userData.customPasses.push(hueShiftPass);
        
        // הוספת פונקציית עדכון לשינוי הגוון עם הזמן
        mesh.userData.updateFunction = function(delta) {
          hueShiftPass.uniforms.hue.value = (hueShiftPass.uniforms.hue.value + delta * 0.1) % 1.0;
        };
      }
    }
  },
  
  // אפקט הבהוב אור
  lightFlicker: {
    name: "הבהוב אור",
    value: "lightFlicker",
    
    apply: function(mesh, scene, composer, isPreview = true) {
      // שמירת המצב המקורי לפני החלת האפקט
      const targetMesh = mesh;
      
      // שמירת המצב המקורי
      const originalState = {
        material: targetMesh.material.clone(),
        position: targetMesh.position.clone(),
        scale: targetMesh.scale.clone(),
        rotation: targetMesh.rotation.clone(),
        uvOffset: new THREE.Vector2(0, 0)
      };
      
      // שמירת המצב המקורי לצורך איפוס
      targetMesh.userData.originalState = originalState;
      
      // יצירת טקסטורה זהה של התמונה
      let glitchMaterial = new THREE.MeshBasicMaterial({
        map: targetMesh.material.map,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      
      // עריכת הצבע לוורוד-סגול
      glitchMaterial.color.setRGB(1.5, 0.5, 1.5);
      
      // יצירת העתק של התמונה כשכבת גליץ'
      const glitchGeometry = targetMesh.geometry.clone();
      const glitchMesh = new THREE.Mesh(glitchGeometry, glitchMaterial);
      
      // קביעת המיקום והסיבוב בדיוק כמו התמונה המקורית
      glitchMesh.position.copy(targetMesh.position);
      // תיקון מיקום בציר ה-Z - להזיז מעט קדימה כך שלא יהיה רחוק מדי מהקיר
      glitchMesh.position.z = -0.01; // מיקום קצת קדימה מהקיר אך עדיין קרוב מאוד
      glitchMesh.rotation.copy(targetMesh.rotation);
      // קביעת גודל זהה בדיוק לתמונה המקורית
      glitchMesh.scale.copy(targetMesh.scale);
      scene.add(glitchMesh);

      // הגדרת מקדם הגדלה מותאם למצב תצוגה מקדימה או וידאו
      // במצב תצוגה מקדימה, נשתמש בהגדלה מאוד קטנה של 1% בלבד
      // במצב וידאו נשתמש בהגדלה של 10%
      const scaleIncrease = isPreview ? 0.01 : 0.1;
      
      // שימוש בקלאס CSS ייעודי עבור מיכל התצוגה של האפקט
      const container = document.getElementById('scene-container');
      if (container && isPreview) {
        container.classList.add('light-flicker-preview');
      }
      
      // קבלת מהירות האפקט מהסליידר (אם קיים)
      let speedMultiplier = 1.0;
      const speedSlider = document.getElementById('effect-speed');
      if (speedSlider) {
        speedMultiplier = parseFloat(speedSlider.value) || 1.0;
      }
      
      // פרמטרים לאנימציה - מותאמים למצב תצוגה מקדימה או וידאו
      let time = 0;
      const glitchParams = {
        // במצב תצוגה מקדימה נקטין את עוצמת האפקט
        intensity: isPreview ? 0.01 : 0.02,
        speed: 0.8 * speedMultiplier,  // מהירות מושפעת מהסליידר
        hueSpeed: 0.1 * speedMultiplier // מהירות שינוי צבע מושפעת מהסליידר
      };

      // הפעלת אנימציה
      function animateGlitch() {
        // העדכון מהסליידר (אם קיים וערכו השתנה)
        if (speedSlider && speedMultiplier !== parseFloat(speedSlider.value)) {
          speedMultiplier = parseFloat(speedSlider.value) || 1.0;
          glitchParams.speed = 0.8 * speedMultiplier;
          glitchParams.hueSpeed = 0.1 * speedMultiplier;
        }
        
        // עדכון הזמן בהתאם למהירות
        time += 0.006 * speedMultiplier;
        const glitchOffset = Math.sin(time * 8) * glitchParams.intensity;
        const hueRotate = (time * glitchParams.hueSpeed) % 1;

        if (targetMesh.material.map) {
          // הקטנת היסט המפה ב-UV לערכים קטנים יותר למניעת עיוותים גדולים
          targetMesh.material.map.offset.x = Math.sin(time * 5) * 0.005;
          targetMesh.material.map.offset.y = Math.cos(time * 4) * 0.005;
        }

        const hueColor = new THREE.Color().setHSL(hueRotate, 0.8, 0.5);
        targetMesh.material.color.lerp(hueColor, 0.03);

        // שמירה על מיקום ביחס לתמונה המקורית, רק עם רעידות קטנות
        glitchMesh.position.x = targetMesh.position.x + (Math.random() - 0.5) * glitchParams.intensity * 0.02;
        glitchMesh.position.y = targetMesh.position.y + (Math.random() - 0.5) * glitchParams.intensity * 0.02;
        // שמירת מיקום ה-Z קבוע כדי שהתמונה תישאר צמודה לקיר
        glitchMesh.position.z = -0.01; // שמירה על המיקום הקבוע ביחס לקיר

        // וידוא שהגודל נשאר קבוע לאורך כל האנימציה
        glitchMesh.scale.copy(targetMesh.scale);

        if (glitchMaterial.map) {
          glitchMaterial.map.offset.x = originalState.uvOffset.x + glitchOffset;
          glitchMaterial.map.offset.y = originalState.uvOffset.y + glitchOffset;
        }

        // עדכון ידני של ה-scene
        glitchMesh.updateMatrixWorld();
        requestAnimationFrame(animateGlitch);
      }

      animateGlitch();

      // פונקציית ניקוי
      mesh.userData.cleanup = () => {
        // הסרת קלאס CSS ייעודי
        const container = document.getElementById('scene-container');
        if (container) {
          container.classList.remove('light-flicker-preview');
        }
        
        // ניקוי TWEEN אם יש כאלה שקשורים לאנימציה
        TWEEN.removeAll();
        
        targetMesh.material = originalState.material;
        targetMesh.position.copy(originalState.position);
        targetMesh.scale.copy(originalState.scale);
        targetMesh.rotation.copy(originalState.rotation);
        if (targetMesh.material.map) targetMesh.material.map.offset.copy(originalState.uvOffset);
        scene.remove(glitchMesh);
      };
    }
  }
};

// פונקציה להחלת אפקט אור וצבע
function applyLightAndColorEffect(effect, mesh, scene, composer, isPreview = false) {
  // בדיקה אם האפקט קיים
  if (lightAndColorEffects[effect] && lightAndColorEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetLightAndColorEffects(mesh, scene, composer);
    
    // בדיקה אם זו קבוצה עם מסגרת (מהשינוי החדש) או mesh בודד
    let targetMesh = mesh;
    if (mesh.userData && mesh.userData.imagePlane) {
      targetMesh = mesh.userData.imagePlane;
      console.log("משתמש ב-imagePlane לאפקט אור וצבע", effect);
    }
    
    // להחיל את האפקט עם הפרמטר isPreview
    lightAndColorEffects[effect].apply(targetMesh, scene, composer, isPreview);
  }
}

// פונקציה לאיפוס אפקטים
function resetLightAndColorEffects(mesh, scene, composer) {
  // בדיקה אם זו קבוצה עם מסגרת
  let targetMesh = mesh;
  if (mesh.userData && mesh.userData.imagePlane) {
    targetMesh = mesh.userData.imagePlane;
    console.log("משתמש ב-imagePlane לאיפוס אפקטים");
  }
  
  // איפוס material
  if (targetMesh.userData && targetMesh.userData.originalMaterial) {
    console.log("איפוס ה-material המקורי");
    if (targetMesh.material) targetMesh.material.dispose();
    targetMesh.material = targetMesh.userData.originalMaterial;
    delete targetMesh.userData.originalMaterial;
  }
  
  // איפוס state (מהאפקטים החדשים)
  if (targetMesh.userData && targetMesh.userData.originalState) {
    console.log("איפוס ה-state המקורי");
    if (targetMesh.userData.cleanup && typeof targetMesh.userData.cleanup === 'function') {
      targetMesh.userData.cleanup();
    }
    delete targetMesh.userData.originalState;
    delete targetMesh.userData.cleanup;
  }
  
  // הסרת passes מותאמים אישית
  if (mesh.userData && mesh.userData.customPasses && composer) {
    console.log("הסרת passes מותאמים אישית");
    mesh.userData.customPasses.forEach(pass => {
      pass.enabled = false;
      composer.removePass(pass);
    });
    delete mesh.userData.customPasses;
  }
  
  // איפוס פונקציית עדכון
  if (mesh.userData && mesh.userData.updateFunction) {
    console.log("איפוס פונקציית עדכון");
    delete mesh.userData.updateFunction;
  }
}

// ייצוא הפונקציות והאפקטים למודל הגלובלי
window.lightAndColorEffects = lightAndColorEffects;
window.applyLightAndColorEffect = applyLightAndColorEffect;
window.resetLightAndColorEffects = resetLightAndColorEffects;
