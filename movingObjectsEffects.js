// movingObjectsEffects.js - אפקטים של אובייקטים זזים על התמונה

// רשימת האפקטים בקטגוריה זו
const movingObjectsEffects = {
  // אפקט פילם ישן
  oldFilm: {
    name: "פילם ישן",
    value: "oldFilm",
    apply: function(mesh, scene, composer) {
      if (composer) {
        const filmPass = new THREE.FilmPass(0.35, 0.5, 648, false);
        filmPass.enabled = true;
        composer.addPass(filmPass);

        // בדיקה אם NoiseShader קיים ויצירת אובייקט אחיד
        if (THREE.NoiseShader) {
          const noisePass = new THREE.ShaderPass(THREE.NoiseShader);
          if (noisePass && noisePass.uniforms && noisePass.uniforms['amount']) {
            noisePass.uniforms['amount'].value = 0.08;
            noisePass.enabled = true;
            composer.addPass(noisePass);
            
            mesh.userData.customPasses = mesh.userData.customPasses || [];
            mesh.userData.customPasses.push(filmPass, noisePass);
          } else {
            console.warn("NoiseShader קיים אבל uniforms['amount'] חסר");
            mesh.userData.customPasses = mesh.userData.customPasses || [];
            mesh.userData.customPasses.push(filmPass);
          }
        } else {
          console.warn("NoiseShader לא נמצא בספריית THREE");
          mesh.userData.customPasses = mesh.userData.customPasses || [];
          mesh.userData.customPasses.push(filmPass);
        }
      }
    }
  },

  // אפקט שלג
  snow: {
    name: "שלג",
    value: "snow",
    apply: function(mesh, scene, composer) {
      console.log("Applying snow effect", mesh); // debugging

      function getImageBounds(mesh) {
        // וידוא שהמש מכיל גאומטריה תקינה
        if (!mesh.geometry || !mesh.geometry.parameters) {
          console.error("Invalid mesh geometry for snow effect", mesh);
          return {
            minX: -1, maxX: 1,
            minY: -1, maxY: 1,
            z: 0.01
          };
        }

        const width = mesh.geometry.parameters.width;
        const height = mesh.geometry.parameters.height;
        console.log("Snow bounds:", width, height);

        return {
          minX: -width / 2,
          maxX: width / 2,
          minY: -height / 2,
          maxY: height / 2,
          z: 0.01 // נקודה חשובה: אל תשתמש במיקום ה-z של המש, אלא הצב את החלקיקים ממש מעל התמונה
        };
      }

      const bounds = getImageBounds(mesh);

      const snowCount = 1000;
      const snowGeometry = new THREE.BufferGeometry();
      const snowPositions = new Float32Array(snowCount * 3);

      for (let i = 0; i < snowCount * 3; i += 3) {
        snowPositions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        snowPositions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
        snowPositions[i + 2] = bounds.z;
      }

      snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

      const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.8
      });

      // יצירת נקודות השלג והצמדתן לתמונה
      const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
      
      // שמירת מיקום המש המקורי ולא העתקתו - שימוש אבסולוטי
      console.log("Image position:", mesh.position);
      snowParticles.position.z = mesh.position.z + 0.01; // מיקום מעט קדימה
      scene.add(snowParticles);
      
      console.log("Snow particles added to scene at", snowParticles.position);

      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(snowParticles);

      mesh.userData.updateFunction = function(delta, imageBounds) {
        console.log("Updating snow effect");
        const positions = snowGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.01;

          if (positions[i + 1] < bounds.minY || 
              positions[i + 1] > bounds.maxY || 
              positions[i] < bounds.minX || 
              positions[i] > bounds.maxX) {
            positions[i + 1] = bounds.maxY;
            positions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
          }
        }
        snowGeometry.attributes.position.needsUpdate = true;
      };
    }
  },

  // אפקט ניצוצות
  sparkles: {
    name: "ניצוצות",
    value: "sparkles",
    apply: function(mesh, scene, composer) {
      console.log("Applying sparkles effect", mesh); // debugging

      function getImageBounds(mesh) {
        if (!mesh.geometry || !mesh.geometry.parameters) {
          console.error("Invalid mesh geometry for sparkles effect", mesh);
          return {
            minX: -1, maxX: 1,
            minY: -1, maxY: 1,
            z: 0.01
          };
        }

        const width = mesh.geometry.parameters.width;
        const height = mesh.geometry.parameters.height;
        console.log("Sparkle bounds:", width, height);

        return {
          minX: -width / 2,
          maxX: width / 2,
          minY: -height / 2,
          maxY: height / 2,
          z: 0.01
        };
      }

      const bounds = getImageBounds(mesh);

      const sparkleCount = 300;
      const sparkleGeometry = new THREE.BufferGeometry();
      const sparklePositions = new Float32Array(sparkleCount * 3);
      const sparkleColors = new Float32Array(sparkleCount * 3);

      for (let i = 0; i < sparkleCount * 3; i += 3) {
        sparklePositions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        sparklePositions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
        sparklePositions[i + 2] = bounds.z;

        sparkleColors[i] = 0.8 + Math.random() * 0.2;
        sparkleColors[i + 1] = 0.8 + Math.random() * 0.2;
        sparkleColors[i + 2] = 0.8 + Math.random() * 0.2;
      }

      sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
      sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));

      const sparkleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });

      // יצירת חלקיקי הניצוצות
      const sparkleParticles = new THREE.Points(sparkleGeometry, sparkleMaterial);
      
      // שימוש במיקום אבסולוטי במקום העתקת מיקום
      console.log("Image position for sparkles:", mesh.position);
      sparkleParticles.position.x = mesh.position.x;
      sparkleParticles.position.y = mesh.position.y;
      sparkleParticles.position.z = mesh.position.z + 0.01;
      
      scene.add(sparkleParticles);
      console.log("Sparkle particles added at", sparkleParticles.position);

      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(sparkleParticles);

      mesh.userData.updateFunction = function(delta, imageBounds) {
        console.log("Updating sparkles effect");
        sparkleMaterial.opacity = 0.4 + Math.sin(Date.now() * 0.003) * 0.3;
        sparkleParticles.rotation.y = 0; // ביטול סיבוב כדי לשמור על החלקיקים בתוך התמונה

        const positions = sparkleGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          if (positions[i] < bounds.minX || positions[i] > bounds.maxX ||
              positions[i + 1] < bounds.minY || positions[i + 1] > bounds.maxY) {
            positions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
            positions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
          }
        }
        sparkleGeometry.attributes.position.needsUpdate = true;
      };
    }
  },

  // אפקט עשן
  smoke: {
    name: "עשן",
    value: "smoke",
    apply: function(mesh, scene, composer) {
      console.log("Applying smoke effect", mesh);

      function getImageBounds(mesh) {
        // בדיקה אם זו קבוצה עם מסגרת
        let targetMesh = mesh;
        if (mesh.userData && mesh.userData.imagePlane) {
          // אם יש לנו קבוצה, נשתמש ב-imagePlane לקבלת הגיאומטריה
          targetMesh = mesh.userData.imagePlane;
        }
        
        if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
          console.error("Invalid mesh geometry for smoke effect", targetMesh);
          return {
            minX: -1, maxX: 1,
            minY: -1, maxY: 1,
            z: 0.01
          };
        }

        const width = targetMesh.geometry.parameters.width;
        const height = targetMesh.geometry.parameters.height;
        console.log("Smoke bounds:", width, height);

        return {
          minX: -width / 2,
          maxX: width / 2,
          minY: -height / 2,
          maxY: height / 2,
          z: 0.01
        };
      }

      const bounds = getImageBounds(mesh);

      const smokeCount = 100;
      const smokeGeometry = new THREE.BufferGeometry();
      const smokePositions = new Float32Array(smokeCount * 3);
      const smokeSizes = new Float32Array(smokeCount);
      const smokeOpacity = new Float32Array(smokeCount);

      for (let i = 0; i < smokeCount * 3; i += 3) {
        smokePositions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        smokePositions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
        smokePositions[i + 2] = bounds.z;

        const index = i / 3;
        smokeSizes[index] = 0.2 + Math.random() * 0.3;
        smokeOpacity[index] = Math.random() * 0.2;
      }

      smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
      smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
      smokeGeometry.setAttribute('opacity', new THREE.BufferAttribute(smokeOpacity, 1));

      // במקום להשתמש בטקסטורה חיצונית, ניצור טקסטורה בסיסית פשוטה
      console.log("Creating smoke texture");
      const smokeCanvas = document.createElement('canvas');
      smokeCanvas.width = 32;
      smokeCanvas.height = 32;
      const ctx = smokeCanvas.getContext('2d');
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const smokeTexture = new THREE.CanvasTexture(smokeCanvas);

      const smokeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          smokeTexture: { value: smokeTexture }
        },
        vertexShader: `
          attribute float size;
          attribute float opacity;
          varying float vOpacity;
          uniform float time;

          void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * (1.0 + 0.5 * sin(time + position.y * 5.0));
          }
        `,
        fragmentShader: `
          uniform sampler2D smokeTexture;
          varying float vOpacity;

          void main() {
            vec4 texColor = texture2D(smokeTexture, gl_PointCoord);
            gl_FragColor = vec4(0.7, 0.7, 0.7, texColor.a * vOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      // יצירת חלקיקי העשן
      const smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
      
      // שימוש במיקום אבסולוטי
      console.log("Image position for smoke:", mesh.position);
      smokeParticles.position.x = mesh.position.x;
      smokeParticles.position.y = mesh.position.y;
      smokeParticles.position.z = mesh.position.z + 0.01;
      
      scene.add(smokeParticles);

      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(smokeParticles);

      mesh.userData.updateFunction = function(delta, imageBounds) {
        smokeMaterial.uniforms.time.value += delta;

        const positions = smokeGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.01;

          if (positions[i + 1] > bounds.maxY || 
              positions[i + 1] < bounds.minY || 
              positions[i] < bounds.minX || 
              positions[i] > bounds.maxX) {
            positions[i + 1] = bounds.minY;
            positions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
          }
        }
        smokeGeometry.attributes.position.needsUpdate = true;
      };
    }
  },

  // אפקט בועות
  bubbles: {
    name: "בועות",
    value: "bubbles",
    apply: function(mesh, scene, composer) {
      function getImageBounds(mesh) {
        // בדיקה אם זו קבוצה עם מסגרת
        let targetMesh = mesh;
        if (mesh.userData && mesh.userData.imagePlane) {
          // אם יש לנו קבוצה, נשתמש ב-imagePlane לקבלת הגיאומטריה
          targetMesh = mesh.userData.imagePlane;
        }
        
        if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
          console.error("Invalid mesh geometry for bubbles effect", targetMesh);
          return {
            minX: -1, maxX: 1,
            minY: -1, maxY: 1,
            z: mesh.position.z + 0.01
          };
        }
        
        const width = targetMesh.geometry.parameters.width;
        const height = targetMesh.geometry.parameters.height;
        return {
          minX: -width / 2,
          maxX: width / 2,
          minY: -height / 2,
          maxY: height / 2,
          z: mesh.position.z + 0.01
        };
      }

      const bounds = getImageBounds(mesh);

      const bubbleCount = 150;
      const bubbleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });

      const bubbles = [];
      const bubbleGroup = new THREE.Group();
      bubbleGroup.position.copy(mesh.position);
      bubbleGroup.position.z += 0.01;
      scene.add(bubbleGroup);

      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial.clone());

        // מיקום יחסי לקבוצה (שכבר ממוקמת במיקום התמונה)
        bubble.position.set(
          Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
          Math.random() * (bounds.maxY - bounds.minY) + bounds.minY,
          0
        );

        const scale = 0.3 + Math.random() * 0.7;
        bubble.scale.set(scale, scale, scale);

        bubble.userData.speed = 0.1 + Math.random() * 0.3;

        bubbleGroup.add(bubble);
        bubbles.push(bubble);
      }

      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(bubbleGroup);
      mesh.userData.customObjects = mesh.userData.customObjects.concat(bubbles);

      mesh.userData.updateFunction = function(delta, imageBounds) {
        bubbles.forEach(bubble => {
          bubble.position.y += bubble.userData.speed * delta;

          // הגבלה מחמירה: החזרת בועה שיצאה מכל גבול
          if (bubble.position.y > bounds.maxY || 
              bubble.position.y < bounds.minY || 
              bubble.position.x < bounds.minX || 
              bubble.position.x > bounds.maxX) {
            bubble.position.y = bounds.minY;
            bubble.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
            // שינוי קל בגודל ובמהירות בכל פעם שבועה מתאפסת
            const scale = 0.3 + Math.random() * 0.7;
            bubble.scale.set(scale, scale, scale);
            bubble.userData.speed = 0.1 + Math.random() * 0.3;
          }
        });
      };
    }
  },

  // אפקט גשם
  rain: {
    name: "גשם",
    value: "rain",
    apply: function(mesh, scene, composer) {
      function getImageBounds(mesh) {
        // בדיקה אם זו קבוצה עם מסגרת
        let targetMesh = mesh;
        if (mesh.userData && mesh.userData.imagePlane) {
          // אם יש לנו קבוצה, נשתמש ב-imagePlane לקבלת הגיאומטריה
          targetMesh = mesh.userData.imagePlane;
        }
        
        if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
          console.error("Invalid mesh geometry for rain effect", targetMesh);
          return {
            minX: -1, maxX: 1,
            minY: -1, maxY: 1,
            z: mesh.position.z + 0.01
          };
        }
        
        const width = targetMesh.geometry.parameters.width;
        const height = targetMesh.geometry.parameters.height;
        return {
          minX: -width / 2,
          maxX: width / 2,
          minY: -height / 2,
          maxY: height / 2,
          z: mesh.position.z + 0.01
        };
      }

      const bounds = getImageBounds(mesh);

      const rainCount = 1000;
      const rainGeometry = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      const rainVelocities = new Float32Array(rainCount);

      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        rainPositions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
        rainPositions[i + 2] = bounds.z;

        rainVelocities[i / 3] = 0.1 + Math.random() * 0.2;
      }

      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

      const rainMaterial = new THREE.LineBasicMaterial({
        color: 0x9999aa,
        transparent: true,
        opacity: 0.7
      });

      // שיטה חדשה: יצירת קבוצת גשם שתיצמד למיקום התמונה
      const rainGroup = new THREE.Group();
      rainGroup.position.copy(mesh.position);
      // חשוב מאוד: מיקום הגשם קדימה יותר מהתמונה בציר ה-Z
      rainGroup.position.z = mesh.position.z + 0.05;
      scene.add(rainGroup);

      const rain = [];
      for (let i = 0; i < rainCount; i++) {
        const lineGeometry = new THREE.BufferGeometry();
        
        // הנקודה הראשונה תהיה נקודת ההתחלה (נשארת בגבולות)
        const start = new THREE.Vector3(
          rainPositions[i * 3],
          rainPositions[i * 3 + 1],
          rainPositions[i * 3 + 2] - mesh.position.z
        );
        
        // הקו מתמשך כלפי מטה אבל תמיד בגבולות התמונה
        const end = start.clone();
        const dropLength = Math.min(0.2, (bounds.maxY - start.y) * 0.3); // מגביל את אורך הטיפה
        end.y -= dropLength;

        const vertices = new Float32Array([
          start.x, start.y, start.z,
          end.x, end.y, end.z
        ]);

        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const line = new THREE.Line(lineGeometry, rainMaterial);
        rainGroup.add(line);
        rain.push({
          line: line,
          velocity: rainVelocities[i]
        });
      }

      mesh.userData.customObjects = mesh.userData.customObjects || [];
      mesh.userData.customObjects.push(rainGroup);
      mesh.userData.customObjects = mesh.userData.customObjects.concat(rain.map(r => r.line));

      mesh.userData.updateFunction = function(delta, imageBounds) {
        rain.forEach(drop => {
          const positions = drop.line.geometry.attributes.position.array;

          positions[1] -= drop.velocity * 0.5;
          positions[4] -= drop.velocity * 0.5;

          // בדיקת כל הגבולות
          if (positions[1] < bounds.minY || 
              positions[1] > bounds.maxY || 
              positions[0] < bounds.minX || 
              positions[0] > bounds.maxX) {
            const resetY = bounds.maxY;
            const resetX = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;

            positions[0] = resetX;
            positions[1] = resetY;
            positions[3] = resetX;
            positions[4] = resetY - Math.min(0.2, (bounds.maxY - bounds.minY) * 0.3);
          }

          drop.line.geometry.attributes.position.needsUpdate = true;
        });
      };
    }
  }
};

// פונקציה להחלת אפקט אובייקטים זזים
function applyMovingObjectsEffect(effect, mesh, scene, composer) {
  console.log(`מנסה להחיל אפקט אובייקטים זזים: ${effect}`, mesh);
  
  // בדיקה אם זו קבוצה עם מסגרת (מהשינוי החדש) או mesh בודד
  let actualImageMesh = mesh;
  
  if (movingObjectsEffects[effect] && movingObjectsEffects[effect].apply) {
    // לפני החלת אפקט חדש, מנקים אפקטים קודמים
    resetMovingObjectsEffects(mesh, scene, composer);
    
    // החלת האפקט עם התמיכה במבנה החדש
    movingObjectsEffects[effect].apply(mesh, scene, composer);
    return true;
  }
  
  return false;
}

// פונקציה לאיפוס אפקטים
function resetMovingObjectsEffects(mesh, scene, composer) {
  if (mesh.userData.customObjects) {
    mesh.userData.customObjects.forEach(obj => {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    delete mesh.userData.customObjects;
  }

  if (mesh.userData.customPasses && composer) {
    mesh.userData.customPasses.forEach(pass => {
      pass.enabled = false;
      for (let i = 0; i < composer.passes.length; i++) {
        if (composer.passes[i] === pass) {
          composer.passes.splice(i, 1);
          break;
        }
      }
    });
    delete mesh.userData.customPasses;
  }

  if (mesh.userData.updateFunction) {
    delete mesh.userData.updateFunction;
  }
}

// ייצוא הפונקציות והאפקטים
window.movingObjectsEffects = movingObjectsEffects;
window.applyMovingObjectsEffect = applyMovingObjectsEffect;