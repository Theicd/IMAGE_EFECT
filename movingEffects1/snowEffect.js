// snowEffect.js - אפקט שלג

// הגדרת האפקט ישירות כאובייקט גלובלי
window.snowEffect = {
  name: "שלג",
  value: "snow",
  apply: function(mesh, scene, composer) {
    function getImageBounds(mesh) {
      // בדיקה אם זו קבוצה עם מסגרת
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        // אם יש לנו קבוצה, נשתמש ב-imagePlane לקבלת הגיאומטריה
        targetMesh = mesh.userData.imagePlane;
      }
      
      if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
        console.error("Invalid mesh geometry for snow effect", targetMesh);
        return { minX: -1, maxX: 1, minY: -1, maxY: 1, z: 0.01 };
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
    
    // יצירת טקסטורת פתית שלג באמצעות canvas
    function createSnowflakeTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      // מילוי רקע שקוף
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // יצירת גרדיאנט מעגלי לאפקט זוהר עדין
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.5, 'rgba(240, 240, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(230, 230, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      return new THREE.CanvasTexture(canvas);
    }
    
    const snowGeometry = new THREE.BufferGeometry();
    const snowParticleCount = 800;
    const positions = new Float32Array(snowParticleCount * 3);
    const sizes = new Float32Array(snowParticleCount);
    
    for (let i = 0; i < snowParticleCount * 3; i += 3) {
      positions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      positions[i + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
      positions[i + 2] = bounds.z;
      // גדלים קטנים יותר של פתיתי שלג
      sizes[i / 3] = Math.random() * 0.2 + 0.1; // גודל אקראי בין 0.1 ל-0.3
    }
    
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const snowflakeTexture = createSnowflakeTexture();
    
    // הגדרה של vertex shader לשליטה בגודל הפתיתים
    const vertexShader = `
      attribute float size;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    
    // הגדרה של fragment shader לשליטה במראה הפתיתים
    const fragmentShader = `
      uniform sampler2D snowTexture;
      void main() {
        vec4 color = texture2D(snowTexture, gl_PointCoord);
        if (color.a < 0.3) discard;
        gl_FragColor = color;
      }
    `;
    
    // שימוש בחומר shader מותאם אישית
    const snowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        snowTexture: { value: snowflakeTexture }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
    snowParticles.position.copy(mesh.position);
    snowParticles.position.z = mesh.position.z + 0.05; // מיקום מעט לפני המש
    scene.add(snowParticles);
    
    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(snowParticles);
    
    // פונקציית עדכון לתנועת השלג
    mesh.userData.updateFunction = function(delta) {
      const positions = snowParticles.geometry.attributes.position.array;
      const velocity = delta * 0.3; // מהירות יחסית לפריים
      
      for (let i = 0; i < positions.length; i += 3) {
        // הורדת פתיתי השלג מטה
        positions[i + 1] -= Math.random() * velocity * 0.8 + velocity * 0.2;
        // תזוזה קלה הצידה - אפקט התנודדות
        positions[i] += Math.sin((Date.now() * 0.001 + i) * 0.1) * 0.003;
        
        // החזרת פתיתים שהגיעו לתחתית התמונה חזרה למעלה
        if (positions[i + 1] < bounds.minY) {
          positions[i + 1] = bounds.maxY;
          positions[i] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        }
        
        // החזרת פתיתים שיצאו מהצדדים
        if (positions[i] < bounds.minX) positions[i] = bounds.minX;
        if (positions[i] > bounds.maxX) positions[i] = bounds.maxX;
      }
      
      snowParticles.geometry.attributes.position.needsUpdate = true;
    };
  }
};
