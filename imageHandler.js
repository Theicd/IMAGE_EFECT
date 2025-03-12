// imageHandler.js - טיפול בתמונות והעלאתן

// טיפול בהעלאת תמונה
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      if (imageMesh) scene.remove(imageMesh);
      
      // יצירת טקסטורה מהתמונה
      imageTexture = new THREE.Texture(img);
      imageTexture.needsUpdate = true;
      
      // יצירת מש לתמונה
      const aspectRatio = img.width / img.height;
      const width = 4;
      const height = width / aspectRatio;
      
      // יצירת קבוצה שתכיל את התמונה והמסגרת
      const imageGroup = new THREE.Group();
      
      // יצירת תמונה במישור
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ 
        map: imageTexture,
        side: THREE.DoubleSide
      });
      
      const imagePlane = new THREE.Mesh(geometry, material);
      imagePlane.position.z = 0.01; // מיקום התמונה קצת קדימה
      
      // יצירת מסגרת תלת-מימדית
      const frameThickness = 0.1; // עובי המסגרת
      const frameDepth = 0.05;    // עומק המסגרת
      const frameColor = 0x222222; // צבע המסגרת
      
      // יצירת הבסיס האחורי (לוח)
      const backPlateGeometry = new THREE.BoxGeometry(
        width + frameThickness * 2, 
        height + frameThickness * 2, 
        frameDepth
      );
      
      const backPlateMaterial = new THREE.MeshPhongMaterial({ 
        color: frameColor,
        specular: 0x111111,
        shininess: 30
      });
      
      const backPlate = new THREE.Mesh(backPlateGeometry, backPlateMaterial);
      backPlate.position.z = -frameDepth/2;
      
      // הוספת התמונה והמסגרת לקבוצה
      imageGroup.add(backPlate);
      imageGroup.add(imagePlane);
      
      // שמירת הקבוצה כ-imageMesh לשמירה על תאימות עם שאר הקוד
      imageMesh = imageGroup;
      imageMesh.position.z = -4;
      
      // שמירת התמונה עצמה כדי שאפקטים יוכלו לגשת אליה ישירות
      imageMesh.userData.imagePlane = imagePlane;
      
      // שמירת נתוני התמונה המקורית עבור אפקטים
      imageMesh.userData.originalImageWidth = img.width;
      imageMesh.userData.originalImageHeight = img.height;
      imageMesh.userData.width = width;
      imageMesh.userData.height = height;
      
      // שמירת הטקסטורה ומטריאל של התמונה לגישה קלה לאפקטים
      imageMesh.userData.imageTexture = imageTexture;
      imageMesh.userData.imageMaterial = material;
      
      scene.add(imageMesh);
      
      // הפעלת כפתור יצירת וידאו
      document.getElementById('create-video').disabled = false;
      
      // החלת האפקט הנוכחי
      if (window.effectsManager && window.effectsManager.applyEffect) {
        window.effectsManager.applyEffect(currentCategory, currentEffect);
      } else {
        applyEffect(currentCategory, currentEffect);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ייצוא הפונקציות
window.imageHandler = {
  handleImageUpload
};
