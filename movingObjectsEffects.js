// movingObjectsEffects.js - אפקטים של אובייקטים זזים על התמונה

// רשימת האפקטים בקטגוריה זו - תתמלא על ידי הקבצים הנטענים
const movingObjectsEffects = {};

// פונקציה להחלת אפקט אובייקטים זזים
function applyMovingObjectsEffect(effect, mesh, scene, composer) {
  console.log(`מנסה להחיל אפקט אובייקטים זזים: ${effect}`, mesh);
  
  // בדיקה אם זו קבוצה עם מסגרת או mesh בודד
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
window.resetMovingObjectsEffects = resetMovingObjectsEffects;

// טעינת קבצי האפקטים
function loadEffectFiles() {
  const effectFiles = [
    'oldFilmEffect.js',
    'snowEffect.js',
    'sparklesEffect.js',
    'smokeEffect.js',
    'bubblesEffect.js',
    'rainEffect.js'
  ];
  
  const effectLoadPromises = effectFiles.map(file => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // בדיקה אם האתר רץ על גיטהאב או מקומית
      const isGitHub = window.location.href.includes('github.io') || window.location.href.includes('theicd.github.io');
      // התאמת הנתיב בהתאם למיקום
      const basePath = isGitHub ? '/IMAGE_EFECT' : '';
      script.src = `${basePath}/movingEffects1/${file}`;
      script.onload = () => {
        console.log(`נטען קובץ אפקט: ${file}`);
        resolve();
      };
      script.onerror = (err) => {
        console.error(`שגיאה בטעינת קובץ אפקט: ${file}`, err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  });
  
  // לאחר טעינת כל קבצי האפקטים, מעדכנים את האובייקט הראשי
  Promise.all(effectLoadPromises)
    .then(() => {
      console.log('כל קבצי האפקטים נטענו בהצלחה');
      
      // עדכון אובייקט האפקטים הראשי עם האפקטים שנטענו
      if (window.oldFilmEffect) movingObjectsEffects['oldFilm'] = window.oldFilmEffect;
      if (window.snowEffect) movingObjectsEffects['snow'] = window.snowEffect;
      if (window.sparklesEffect) movingObjectsEffects['sparkles'] = window.sparklesEffect;
      if (window.smokeEffect) movingObjectsEffects['smoke'] = window.smokeEffect;
      if (window.bubblesEffect) movingObjectsEffects['bubbles'] = window.bubblesEffect;
      if (window.rainEffect) movingObjectsEffects['rain'] = window.rainEffect;
      
      console.log('אובייקט האפקטים הראשי עודכן:', Object.keys(movingObjectsEffects));
    })
    .catch(err => {
      console.error('שגיאה בטעינת קבצי האפקטים:', err);
    });
}

// טעינת האפקטים בתחילת הרצת הקובץ
loadEffectFiles();
