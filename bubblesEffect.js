// bubblesEffect.js - אפקט בועות משופר עם שקיפות וצבעים עקביים

window.bubblesEffect = {
  name: "בועות",
  value: "bubbles",
  apply: function(mesh, scene, composer, isPreview = false) { // הוספתי isPreview
    function getImageBounds(mesh) {
      let targetMesh = mesh;
      if (mesh.userData && mesh.userData.imagePlane) {
        targetMesh = mesh.userData.imagePlane;
      }
      
      if (!targetMesh.geometry || !targetMesh.geometry.parameters) {
        console.error("Invalid mesh geometry for bubbles effect", targetMesh);
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
    
    // יצירת חומר בסיס לבועות
    const bubbleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: isPreview ? 0.5 : 0.7, // שקיפות שונה בין תצוגה מקדימה לסרטון
      specular: 0x404040,
      shininess: 100,
      side: THREE.DoubleSide // ודא שהחומר נראה משני הצדדים
    });
    
    // יצירת טקסטורה משותפת לבועות
    function createBubbleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.2)');
      gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      ctx.beginPath();
      ctx.arc(40, 40, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      
      return new THREE.CanvasTexture(canvas);
    }
    
    const bubbleTexture = createBubbleTexture();
    
    const bubblesGroup = new THREE.Group();
    bubblesGroup.position.copy(mesh.position);
    bubblesGroup.position.z = mesh.position.z + 0.05;
    scene.add(bubblesGroup);
    
    const bubbles = [];
    const bubbleCount = 100;
    
    // יצירת בועות עם צבעים ורמות שקיפות שונות
    for (let i = 0; i < bubbleCount; i++) {
      const size = Math.random() * 0.1 + 0.05;
      const bubbleGeometry = new THREE.SphereGeometry(size, 16, 16);
      
      const material = bubbleMaterial.clone();
      material.map = bubbleTexture;
      
      // בחירת צבע אקראי בהשראת בועות סבון
      const hue = Math.random() * 360;
      material.color.setHSL(hue / 360, 0.6, 0.8); // ריווח גבוה יותר לצבעים חזקים יותר
      material.opacity = isPreview ? (Math.random() * 0.3 + 0.4) : (Math.random() * 0.3 + 0.5); // שקיפות גבוהה יותר בסרטון
      
      const bubble = new THREE.Mesh(bubbleGeometry, material);
      bubble.position.set(
        Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
        Math.random() * (bounds.maxY - bounds.minY) + bounds.minY,
        0
      );
      
      // נתוני תנועה לכל בועה
      bubble.userData.speedX = (Math.random() - 0.5) * 0.002;
      bubble.userData.speedY = Math.random() * 0.002 + 0.001;
      bubble.userData.wobble = {
        x: Math.random() * 0.002,
        y: Math.random() * 0.002,
        speed: Math.random() * 0.1
      };
      
      bubblesGroup.add(bubble);
      bubbles.push(bubble);
    }
    
    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(bubblesGroup);
    mesh.userData.customObjects = mesh.userData.customObjects.concat(bubbles);
    
    mesh.userData.updateFunction = function(delta) {
      for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        
        bubble.position.x += bubble.userData.speedX + Math.sin(Date.now() * bubble.userData.wobble.speed) * bubble.userData.wobble.x;
        bubble.position.y += bubble.userData.speedY + Math.cos(Date.now() * bubble.userData.wobble.speed) * bubble.userData.wobble.y;
        
        bubble.rotation.y += 0.01;
        bubble.rotation.x += 0.005;
        
        if (bubble.position.y > bounds.maxY) {
          bubble.position.y = bounds.minY;
          bubble.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        } else if (bubble.position.y < bounds.minY) {
          bubble.position.y = bounds.maxY;
          bubble.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        }
        
        if (bubble.position.x > bounds.maxX) {
          bubble.position.x = bounds.minX;
        } else if (bubble.position.x < bounds.minX) {
          bubble.position.x = bounds.maxX;
        }
      }
    };
  }
};