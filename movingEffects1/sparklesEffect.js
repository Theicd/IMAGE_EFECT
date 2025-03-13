// sparklesEffect.js - אפקט ניצוץ כוכבים ריאליסטי

window.sparklesEffect = {
  name: "ניצוצות",
  value: "sparkles",
  apply: function(mesh, scene, composer) {
    // פונקציה לקבלת גבולות התמונה (או המסגרת)
    function getImageBounds(mesh) {
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
      }
      
      if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
        console.error("Invalid mesh geometry for sparkles effect", targetMesh);
        return { minX: -1, maxX: 1, minY: -1, maxY: 1, z: mesh.position.z + 0.01 };
      }
      
      const width = targetMesh.geometry.parameters.width;
      const height = targetMesh.geometry.parameters.height;
      return {
        minX: -width / 2,
        maxX: width / 2,
        minY: -height / 2,
        maxY: height / 2,
        z: mesh.position.z + 0.01,
        width: width,
        height: height
      };
    }
    
    const bounds = getImageBounds(mesh);
    
    // ------------------------------------------------------
    // 1) יצירת טקסטורת ניצוץ דמוית כוכב
    // ------------------------------------------------------
    const sparkleCanvas = document.createElement('canvas');
    sparkleCanvas.width = 16;
    sparkleCanvas.height = 16;
    const ctx = sparkleCanvas.getContext('2d');
    
    // ניקוי הקנבס
    ctx.clearRect(0, 0, 16, 16);
    
    // גרדיאנט מרכז בהיר, דועך מהר החוצה
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');   // מרכז בהיר
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    
    // ציור קרניים ארוכות וחדות יותר
    ctx.save();
    ctx.translate(8, 8);
    ctx.beginPath();
    
    // הגדלנו ל-12 קרניים
    const raysCount = 12;
    for (let i = 0; i < raysCount; i++) {
      const angle = (i / raysCount) * Math.PI * 2;
      const innerRadius = 1; 
      const outerRadius = 6;  // קרן ארוכה ודקה
      ctx.moveTo(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle));
      ctx.lineTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.restore();
    
    const sparkleTexture = new THREE.CanvasTexture(sparkleCanvas);
    
    // ------------------------------------------------------
    // 2) יצירת טקסטורת רעש עדינה
    // ------------------------------------------------------
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 256;
    noiseCanvas.height = 256;
    const noiseCtx = noiseCanvas.getContext('2d');
    
    const imageData = noiseCtx.createImageData(256, 256);
    const data = imageData.data;
    
    // רעש עדין בגווני אפור
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 50);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    noiseCtx.putImageData(imageData, 0, 0);
    
    const noiseTexture = new THREE.CanvasTexture(noiseCanvas);
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;
    
    // ------------------------------------------------------
    // 3) הגדרת שיידרים (Vertex + Fragment)
    // ------------------------------------------------------
    const sparkleVertexShader = `
    attribute float size;
    attribute float speed;
    attribute float sparkleType;
    attribute vec3 color;
    attribute float alpha;
    attribute vec3 velocity;
    attribute float rotation;
    
    uniform float time;
    
    varying float vAlpha;
    varying vec3 vColor;
    varying float vSparkleType;
    varying float vRotation;
    
    void main() {
      // אפקט בהוב מחזורי עדין
      float pulse = 0.8 + 0.2 * sin(time * speed + rotation);
      vAlpha = alpha * pulse;
      vColor = color;
      vSparkleType = sparkleType;
      
      // סיבוב כוכב עדין
      vRotation = rotation + time * 0.5;
      
      // תנועה מינורית של החלקיק
      vec3 pos = position;
      pos.xy += velocity.xy * sin(time * speed) * 0.02;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dynamicSize = size * pulse;
      
      // הגדרת גודל נקודת החלקיק (ככל שהחלקיק קרוב, גדול יותר)
      gl_PointSize = dynamicSize * (150.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
    `;
    
    const sparkleFragmentShader = `
    uniform sampler2D sparkleTexture;
    uniform sampler2D noiseTexture;
    uniform float time;
    
    varying float vAlpha;
    varying vec3 vColor;
    varying float vSparkleType;
    varying float vRotation;
    
    void main() {
      // חישוב קואורדינטות UV מסתובבות עבור הטקסטורה
      vec2 center = vec2(0.5, 0.5);
      vec2 uv = gl_PointCoord - center;
      float cosR = cos(vRotation);
      float sinR = sin(vRotation);
      vec2 rotatedUV = vec2(
        uv.x * cosR - uv.y * sinR,
        uv.x * sinR + uv.y * cosR
      ) + center;
      
      // דגימת טקסטורת הניצוץ
      vec4 texColor = texture2D(sparkleTexture, rotatedUV);
      
      // דגימת רעש עדין להוספת תחושת “ריצוד”
      float noise = texture2D(noiseTexture, rotatedUV * 2.0 + vec2(time * 0.05)).r;
      noise = 0.9 + noise * 0.1;
      
      // שינוי צבע עדין עם הזמן (גוון “חי”)
      vec3 finalColor = vColor;
      float hueShift = sin(time * 0.3 + vSparkleType * 3.14) * 0.03;
      finalColor += vec3(hueShift);
      
      // הרכבת הצבע הסופי
      vec4 color = vec4(finalColor, vAlpha) * texColor * noise;
      
      // הסרת פיקסלים כמעט שקופים
      if (color.a < 0.15) discard;
      
      gl_FragColor = color;
    }
    `;
    
    // ------------------------------------------------------
    // 4) הגדרת גיאומטריית חלקיקים ונתונים לכל חלקיק
    // ------------------------------------------------------
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 1200;
    
    const positions = new Float32Array(sparkleCount * 3);
    const colors = new Float32Array(sparkleCount * 3);
    const sizes = new Float32Array(sparkleCount);
    const alphas = new Float32Array(sparkleCount);
    const velocities = new Float32Array(sparkleCount * 3);
    const speeds = new Float32Array(sparkleCount);
    const sparkleTypes = new Float32Array(sparkleCount);
    const rotations = new Float32Array(sparkleCount);
    
    // ערכי בסיס שנשמרים לצורך הבהוב מחזורי (ללא “קפיצה”)
    const baseSizes = new Float32Array(sparkleCount);
    const baseAlphas = new Float32Array(sparkleCount);
    
    for (let i = 0; i < sparkleCount; i++) {
      let x, y, z;
      
      // פיזור אחוזי חלקיקים בשלושה אזורים שונים סביב התמונה
      if (i < sparkleCount * 0.7) {
        x = (Math.random() * 2 - 1) * bounds.width * 0.55;
        y = (Math.random() * 2 - 1) * bounds.height * 0.55;
        z = bounds.z + (Math.random() * 0.1 - 0.05);
      } else if (i < sparkleCount * 0.9) {
        const angle = Math.random() * Math.PI * 2;
        const border = 0.05;
        const radiusX = (bounds.width / 2) * (1.0 - border + Math.random() * border * 2);
        const radiusY = (bounds.height / 2) * (1.0 - border + Math.random() * border * 2);
        x = Math.cos(angle) * radiusX;
        y = Math.sin(angle) * radiusY;
        z = bounds.z + (Math.random() * 0.05);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(bounds.width, bounds.height) * (0.6 + Math.random() * 0.4);
        x = Math.cos(angle) * radius * 0.5;
        y = Math.sin(angle) * radius * 0.5;
        z = bounds.z + (Math.random() * 0.15);
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // בחירת צבעים בהירים עם גוונים עדינים
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        colors[i * 3] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
      } else if (colorChoice < 0.85) {
        colors[i * 3] = 0.75 + Math.random() * 0.25;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
      }
      
      // גודל בסיסי
      const baseSize = Math.random() * 0.6 + 0.4;
      sizes[i] = baseSize;
      baseSizes[i] = baseSize;
      
      // שקיפות בסיסית
      const baseAlpha = Math.random() * 0.3 + 0.7;
      alphas[i] = baseAlpha;
      baseAlphas[i] = baseAlpha;
      
      speeds[i] = Math.random() * 1.0 + 0.5;
      sparkleTypes[i] = Math.random();
      
      // מהירות תנועה מינורית
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * 0.005;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * 0.005;
      velocities[i * 3 + 2] = Math.cos(phi) * 0.002;
      
      // זווית התחלתית
      rotations[i] = Math.random() * Math.PI * 2;
    }
    
    // הצבת המערכים בגיאומטריה
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    sparkleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    sparkleGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    sparkleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    sparkleGeometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    sparkleGeometry.setAttribute('sparkleType', new THREE.BufferAttribute(sparkleTypes, 1));
    sparkleGeometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
    
    // ------------------------------------------------------
    // 5) הגדרת ShaderMaterial
    // ------------------------------------------------------
    const sparkleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sparkleTexture: { value: sparkleTexture },
        noiseTexture: { value: noiseTexture },
        time: { value: 0.0 }
      },
      vertexShader: sparkleVertexShader,
      fragmentShader: sparkleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // יצירת אובייקט החלקיקים והוספה לסצנה
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);
    
    // ------------------------------------------------------
    // 6) התאמת Bloom (לא חובה, רק אם משתמשים ב-Compostion עם UnrealBloomPass)
    // ------------------------------------------------------
    if (composer) {
      const bloomPass = composer.passes.find(pass => pass.name === "UnrealBloomPass");
      if (bloomPass) {
        bloomPass.strength = 0.7;
        bloomPass.radius = 0.3;
        bloomPass.threshold = 0.4;
      }
    }
    
    // שמירת אובייקט החלקיקים במשתמש הנתונים של ה-mesh
    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(sparkles);
    
    // חישוב זמן התחלתי
    const startTime = Date.now() * 0.001;
    
    // ------------------------------------------------------
    // 7) פונקציית עדכון פריים - אפקט ניצנוץ מחזורי
    // ------------------------------------------------------
    mesh.userData.updateFunction = function(delta, meshBounds) {
      const elapsedTime = Date.now() * 0.001 - startTime;
      sparkleMaterial.uniforms.time.value = elapsedTime;
      
      // ניגשים למערכים הרלוונטיים מהגיאומטריה
      for (let i = 0; i < sparkleCount; i++) {
        const idx = i * 3;
        const speed = speeds[i];
        
        // תנועה מינורית
        positions[idx] += velocities[idx] * Math.sin(elapsedTime * speed + i) * delta * 0.05;
        positions[idx + 1] += velocities[idx + 1] * Math.cos(elapsedTime * speed + i * 0.7) * delta * 0.05;
        
        // עדכון גודל מחזורי על בסיס הגודל הבסיסי
        const twinkleFactor = 0.8 + 0.2 * Math.sin(elapsedTime * speed + i);
        sizes[i] = baseSizes[i] * twinkleFactor;
        
        // עדכון שקיפות מחזורי על בסיס השקיפות הבסיסית
        const alphaTwinkle = 0.7 + 0.3 * Math.sin(elapsedTime * speed + i + 1.0);
        alphas[i] = baseAlphas[i] * alphaTwinkle;
        
        // בדיקה אם חלקיק יצא מהתחום והחזרתו למרכז
        const maxBound = Math.max(bounds.width, bounds.height) * 0.6;
        const distFromCenter = Math.sqrt(
          positions[idx] * positions[idx] + 
          positions[idx + 1] * positions[idx + 1]
        );
        if (distFromCenter > maxBound) {
          const angle = Math.random() * Math.PI * 2;
          const newRadius = Math.random() * maxBound * 0.7;
          positions[idx] = Math.cos(angle) * newRadius;
          positions[idx + 1] = Math.sin(angle) * newRadius;
          
          // עדכון וקטור מהירות חדש
          const newTheta = Math.random() * Math.PI * 2;
          velocities[idx] = Math.cos(newTheta) * 0.005;
          velocities[idx + 1] = Math.sin(newTheta) * 0.005;
        }
      }
      
      // עדכון ערכי הגיאומטריה ברנדור
      sparkleGeometry.attributes.position.needsUpdate = true;
      sparkleGeometry.attributes.size.needsUpdate = true;
      sparkleGeometry.attributes.alpha.needsUpdate = true;
    };
  }
};
