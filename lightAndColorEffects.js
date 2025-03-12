// lightAndColorEffects.js - אפקטים של צבע ואור

// רשימת האפקטים בקטגוריה זו
const lightAndColorEffects = {
  // אפקט שחור-לבן
  blackAndWhite: {
    name: "שחור-לבן",
    value: "blackAndWhite",
    apply: function(mesh, scene, composer) {
      if (mesh.material) {
        // שמירת ה-material המקורי
        mesh.userData.originalMaterial = mesh.material.clone();
        
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
      if (mesh.material) {
        // שמירת ה-material המקורי
        mesh.userData.originalMaterial = mesh.material.clone();
        
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
      if (mesh.material) {
        // שמירת ה-material המקורי
        mesh.userData.originalMaterial = mesh.material.clone();
        
        // הוספת אפקט הגברת ניגודיות באמצעות shader
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
              vec4 color = texture2D(tDiffuse, vUv);
              color.rgb += brightness;
              color.rgb = (color.rgb - 0.5) * contrast + 0.5;
              gl_FragColor = color;
            }
          `
        };
        
        // יצירת pass ניגודיות
        const contrastPass = new THREE.ShaderPass(contrastShader);
        contrastPass.enabled = true;
        
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
      if (composer) {
        // יצירת אפקט זוהר באמצעות UnrealBloomPass
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.5,   // עוצמה
          0.4,   // גודל
          0.85   // סף
        );
        bloomPass.enabled = true;
        composer.addPass(bloomPass);
        
        // שמירת ה-pass לניקוי מאוחר יותר
        mesh.userData.customPasses = mesh.userData.customPasses || [];
        mesh.userData.customPasses.push(bloomPass);
      }
      
      // הוספת אור נקודתי להגברת האפקט
      const pointLight = new THREE.PointLight(0xffffff, 0.8, 10);
      pointLight.position.set(0, 0, 2);
      scene.add(pointLight);
      
      // שמירת המשתנים לניקוי מאוחר יותר
      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(pointLight);
    }
  },
  
  // אפקט שינוי גוון
  hueShift: {
    name: "שינוי גוון",
    value: "hueShift",
    apply: function(mesh, scene, composer) {
      if (mesh.material) {
        // שמירת ה-material המקורי
        mesh.userData.originalMaterial = mesh.material.clone();
        
        // הוספת אפקט שינוי גוון באמצעות shader
        const hueShiftShader = {
          uniforms: {
            tDiffuse: { value: null },
            hue: { value: 0 }
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
            
            // פונקציה להמרה מ-RGB ל-HSL
            vec3 rgb2hsl(vec3 color) {
              float maxVal = max(color.r, max(color.g, color.b));
              float minVal = min(color.r, min(color.g, color.b));
              float delta = maxVal - minVal;
              
              float h = 0.0;
              float s = 0.0;
              float l = (maxVal + minVal) / 2.0;
              
              if (delta > 0.0) {
                s = l < 0.5 ? delta / (maxVal + minVal) : delta / (2.0 - maxVal - minVal);
                
                if (color.r == maxVal) {
                  h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
                } else if (color.g == maxVal) {
                  h = (color.b - color.r) / delta + 2.0;
                } else {
                  h = (color.r - color.g) / delta + 4.0;
                }
                h /= 6.0;
              }
              
              return vec3(h, s, l);
            }
            
            // פונקציה להמרה מ-HSL ל-RGB
            float hue2rgb(float p, float q, float t) {
              if (t < 0.0) t += 1.0;
              if (t > 1.0) t -= 1.0;
              if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
              if (t < 1.0/2.0) return q;
              if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
              return p;
            }
            
            vec3 hsl2rgb(vec3 hsl) {
              float h = hsl.x;
              float s = hsl.y;
              float l = hsl.z;
              
              vec3 rgb;
              
              if (s == 0.0) {
                rgb = vec3(l);
              } else {
                float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
                float p = 2.0 * l - q;
                rgb.r = hue2rgb(p, q, h + 1.0/3.0);
                rgb.g = hue2rgb(p, q, h);
                rgb.b = hue2rgb(p, q, h - 1.0/3.0);
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
        
        if (composer) {
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
    }
  },
  
  // אפקט הבהוב אור
  lightFlicker: {
    name: "הבהוב אור",
    value: "lightFlicker",
    apply: function(mesh, scene, composer) {
      // יצירת אורות שיבהבו
      const redLight = new THREE.PointLight(0xff5555, 0.5, 15);
      redLight.position.set(-3, 2, 5);
      scene.add(redLight);
      
      const blueLight = new THREE.PointLight(0x5555ff, 0.5, 15);
      blueLight.position.set(3, -2, 5);
      scene.add(blueLight);
      
      const whiteLight = new THREE.PointLight(0xffffff, 0.3, 20);
      whiteLight.position.set(0, 0, 10);
      scene.add(whiteLight);
      
      // שמירת המשתנים לניקוי מאוחר יותר
      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(redLight, blueLight, whiteLight);
      
      // פונקציית עדכון להבהוב האורות
      mesh.userData.updateFunction = function(delta) {
        const time = Date.now() * 0.003;
        
        redLight.intensity = 0.5 + 0.5 * Math.sin(time * 1.1);
        blueLight.intensity = 0.5 + 0.5 * Math.sin(time * 1.5 + 1.1);
        whiteLight.intensity = 0.3 + 0.2 * Math.sin(time * 2.0 + 2.5);
      };
    }
  }
};

// פונקציה להחלת אפקט אור וצבע
function applyLightAndColorEffect(effect, mesh, scene, composer) {
  // בדיקה אם האפקט קיים
  if (lightAndColorEffects[effect] && lightAndColorEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetLightAndColorEffects(mesh, scene, composer);
    
    // הפעלת האפקט
    lightAndColorEffects[effect].apply(mesh, scene, composer);
    return true;
  }
  return false;
}

// פונקציה לאיפוס אפקטים
function resetLightAndColorEffects(mesh, scene, composer) {
  // איפוס material
  if (mesh.userData.originalMaterial) {
    if (mesh.material) mesh.material.dispose();
    mesh.material = mesh.userData.originalMaterial.clone();
    delete mesh.userData.originalMaterial;
  }
  
  // הסרת passes מותאמים אישית
  if (mesh.userData.customPasses && composer) {
    mesh.userData.customPasses.forEach(pass => {
      pass.enabled = false;
      // הסרת ה-pass מה-composer (אם אפשרי)
      for (let i = 0; i < composer.passes.length; i++) {
        if (composer.passes[i] === pass) {
          composer.passes.splice(i, 1);
          break;
        }
      }
    });
    delete mesh.userData.customPasses;
  }
  
  // הסרת אובייקטים מותאמים אישית
  if (mesh.userData.customObjects) {
    mesh.userData.customObjects.forEach(obj => {
      scene.remove(obj);
    });
    delete mesh.userData.customObjects;
  }
  
  // איפוס פונקציית עדכון
  if (mesh.userData.updateFunction) {
    delete mesh.userData.updateFunction;
  }
}

// ייצוא הפונקציות והאפקטים
window.lightAndColorEffects = lightAndColorEffects;
window.applyLightAndColorEffect = applyLightAndColorEffect;
