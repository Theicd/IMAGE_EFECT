// bubblesEffect.js - אפקט בועות

// הגדרת האפקט ישירות כאובייקט גלובלי
window.bubblesEffect = {
  name: "בועות",
  value: "bubbles",
  apply: function(mesh, scene, composer) {
    function getImageBounds(mesh) {
      // בדיקה אם זו קבוצה עם מסגרת
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
    
    // יצירת חומר שקוף עם שכבת בועות
    const bubbleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      specular: 0x404040,
      shininess: 100
    });
    
    // יצירת משטח עם טקסטורות לאפקט של בועות
    function createBubbleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      
      // gradient מעגלי לבועות
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.2)');
      gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      // נקודת הבהוב לסימולציית שיקוף אור
      ctx.beginPath();
      ctx.arc(40, 40, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      
      return new THREE.CanvasTexture(canvas);
    }
    
    const bubbleTexture = createBubbleTexture();
    
    // קבוצת בועות
    const bubblesGroup = new THREE.Group();
    bubblesGroup.position.copy(mesh.position);
    bubblesGroup.position.z = mesh.position.z + 0.05;
    scene.add(bubblesGroup);
    
    const bubbles = [];
    const bubbleCount = 30;
    
    // יצירת בועות
    for (let i = 0; i < bubbleCount; i++) {
      const size = Math.random() * 0.1 + 0.05;
      const bubbleGeometry = new THREE.SphereGeometry(size, 16, 16);
      const material = bubbleMaterial.clone();
      material.map = bubbleTexture;
      
      const bubble = new THREE.Mesh(bubbleGeometry, material);
      bubble.position.set(
        Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
        Math.random() * (bounds.maxY - bounds.minY) + bounds.minY,
        0
      );
      
      // נתוני תנועה לכל בועה
      bubble.userData.speed = Math.random() * 0.002 + 0.001;
      bubble.userData.wobble = {
        x: Math.random() * 0.002,
        speed: Math.random() * 0.1
      };
      
      bubblesGroup.add(bubble);
      bubbles.push(bubble);
    }
    
    mesh.userData.customObjects = mesh.userData.customObjects || [];
    mesh.userData.customObjects.push(bubblesGroup);
    mesh.userData.customObjects = mesh.userData.customObjects.concat(bubbles);
    
    mesh.userData.updateFunction = function(delta) {
      // עדכון תנועת הבועות
      for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i];
        
        // תנועה כלפי מעלה עם תנודה קלה
        bubble.position.y += bubble.userData.speed;
        bubble.position.x += Math.sin(Date.now() * bubble.userData.wobble.speed) * bubble.userData.wobble.x;
        
        // סיבוב קל עם הזמן
        bubble.rotation.y += 0.01;
        bubble.rotation.x += 0.005;
        
        // בדיקה אם הבועה יצאה מגבולות התמונה
        if (bubble.position.y > bounds.maxY) {
          // מיקום מחדש בתחתית התמונה
          bubble.position.y = bounds.minY;
          bubble.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
        }
      }
    };
  }
};
