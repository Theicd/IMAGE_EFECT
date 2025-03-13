// imageAppearanceEffects.js - אפקטים הקשורים להופעת התמונה

// משתנה גלובלי לשמירת מהירות האפקט
let effectSpeedMultiplier = 1.0;

// פונקציה לעדכון מהירות האפקט
function updateEffectSpeed(speedValue) {
  effectSpeedMultiplier = parseFloat(speedValue);
}

// פונקציה להמרת זמן אנימציה בהתאם למהירות שנבחרה
function getAdjustedDuration(baseDuration) {
  // הערך הנמוך יותר של המכפיל אומר מהירות גבוהה יותר (זמן קצר יותר)
  return Math.round(baseDuration / effectSpeedMultiplier);
}

// רשימת האפקטים בקטגוריה זו
const imageAppearanceEffects = {
  // אפקט פופ - התמונה מופיעה בפופ
  pop: {
    name: "פופ",
    value: "pop",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      
      // אפקט התחלתי - המישור קטן
      mesh.scale.set(0.01, 0.01, 0.01);
      
      // הגדרת אנימציה - הקטנת מידת ההגדלה מ-1.1 ל-1.05
      new TWEEN.Tween(mesh.scale)
        .to({ x: mesh.userData.originalScale.x * 1.05, 
              y: mesh.userData.originalScale.y * 1.05, 
              z: mesh.userData.originalScale.z * 1.05 }, getAdjustedDuration(300))
        .easing(TWEEN.Easing.Back.Out)
        .onComplete(() => {
          // חזרה לגודל רגיל
          new TWEEN.Tween(mesh.scale)
            .to({ x: mesh.userData.originalScale.x, 
                  y: mesh.userData.originalScale.y, 
                  z: mesh.userData.originalScale.z }, getAdjustedDuration(150))
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        })
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // בדיקה אם האנימציה הסתיימה (אם עברו יותר מ-500 מילישניות)
      if (mesh.userData.animationStartTime && Date.now() - mesh.userData.animationStartTime > 500) {
        // וידוא שהתמונה חזרה לגודל המקורי שלה
        if (mesh.userData.originalScale) {
          mesh.scale.copy(mesh.userData.originalScale);
        }
      }
    }
  },
  
  // אפקט ציור - התמונה מצטיירת בהדרגה
  draw: {
    name: "ציור",
    value: "draw",
    apply: function(mesh, scene, composer) {
      // שמירת הסקייל המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      
      // לעת עתה, נשתמש באפקט חלופי עם שקיפות
      if (mesh.material) {
        mesh.material.transparent = true;
        mesh.material.opacity = 0;
        
        new TWEEN.Tween(mesh.material)
          .to({ opacity: 1 }, getAdjustedDuration(1000))
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // וידוא שהתמונה נשארת בגודל המקורי שלה
      if (mesh.userData.originalScale) {
        mesh.scale.copy(mesh.userData.originalScale);
      }
    }
  },
  
  // אפקט גלישה - התמונה נכנסת מצד מסוים
  slide: {
    name: "גלישה",
    value: "slide",
    apply: function(mesh, scene, composer) {
      // שמירת המיקום המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      
      // שמירה על הסקייל המקורי של התמונה
      if (!mesh.userData.originalScale) {
        mesh.userData.originalScale = mesh.scale.clone();
      } else {
        // אם כבר יש סקייל מקורי, נוודא שהוא נשמר (לא יוקטן בטעות)
        mesh.scale.copy(mesh.userData.originalScale);
      }
      
      // העברת המישור מעבר לגבול המסך
      mesh.position.x = 10; // נכנס מימין
      
      // הגדרת אנימציה
      new TWEEN.Tween(mesh.position)
        .to({ x: mesh.userData.originalPosition.x }, getAdjustedDuration(800))
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה במהלך האנימציה
    update: function(mesh, delta) {
      // וידוא שהתמונה נשארת בגודל המקורי שלה לאורך כל האנימציה
      if (mesh.userData.originalScale) {
        mesh.scale.copy(mesh.userData.originalScale);
      }
    }
  },
  
  // אפקט דהייה - התמונה מופיעה בדהייה
  fade: {
    name: "דהייה",
    value: "fade",
    apply: function(mesh, scene, composer) {
      // שמירת הסקייל המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      
      // אפקט דהייה עם שקיפות
      if (mesh.material) {
        mesh.material.transparent = true;
        mesh.material.opacity = 0;
        
        new TWEEN.Tween(mesh.material)
          .to({ opacity: 1 }, getAdjustedDuration(1200))
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start();
      }
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // וידוא שהתמונה נשארת בגודל המקורי שלה
      if (mesh.userData.originalScale) {
        mesh.scale.copy(mesh.userData.originalScale);
      }
    }
  },
  
  // אפקט סיבוב - התמונה מסתובבת תוך כדי הופעה
  spin: {
    name: "סיבוב",
    value: "spin",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalRotation = {
        x: mesh.rotation.x,
        y: mesh.rotation.y,
        z: mesh.rotation.z
      };
      
      // אפקט התחלתי - סיבוב והקטנה
      mesh.scale.set(0.01, 0.01, 0.01);
      mesh.rotation.y = -Math.PI * 2; // סיבוב מלא בכיוון השעון
      
      // אנימציית סיבוב וגדילה
      new TWEEN.Tween(mesh.rotation)
        .to({ y: 0 }, getAdjustedDuration(1000))
        .easing(TWEEN.Easing.Back.Out)
        .start();
        
      new TWEEN.Tween(mesh.scale)
        .to({ 
          x: mesh.userData.originalScale.x, 
          y: mesh.userData.originalScale.y, 
          z: mesh.userData.originalScale.z 
        }, getAdjustedDuration(1000))
        .easing(TWEEN.Easing.Back.Out)
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // וידוא שהתמונה נשארת בגודל המקורי שלה
      if (mesh.userData.originalScale) {
        mesh.scale.copy(mesh.userData.originalScale);
      }
    }
  }
};

// פונקציה להחלת אפקט הופעת תמונה
function applyImageAppearanceEffect(effect, mesh, scene, composer) {
  // בדיקה אם האפקט קיים
  if (imageAppearanceEffects[effect] && imageAppearanceEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetAppearanceEffects(mesh);
    
    // הפעלת האפקט
    imageAppearanceEffects[effect].apply(mesh, scene, composer);
    return true;
  }
  return false;
}

// פונקציה לאיפוס אפקטים
function resetAppearanceEffects(mesh) {
  // איפוס סיבוב
  if (mesh.userData.originalRotation) {
    mesh.rotation.copy(mesh.userData.originalRotation);
  }
  
  // איפוס מיקום
  if (mesh.userData.originalPosition) {
    mesh.position.copy(mesh.userData.originalPosition);
  }
  
  // איפוס גודל
  if (mesh.userData.originalScale) {
    mesh.scale.copy(mesh.userData.originalScale);
    // לא מוחקים את originalScale כדי שנוכל להשתמש בו בהמשך
    // delete mesh.userData.originalScale;
  }
  
  // איפוס שקיפות
  if (mesh.material) {
    mesh.material.opacity = 1;
    mesh.material.transparent = false;
  }
}

// ייצוא הפונקציות והאפקטים
window.imageAppearanceEffects = imageAppearanceEffects;
window.applyImageAppearanceEffect = applyImageAppearanceEffect;
window.updateEffectSpeed = updateEffectSpeed;
