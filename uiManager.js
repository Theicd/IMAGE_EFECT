// uiManager.js - ניהול ממשק המשתמש והתאמות

// פונקציית אנימציה
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // עדכון TWEEN לאנימציות
  TWEEN.update();
  
  // עדכון בקרי מצלמה
  controls.update();
  
  // עדכון אפקטים
  if (window.effectsManager && window.effectsManager.updateEffects) {
    window.effectsManager.updateEffects();
  } else {
    updateEffects();
  }
  
  // רינדור הסצנה
  composer.render();
}

// טעינת קבצי האפקטים
async function loadEffectScripts() {
  return new Promise((resolve) => {
    // פונקציה לטעינת קובץ JavaScript
    function loadScript(url) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }
    
    // טעינת כל קבצי האפקטים
    Promise.all([
      loadScript('./imageAppearanceEffects.js'),
      loadScript('./cameraMovementEffects.js'),
      loadScript('./movingObjectsEffects.js'),
      loadScript('./lightAndColorEffects.js')
    ]).then(() => {
      console.log("כל קבצי האפקטים נטענו בהצלחה");
      resolve();
    });
  });
}

// ייצוא הפונקציות
window.uiManager = {
  animate,
  loadEffectScripts
};
