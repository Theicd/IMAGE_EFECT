// smokeEffect.js - אפקט עשן

window.smokeEffect = {
  name: "עשן",
  value: "smoke",
  apply: function(mesh, scene, composer) {
    console.log("Applying smoke effect..."); // לוג לבדיקת טעינת הסקריפט

    function getImageBounds(mesh) {
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
      }
      
      if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
        console.error("Invalid mesh geometry for smoke effect", targetMesh);
        return { minX: -1, maxX: 1, minY: -1, maxY: 1, z: mesh.position.z + 0.01 };
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

    // יצירת טקסטורת עשן (Canvas)
    const smokeCanvas = document.createElement('canvas');
    smokeCanvas.width = 128;
    smokeCanvas.height = 128;
    const ctx = smokeCanvas.getContext('2d');
    
    // גרדיאנט המדמה כתם עשן עדין עם מרכז פחות בהיר
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    // הקטנו משמעותית את האלפא במרכז
    gradient.addColorStop(0, 'rgba(220, 220, 220, 0.3)');
    gradient.addColorStop(0.3, 'rgba(180, 180, 180, 0.2)');
    gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const smokeTexture = new THREE.CanvasTexture(smokeCanvas);

    // שיידר ורטקס לעשן
    const smokeVertexShader = `
    attribute float size;
    attribute float alpha;
    varying float vAlpha;
    uniform float time;
    void main() {
      vAlpha = alpha;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      // הקטנו את מקדם הגודל כדי שהעשן לא יהיה עצום
      gl_PointSize = max(1.0, size * (100.0 / -mvPosition.z));
      gl_Position = projectionMatrix * mvPosition;
    }
    `;

    // שיידר פרגמנט לעשן
    const smokeFragmentShader = `
    uniform sampler2D smokeTexture;
    varying float vAlpha;
    void main() {
      vec4 texColor = texture2D(smokeTexture, gl_PointCoord);
      vec4 color = vec4(texColor.rgb, texColor.a * vAlpha);
      
      // סינון פיקסלים כמעט שקופים
      if (color.a < 0.02) discard;
      gl_FragColor = color;
    }
    `;
    
    const smokeGeometry = new THREE.BufferGeometry();
    const smokeCount = 80;
    const positions = new Float32Array(smokeCount * 3);
    const sizes = new Float32Array(smokeCount);
    const alphas = new Float32Array(smokeCount);
    const velocities = [];
    
    for (let i = 0; i < smokeCount; i++) {
      positions[i * 3] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      positions[i * 3 + 1] = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
      positions[i * 3 + 2] = bounds.z;
      
      // הקטנו את טווח הגודל הבסיסי
      sizes[i] = Math.random() * 15 + 15;  // 15-30
      // הקטנו את טווח האלפא הבסיסי
      alphas[i] = Math.random() * 0.2 + 0.1; // 0.1-0.3
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.03 - 0.01
      });
    }
    
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    smokeGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    smokeGeometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    const smokeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        smokeTexture: { value: smokeTexture }
      },
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      alphaTest: 0.001
    });
    
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
    scene.add(smoke);
    
    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(smoke);
    
    mesh.userData.updateFunction = function(delta) {
      smokeMaterial.uniforms.time.value += delta;
      
      const positions = smokeGeometry.attributes.position.array;
      const sizes = smokeGeometry.attributes.size.array;
      const alphas = smokeGeometry.attributes.alpha.array;
      
      for (let i = 0; i < smokeCount; i++) {
        positions[i * 3]     += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        
        // הקטנו את קצב הגדילה
        sizes[i] += 0.02;
        // הקטנו את קצב הדהייה
        alphas[i] -= 0.0008;
        
        // בדיקה אם החלקיק נעלם או יצא מהתחום
        if (alphas[i] <= 0 ||
            positions[i * 3] < bounds.minX - 0.2 || positions[i * 3] > bounds.maxX + 0.2 ||
            positions[i * 3 + 1] < bounds.minY - 0.2 || positions[i * 3 + 1] > bounds.maxY + 0.2) {
          
          positions[i * 3] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
          positions[i * 3 + 1] = bounds.minY + Math.random() * (0.3 * (bounds.maxY - bounds.minY));
          positions[i * 3 + 2] = bounds.z;
          
          sizes[i] = Math.random() * 15 + 15;
          alphas[i] = Math.random() * 0.2 + 0.1;
          
          velocities[i] = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.03 - 0.01
          };
        }
      }
      
      smokeGeometry.attributes.position.needsUpdate = true;
      smokeGeometry.attributes.size.needsUpdate = true;
      smokeGeometry.attributes.alpha.needsUpdate = true;
    };
    
    console.log("Smoke effect applied successfully.");
  }
};
