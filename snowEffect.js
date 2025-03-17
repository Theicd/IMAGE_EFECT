// snowEffect.js - גרסה עם תחושת ריחוף עדינה

window.snowEffect = {
  name: "שלג",
  value: "snow",
  apply: function(mesh, scene, composer, isPreview = false) {
    const getBounds = () => {
      const target = mesh.userData?.imagePlane || mesh;
      return target.geometry?.parameters ? {
        minX: -target.geometry.parameters.width/1.2,
        maxX: target.geometry.parameters.width/1.2,
        minY: -target.geometry.parameters.height/1.2,
        maxY: target.geometry.parameters.height/1.2,
        z: mesh.position.z + 0.1
      } : {
        minX: -10, maxX: 10,
        minY: -10, maxY: 10,
        z: mesh.position.z + 0.1
      };
    };

    const createTexture = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.height = 128;
      
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      ctx.beginPath();
      ctx.arc(40, 40, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      
      return new THREE.CanvasTexture(canvas);
    };

    const bounds = getBounds();
    const particles = new THREE.Group();
    const geometry = new THREE.BufferGeometry();
    
    const material = new THREE.PointsMaterial({
      size: isPreview ? 0.15 : 0.2,
      map: createTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      color: 0xE0E0FF,
      opacity: isPreview ? 0.6 : 0.7,
      specular: 0x404040,
      shininess: 100
    });

    const count = isPreview ? 500 : 500;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const wobblePhases = new Float32Array(count); // מערך לשמירת שלבים שונים לתנודה

    for(let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      positions[i3+1] = Math.random() * (bounds.maxY * 2 - bounds.minY) + bounds.minY;
      positions[i3+2] = bounds.z;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02; // מהירות צידית איטית יותר
      velocities[i3+1] = -(Math.random() * 0.05 + 0.02); // מהירות נפילה איטית מאוד
      velocities[i3+2] = 0;

      wobblePhases[i] = Math.random() * Math.PI * 2; // שלב אקראי לתנודה
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('wobblePhase', new THREE.BufferAttribute(wobblePhases, 1));

    const system = new THREE.Points(geometry, material);
    particles.add(system);
    particles.position.z = bounds.z + 0.05;
    scene.add(particles);

    mesh.userData.updateFunction = (delta) => {
      const posArray = geometry.attributes.position.array;
      const velArray = geometry.attributes.velocity.array;
      const phaseArray = geometry.attributes.wobblePhase.array;
      
      for(let i = 0; i < count; i++) {
        const i3 = i * 3;

        // עדכון המהירות עם תנודה סינוסואידית עדינה
        const wobbleX = Math.sin(Date.now() * 0.0005 + phaseArray[i]) * 0.05; // תנודה קלה בציר X
        const wobbleY = Math.cos(Date.now() * 0.0003 + phaseArray[i]) * 0.02; // תנודה קלה בציר Y

        posArray[i3] += (velArray[i3] + wobbleX) * delta * 20; // עדכון מיקום X עם תנודה
        posArray[i3+1] += (velArray[i3+1] + wobbleY) * delta * 20; // עדכון מיקום Y עם תנודה
        
        // בדיקת גבולות
        if(posArray[i3+1] < bounds.minY) {
          posArray[i3] = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
          posArray[i3+1] = bounds.maxY * 1.5;
        }
        
        if(posArray[i3] < bounds.minX) posArray[i3] = bounds.maxX;
        if(posArray[i3] > bounds.maxX) posArray[i3] = bounds.minX;
      }
      
      geometry.attributes.position.needsUpdate = true;
    };

    mesh.userData.customObjects = [particles, system]; // השלמת הקוד
  }
};