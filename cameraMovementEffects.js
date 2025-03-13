// cameraMovementEffects.js - אפקטים של תנועת מצלמה בתוך התמונה

// רשימת האפקטים בקטגוריה זו
const cameraMovementEffects = {
  // אפקט זום אין - התקרבות לתמונה
  zoomIn: {
    name: "זום אין",
    value: "zoomIn",
    apply: function(mesh, scene, composer) {
      // שמירת הגודל המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalPosition = mesh.position.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.3; // הגדלה ב-30% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // שמירת הגודל ההתחלתי החדש
      mesh.userData.startScale = mesh.scale.clone();
      
      // יצירת אנימציית זום אין חלקה - הגדלה נוספת של 20%
      new TWEEN.Tween(mesh.scale)
        .to({ 
          x: mesh.userData.startScale.x * 1.2, 
          y: mesh.userData.startScale.y * 1.2, 
          z: mesh.userData.startScale.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
      // כדי שהזום יהיה ממרכז התמונה, נזיז את המישור בכיוון ההפוך
      new TWEEN.Tween(mesh.position)
        .to({
          x: mesh.userData.originalPosition.x * 0.8,
          y: mesh.userData.originalPosition.y * 0.8,
          z: mesh.userData.originalPosition.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
      // שמירת זמן תחילת האנימציה
      mesh.userData.animationStartTime = Date.now();
    },
    
    // פונקציית עדכון לשימוש בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הזום באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט זום אאוט - התרחקות מהתמונה
  zoomOut: {
    name: "זום אאוט",
    value: "zoomOut",
    apply: function(mesh, scene, composer) {
      // שמירת הגודל המקורי
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalPosition = mesh.position.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // שמירת הגודל ההתחלתי החדש
      mesh.userData.startScale = mesh.scale.clone();
      
      // יצירת אנימציית זום אאוט חלקה
      new TWEEN.Tween(mesh.scale)
        .to({ 
          x: mesh.userData.startScale.x * 0.8, 
          y: mesh.userData.startScale.y * 0.8, 
          z: mesh.userData.startScale.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
      // כדי שהזום יהיה ממרכז התמונה, נזיז את המישור בכיוון ההפוך
      new TWEEN.Tween(mesh.position)
        .to({
          x: mesh.userData.originalPosition.x * 1.2,
          y: mesh.userData.originalPosition.y * 1.2,
          z: mesh.userData.originalPosition.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
      // שמירת זמן תחילת האנימציה
      mesh.userData.animationStartTime = Date.now();
    },
    
    // פונקציית עדכון לשימוש בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הזום אאוט באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט פאן אופקי - תנועה אופקית של התמונה
  panHorizontal: {
    name: "פאן אופקי",
    value: "panHorizontal",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // שמירת הגודל ההתחלתי החדש
      mesh.userData.startScale = mesh.scale.clone();
      
      // אנימציית תנועה אופקית
      new TWEEN.Tween(mesh.position)
        .to({
          x: mesh.userData.originalPosition.x + 0.3,
          y: mesh.userData.originalPosition.y,
          z: mesh.userData.originalPosition.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    },
    
    // פונקציית עדכון לשימוש בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הפאן באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט פאן אנכי - תנועה אנכית של התמונה
  panVertical: {
    name: "פאן אנכי",
    value: "panVertical",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // שמירת הגודל ההתחלתי החדש
      mesh.userData.startScale = mesh.scale.clone();
      
      // אנימציית תנועה אנכית
      new TWEEN.Tween(mesh.position)
        .to({
          x: mesh.userData.originalPosition.x,
          y: mesh.userData.originalPosition.y + 0.3,
          z: mesh.userData.originalPosition.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    },
    
    // פונקציית עדכון לשימוש בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הפאן האנכי באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט גלים - התמונה זזה כמו גלים
  wave: {
    name: "גלים",
    value: "wave",
    apply: function(mesh, scene, composer) {
      // שמירת המצב המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalRotation = mesh.rotation.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // במקום לשנות את הגיאומטריה או להשתמש בשיידר, נשתמש באנימציית תנועה פשוטה
      // שתדמה תנועת גלים
      
      // פונקציית עדכון לאנימציית הגלים
      mesh.userData.waveStartTime = Date.now();
      mesh.userData.updateFunction = function(delta) {
        const elapsed = (Date.now() - mesh.userData.waveStartTime) * 0.001; // זמן בשניות
        
        // תנועת גלים באמצעות סיבוב עדין
        mesh.rotation.x = Math.sin(elapsed * 2.0) * 0.03;
        mesh.rotation.y = Math.sin(elapsed * 1.5) * 0.03;
        
        // תנועה קלה במרחב
        mesh.position.x = mesh.userData.originalPosition.x + Math.sin(elapsed * 1.8) * 0.02;
        mesh.position.y = mesh.userData.originalPosition.y + Math.sin(elapsed * 2.2) * 0.02;
      };
    },
    
    // פונקציית עדכון לשימוש בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הגלים באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט רעידה - התמונה רועדת קלות
  shake: {
    name: "רעידה",
    value: "shake",
    apply: function(mesh, scene, composer) {
      // שמירת המיקום המקורי
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalRotation = mesh.rotation.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // הגדרת משתנים לשליטה ברעידה - הקטנת עוצמת הרעידה
      mesh.userData.shakeTime = 0;
      mesh.userData.shakeIntensity = 0.01; // הקטנה מ-0.015 ל-0.01
      mesh.userData.rotationIntensity = 0.005; // הקטנה מ-0.01 ל-0.005
      
      // הגדרת פונקציית עדכון לרעידה
      mesh.userData.updateFunction = function(delta) {
        mesh.userData.shakeTime += delta * 10;
        
        // רעידת מיקום עם תנועה טבעית יותר
        mesh.position.x = mesh.userData.originalPosition.x + Math.sin(mesh.userData.shakeTime * 0.5) * mesh.userData.shakeIntensity;
        mesh.position.y = mesh.userData.originalPosition.y + Math.sin(mesh.userData.shakeTime * 0.7) * mesh.userData.shakeIntensity;
        
        // רעידת סיבוב קלה
        mesh.rotation.z = mesh.userData.originalRotation.z + Math.sin(mesh.userData.shakeTime * 0.3) * mesh.userData.rotationIntensity;
      };
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית הרעידה באופן חלק
      TWEEN.update();
    }
  },
  
  // אפקט קן ציפור - מבט מלמעלה שמתקרב
  birdseye: {
    name: "מבט מלמעלה",
    value: "birdseye",
    apply: function(mesh, scene, composer) {
      // שמירת המיקום והסיבוב המקוריים
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.originalRotation = mesh.rotation.clone();
      mesh.userData.originalScale = mesh.scale.clone();
      
      // הגדלת התמונה ההתחלתית כדי שתמלא את כל המסך
      const initialScale = 1.2; // הגדלה ב-20% מהגודל המקורי
      mesh.scale.set(
        mesh.userData.originalScale.x * initialScale,
        mesh.userData.originalScale.y * initialScale,
        mesh.userData.originalScale.z
      );
      
      // התחלה ממצב גבוה ורחוק - הקטנת מידת התזוזה מ-0.5 ל-0.3
      mesh.position.y = mesh.userData.originalPosition.y + 0.3;
      mesh.position.z = mesh.userData.originalPosition.z + 0.3;
      mesh.rotation.x = -0.2; // הקטנת מידת הסיבוב מ-0.3 ל-0.2
      
      // הגדרת אנימציה - התקרבות למבט ישר
      new TWEEN.Tween(mesh.position)
        .to({ 
          y: mesh.userData.originalPosition.y,
          z: mesh.userData.originalPosition.z
        }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
      new TWEEN.Tween(mesh.rotation)
        .to({ x: 0 }, 7000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    },
    
    // הוספת פונקציית עדכון שתשמור על גודל התמונה בווידאו
    update: function(mesh, delta) {
      // שמירה על גודל התמונה שהוגדר ב-createVideo.js
      if (mesh.userData.videoScale) {
        mesh.scale.copy(mesh.userData.videoScale);
      } else {
        // שמירת הגודל הנוכחי כדי להשתמש בו בעתיד
        mesh.userData.videoScale = mesh.scale.clone();
      }
      // המשך אנימציית מבט מלמעלה באופן חלק
      TWEEN.update();
    }
  },
};

// פונקציה להחלת אפקט תנועת מצלמה
function applyCameraMovementEffect(effect, mesh, scene, composer) {
  // בדיקה אם האפקט קיים
  if (cameraMovementEffects[effect] && cameraMovementEffects[effect].apply) {
    // איפוס אפקטים קודמים
    resetCameraEffects(mesh, composer);
    
    // הפעלת האפקט
    cameraMovementEffects[effect].apply(mesh, scene, composer);
    return true;
  }
  return false;
}

// פונקציה לאיפוס אפקטים
function resetCameraEffects(mesh, composer) {
  // איפוס פונקציית עדכון
  if (mesh.userData.updateFunction) {
    delete mesh.userData.updateFunction;
  }
  
  // איפוס מיקום
  if (mesh.userData.originalPosition) {
    mesh.position.copy(mesh.userData.originalPosition);
  }
  
  // איפוס סיבוב
  if (mesh.userData.originalRotation) {
    mesh.rotation.copy(mesh.userData.originalRotation);
  }
  
  // איפוס גודל
  if (mesh.userData.originalScale) {
    mesh.scale.copy(mesh.userData.originalScale);
    // לא מוחקים את originalScale כדי שנוכל להשתמש בו בהמשך
    // delete mesh.userData.originalScale;
  }
  
  // איפוס גודל התחלתי
  if (mesh.userData.startScale) {
    delete mesh.userData.startScale;
  }
  
  // איפוס material
  if (mesh.userData.originalMaterial) {
    if (mesh.material) mesh.material.dispose();
    mesh.material = mesh.userData.originalMaterial;
    delete mesh.userData.originalMaterial;
  }
  
  // איפוס גיאומטריה
  if (mesh.userData.originalGeometry) {
    if (mesh.geometry) mesh.geometry.dispose();
    mesh.geometry = mesh.userData.originalGeometry;
    delete mesh.userData.originalGeometry;
    delete mesh.userData.originalVertices;
  }
  
  // איפוס משתני עזר
  if (mesh.userData.shakeTime) delete mesh.userData.shakeTime;
  if (mesh.userData.shakeIntensity) delete mesh.userData.shakeIntensity;
  if (mesh.userData.rotationIntensity) delete mesh.userData.rotationIntensity;
  
  // הסרת passes מותאמים אישית
  if (mesh.userData.customPasses && composer) {
    mesh.userData.customPasses.forEach(pass => {
      pass.enabled = false;
      // הסרת ה-pass מה-composer (אם אפשרי)
      for (let i = 0; i < composer.passes.length; i++) {
        if (composer.passes[i] === pass) {
          composer.passes.splice(i, 1);
          break;
        }
      }
    });
    delete mesh.userData.customPasses;
  }
}

// ייצוא הפונקציות והאפקטים
window.cameraMovementEffects = cameraMovementEffects;
window.applyCameraMovementEffect = applyCameraMovementEffect;
