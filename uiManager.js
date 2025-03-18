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
    
    // טעינת כל קבצי האפקטים בצורה מסורתית
    console.log("טוען קבצי אפקטים בצורה מסורתית");
    Promise.all([
      loadScript('./imageAppearanceEffects.js'),
      loadScript('./cameraMovementEffects.js'),
      loadScript('./movingObjectsEffects.js'),
      loadScript('./lightAndColorEffects.js')
    ]).then(() => {
      console.log("כל קבצי האפקטים נטענו בהצלחה");
      
      // התקנת מאזיני אירועים לסליידר המהירות
      setupSpeedSliderListeners();
      
      resolve();
    }).catch(error => {
      console.error("שגיאה בטעינת קבצי האפקטים:", error);
      resolve(); // להמשיך בכל מקרה
    });
  });
}

// פונקציה להתקנת מאזיני אירועים לסליידר המהירות
function setupSpeedSliderListeners() {
  const speedSlider = document.getElementById('effect-speed');
  if (speedSlider) {
    console.log("מתקין מאזין אירועים לסליידר המהירות");
    
    speedSlider.addEventListener('input', updateEffectSpeed);
    speedSlider.addEventListener('change', updateEffectSpeed);
  }
}

// פונקציה לעדכון מהירות האפקט המוחל כעת
function updateEffectSpeed() {
  const speedValue = parseFloat(this.value) || 1.0;
  console.log(`עדכון מהירות האפקט: ${speedValue}`);
  
  // אם יש אפקט נוכחי מוחל, נחיל אותו מחדש
  const currentCategory = document.querySelector('.effect-category.active');
  const currentEffect = document.querySelector('.effect-item.active');
  
  if (currentCategory && currentEffect) {
    const categoryName = currentCategory.dataset.category;
    const effectName = currentEffect.dataset.effect;
    
    console.log(`מחיל מחדש אפקט: ${categoryName} - ${effectName}`);
    
    // הפעלת האפקט הנבחר עם המהירות החדשה
    applyEffect(categoryName, effectName);
  }
}

// ייצוא הפונקציות
window.uiManager = {
  animate,
  loadEffectScripts,
  setupSpeedSliderListeners,
  updateEffectSpeed
};
