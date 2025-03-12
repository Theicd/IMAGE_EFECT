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
      // בדיקה אם זו קבוצה עם מסגרת - זה לא משנה כאן כי UnrealBloomPass מתייחס לכל הסצנה
      // אבל בכל זאת נשמור על עקביות בקוד
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט זוהר");
      }
      
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
      pointLight.position.set(0, 0, targetMesh.position.z - 2);
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
      // בדיקה אם יש material
      let targetMesh = mesh;
      
      // בדיקה אם זו קבוצה עם מסגרת (מהשינוי החדש)
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
        console.log("משתמש ב-imagePlane לאפקט שינוי גוון");
      }
      
      // שמירה על המטריאל המקורי, גם אם לא נשתמש בו ישירות
      if (targetMesh.material) {
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
      }
      
      if (composer) {
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
    apply: function(mesh, scene, composer) {
      // קביעת מיקום ה-Z של התמונה
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
      }
      
      // שמירת ה-material המקורי
      if (targetMesh.material) {
        targetMesh.userData.originalMaterial = targetMesh.material.clone();
        
        // יצירת material שמשתנה עם הזמן
        const newMaterial = new THREE.MeshBasicMaterial({
          map: targetMesh.material.map,
          color: 0xffffff,
          transparent: true,
          opacity: 1.0
        });
        
        // החלפת ה-material
        targetMesh.material = newMaterial;
      }
      
      console.log("מחיל אפקט הבהוב אור מסוג ניאון");
      
      // קביעת מיקום מדויק של האורות יחסית לתמונה
      const imagePos = new THREE.Vector3();
      targetMesh.getWorldPosition(imagePos);
      
      // יצירת אורות ניאון צבעוניים עם עוצמה גבוהה יותר
      const redLight = new THREE.PointLight(0xff0077, 5.0, 4);
      redLight.position.set(imagePos.x - 0.5, imagePos.y + 0.5, imagePos.z - 0.2);
      scene.add(redLight);
      
      const blueLight = new THREE.PointLight(0x00ffff, 5.0, 4);
      blueLight.position.set(imagePos.x + 0.5, imagePos.y - 0.5, imagePos.z - 0.2);
      scene.add(blueLight);
      
      // שמירת המשתנים לניקוי מאוחר יותר
      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(redLight, blueLight);
      
      // מערך צבעים לשינויים מחזוריים
      const colors = [
        new THREE.Color(0xff0077),  // ורוד
        new THREE.Color(0x00ffff),  // טורקיז
        new THREE.Color(0xbb00ff),  // סגול
        new THREE.Color(0x55ffbb),  // ירוק-טורקיז
        new THREE.Color(0xffaa00)   // כתום
      ];
      
      // שמירת הזמן ההתחלתי
      const startTime = Date.now();
      
      // פונקציית עדכון עם אנימציה דרמטית יותר
      mesh.userData.updateFunction = function(delta) {
        const elapsedTime = (Date.now() - startTime) * 0.001; // זמן בשניות
        
        // הבהוב אורות עם עוצמה משתנה והבזקים מדי פעם
        const pulseR = 2.5 + 2.0 * Math.sin(elapsedTime * 3.5);
        const pulseB = 2.5 + 2.0 * Math.sin(elapsedTime * 4.2 + 1.1);
        
        // הוספת הבזקים אקראיים
        if (Math.random() > 0.95) {
          redLight.intensity = 10.0;
          setTimeout(() => { redLight.intensity = pulseR; }, 50);
        } else {
          redLight.intensity = pulseR;
        }
        
        if (Math.random() > 0.95) {
          blueLight.intensity = 10.0;
          setTimeout(() => { blueLight.intensity = pulseB; }, 50);
        } else {
          blueLight.intensity = pulseB;
        }
        
        // החלפת צבעים בתמונה עצמה
        if (targetMesh.material && targetMesh.material.color) {
          // מחזור בין הצבעים
          const colorIndex = Math.floor(elapsedTime * 2) % colors.length;
          const nextColorIndex = (colorIndex + 1) % colors.length;
          
          // אינטרפולציה בין שני צבעים
          const mixRatio = (elapsedTime * 2) % 1;
          const currentColor = new THREE.Color().copy(colors[colorIndex]);
          currentColor.lerp(colors[nextColorIndex], mixRatio);
          
          // הוספת פקטור לבן למתן את הצבע
          const white = new THREE.Color(0xffffff);
          const finalColor = currentColor.clone().lerp(white, 0.5);
          
          // עדכון צבע התמונה
          targetMesh.material.color.copy(finalColor);
          
          // שינוי האטימות לאפקט הבהוב
          targetMesh.material.opacity = 0.7 + 0.3 * Math.sin(elapsedTime * 5.0);
        }
      };
    }
  },
};

// פונקציה להחלת אפקט אור וצבע
function applyLightAndColorEffect(effect, mesh, scene, composer) {
  // בדיקה אם האפקט קיים
  if (lightAndColorEffects[effect] && lightAndColorEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetLightAndColorEffects(mesh, scene, composer);
    
    // בדיקה אם זו קבוצה עם מסגרת (מהשינוי החדש) או mesh בודד
    let targetMesh = mesh;
    
    // אם יש שדה userData.imagePlane, זה אומר שזוהי קבוצה עם מסגרת
    if (mesh.userData && mesh.userData.imagePlane) {
      // לאפקטים של אור וצבע נשתמש ב-imagePlane כי הוא מכיל את ה-material של התמונה
      targetMesh = mesh.userData.imagePlane;
      console.log("משתמש ב-imagePlane לאפקט אור וצבע:", effect);
    }
    
    // הפעלת האפקט
    lightAndColorEffects[effect].apply(targetMesh, scene, composer);
    return true;
  }
  return false;
}

// פונקציה לאיפוס אפקטים
function resetLightAndColorEffects(mesh, scene, composer) {
  // בדיקה אם זו קבוצה עם מסגרת
  let targetMesh = mesh;
  let rootMesh = mesh; // שמירה על ההפניה למש המקורי/קבוצה
  
  if (mesh.userData && mesh.userData.imagePlane) {
    // אם יש לנו קבוצה, נבדוק גם את ה-imagePlane לאיפוס ה-material
    targetMesh = mesh.userData.imagePlane;
  }
  
  // איפוס material
  if (targetMesh.userData && targetMesh.userData.originalMaterial) {
    console.log("איפוס ה-material המקורי");
    if (targetMesh.material) targetMesh.material.dispose();
    targetMesh.material = targetMesh.userData.originalMaterial.clone();
    delete targetMesh.userData.originalMaterial;
  }
  
  // הסרת passes מותאמים אישית
  // בדיקה גם ב-rootMesh וגם ב-targetMesh
  [rootMesh, targetMesh].forEach(msh => {
    if (msh.userData && msh.userData.customPasses && composer) {
      console.log(`מוחק ${msh.userData.customPasses.length} passes מותאמים אישית`);
      msh.userData.customPasses.forEach(pass => {
        pass.enabled = false;
        
        // הסרת ה-pass מה-composer (אם אפשרי)
        for (let i = 0; i < composer.passes.length; i++) {
          if (composer.passes[i] === pass) {
            console.log(`הסרת pass מהמיקום ${i} בתוך composer`);
            composer.passes.splice(i, 1);
            i--; // התאמת האינדקס אחרי הסרה
          }
        }
      });
      delete msh.userData.customPasses;
    }
  });
  
  // הסרת אובייקטים מותאמים אישית (אורות וכו')
  // בדיקה גם ב-rootMesh וגם ב-targetMesh
  [rootMesh, targetMesh].forEach(msh => {
    if (msh.userData && msh.userData.customObjects) {
      console.log(`מוחק ${msh.userData.customObjects.length} אובייקטים מותאמים אישית`);
      msh.userData.customObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.dispose) obj.dispose();
      });
      delete msh.userData.customObjects;
    }
  });
  
  // איפוס פונקציות עדכון
  // בדיקה גם ב-rootMesh וגם ב-targetMesh
  [rootMesh, targetMesh].forEach(msh => {
    if (msh.userData && msh.userData.updateFunction) {
      delete msh.userData.updateFunction;
    }
  });
  
  // איפוס Composer - חשוב ביותר!
  if (composer) {
    // שמירת המעבר הראשון בלבד (RenderPass)
    // ואיפוס כל שאר המעברים
    while (composer.passes.length > 1) {
      const passToRemove = composer.passes[composer.passes.length - 1];
      composer.passes.pop();
      if (passToRemove.dispose) passToRemove.dispose();
    }
  }
}

// ייצוא הפונקציות והאפקטים
window.lightAndColorEffects = lightAndColorEffects;
window.applyLightAndColorEffect = applyLightAndColorEffect;
