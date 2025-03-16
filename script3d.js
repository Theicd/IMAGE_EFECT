// script3d.js - קובץ ראשי האפקטים התלת-מימדי

// משתנים גלובליים
let scene, camera, renderer, composer;
let room, imageTexture, imageMesh;
let controls;
let currentCategory = ''; // קטגוריה נוכחית
let currentEffect = ''; // אפקט נוכחי
let activeEffects = {}; // מילון של אפקטים פעילים, מסודר לפי קטגוריה
let animationFrameId;
let neonText, neonTextMaterial;
let particleSystem;
let bloomPass, glitchPass, bokehPass, fxaaPass, colorPass, filmPass;
let waveUniforms;

// מאזיני אירועים
document.addEventListener('DOMContentLoaded', function() {
  init();
  updateMobileButtonStyles(); // עדכון סגנון כפתורים במצב טלפון
});
window.addEventListener('resize', function() {
  if (window.sceneSetup && window.sceneSetup.onWindowResize) {
    window.sceneSetup.onWindowResize();
  } else {
    onWindowResize();
  }
  updateMobileButtonStyles(); // עדכון סגנון כפתורים במצב טלפון
});
document.getElementById('image-upload').addEventListener('change', function(event) {
  if (window.imageHandler && window.imageHandler.handleImageUpload) {
    window.imageHandler.handleImageUpload(event);
  } else {
    handleImageUpload(event);
  }
});

// מאזין לבחירת קטגוריה
document.getElementById('category-select').addEventListener('change', (e) => {
  currentCategory = e.target.value;
  
  if (window.effectsManager && window.effectsManager.updateEffectsList) {
    window.effectsManager.updateEffectsList(currentCategory);
  } else {
    updateEffectsList(currentCategory);
  }
  
  // הפעלת תפריט האפקטים
  const effectSelect = document.getElementById('effect-select');
  effectSelect.disabled = false;
  
  // הצגת או הסתרת מד המהירות בהתאם לקטגוריה שנבחרה
  const speedControlContainer = document.getElementById('speed-control-container');
  if (currentCategory === 'appearance') {
    speedControlContainer.style.display = 'block';
  } else {
    speedControlContainer.style.display = 'none';
  }
});

// מאזין לבחירת אפקט
document.getElementById('effect-select').addEventListener('change', (e) => {
  if (e.target.value) {
    currentEffect = e.target.value;
    
    // שמירת האפקט במילון האפקטים הפעילים
    if (currentCategory) {
      activeEffects[currentCategory] = currentEffect;
      
      // החלת האפקט
      if (window.effectsManager && window.effectsManager.applyEffect) {
        window.effectsManager.applyEffect(currentCategory, currentEffect);
      } else {
        applyEffect(currentCategory, currentEffect);
      }
    }
  }
});

// מאזין לשינוי מהירות האפקט
document.getElementById('effect-speed').addEventListener('input', (e) => {
  const speedValue = e.target.value;
  // עדכון מהירות האפקט אם הפונקציה קיימת
  if (window.updateEffectSpeed) {
    window.updateEffectSpeed(speedValue);
  }
  
  // החלת האפקט מחדש אם כבר נבחר אפקט
  if (currentCategory === 'appearance' && currentEffect) {
    // איפוס האפקט הנוכחי
    if (window.resetAppearanceEffects && imageMesh) {
      window.resetAppearanceEffects(imageMesh);
    }
    
    // החלת האפקט מחדש עם המהירות החדשה
    if (window.applyImageAppearanceEffect && imageMesh) {
      window.applyImageAppearanceEffect(currentEffect, imageMesh, scene, composer);
    }
  }
});

document.getElementById('create-video').addEventListener('click', createVideo);
document.getElementById('back-to-editor').addEventListener('click', () => {
  document.getElementById('video-container').style.display = 'none';
});

// פונקציה לבדיקת כיוון התמונה ויצירת וידאו בהתאם
function createVideo() {
  console.log("יצירת וידאו");
  
  // בדיקת כיוון התמונה הנבחר
  const orientation = document.getElementById('orientation-select').value;
  
  if (orientation === 'portrait') {
    // יצירת וידאו במצב פורטרט (אורכי)
    if (window.createPortraitVideo) {
      window.createPortraitVideo();
    } else {
      console.error("פונקציית יצירת וידאו במצב פורטרט לא נמצאה");
      alert("שגיאה: לא ניתן ליצור וידאו במצב פורטרט. נסה שוב מאוחר יותר.");
    }
  } else {
    // יצירת וידאו במצב לנדסקייפ (אופקי)
    if (window.createVideoFull) {
      window.createVideoFull();
    } else {
      // גיבוי במקרה שהפונקציה המלאה לא זמינה
      document.getElementById('video-container').style.display = 'flex';
      
      // יצירת וידאו לדוגמה
      const videoElement = document.getElementById('output-video');
      videoElement.src = 'sample-video.mp4';
      videoElement.play();
    }
  }
}

// פונקציה לעדכון סגנון הכפתורים במצב טלפון
function updateMobileButtonStyles() {
  // בדיקה אם המכשיר הוא טלפון נייד (רוחב מסך קטן מ-768 פיקסלים)
  if (window.innerWidth <= 768) {
    // רשימת כפתורים לעדכון
    const buttonsToStyle = [
      document.querySelector('.upload-button'), // כפתור העלה תמונה
      document.getElementById('create-video') // כפתור צור וידאו
    ];
    
    buttonsToStyle.forEach(button => {
      if (button) {
        // עיצוב בסיסי
        button.style.backgroundColor = 'rgba(10, 10, 20, 0.8)';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.padding = '12px 15px';
        button.style.margin = '5px';
        button.style.fontFamily = "'Heebo', Arial, sans-serif";
        button.style.fontSize = '15px';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s ease';
        button.style.textAlign = 'center';
        button.style.boxSizing = 'border-box';
        
        // אפקטים מתקדמים - תאורת ניאון וגלו
        button.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.3)';
        button.style.borderBottom = '2px solid var(--neon-blue, #00f3ff)';
        button.style.backdropFilter = 'blur(5px)';
      }
    });
    
    // טיפול ספציפי בתפריטי הבחירה (select)
    const selectElements = [
      document.getElementById('category-select'),
      document.getElementById('effect-select')
    ];
    
    selectElements.forEach(select => {
      if (select) {
        // ביטול סגנונות קודמים על ידי הגדרתם ישירות
        select.style.appearance = 'none';
        select.style.webkitAppearance = 'none';
        select.style.mozAppearance = 'none';
        select.style.backgroundImage = `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`;
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundPosition = 'right 10px center';
        select.style.backgroundColor = 'rgba(10, 10, 20, 0.8)';
        select.style.color = 'white';
        select.style.border = '1px solid rgba(0, 243, 255, 0.3)';
        select.style.borderRadius = '8px';
        select.style.padding = '12px 30px 12px 15px';
        select.style.margin = '5px';
        select.style.fontFamily = "'Heebo', Arial, sans-serif";
        select.style.fontSize = '15px';
        select.style.fontWeight = 'bold';
        select.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.2)';
        select.style.borderBottom = '2px solid var(--neon-blue, #00f3ff)';
        select.style.cursor = 'pointer';
        select.style.textAlign = 'center';
        select.style.boxSizing = 'border-box';
        select.style.width = 'auto';
        select.style.minWidth = '120px';
        
        // מעקב אחר שינויים באפשרויות הבחירה ועדכון הסגנון שלהן
        // הוספת מאזין אירועים לפתיחת התפריט הנפתח
        select.addEventListener('mousedown', function() {
          // מוסיף קלאס מיוחד לגוף המסמך שנוכל לזהות בעזרתו מתי התפריט פתוח
          document.body.classList.add('select-opened');
          
          // מוסיף סגנון מיוחד לאפשרויות בתפריט
          setTimeout(() => {
            const options = document.querySelectorAll('option');
            options.forEach(option => {
              option.style.backgroundColor = 'rgba(5, 5, 15, 0.95)';
              option.style.color = 'white';
              option.style.padding = '12px';
              option.style.fontFamily = "'Heebo', Arial, sans-serif";
            });
          }, 0);
        });
      }
    });
    
    // עיצוב ספציפי לכפתור צור וידאו
    const createVideoButton = document.getElementById('create-video');
    if (createVideoButton) {
      createVideoButton.style.background = 'linear-gradient(45deg, #00f3ff, #9d00ff)';
      createVideoButton.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.5)';
    }
    
    // עיצוב אייקון העלאת תמונה
    const uploadIcon = document.querySelector('.upload-icon');
    if (uploadIcon) {
      uploadIcon.style.color = 'var(--neon-blue, #00f3ff)';
    }
  }
}

// הפעלת הפונקציה בטעינת העמוד ובשינוי גודל חלון
document.addEventListener('DOMContentLoaded', function() {
  updateMobileButtonStyles();
});

window.addEventListener('resize', updateMobileButtonStyles);

// פונקציית אתחול
async function init() {
  // יצירת סצנה
  if (window.sceneSetup && window.sceneSetup.setupScene) {
    window.sceneSetup.setupScene();
  } else {
    // יצירת סצנה
    scene = new THREE.Scene();
    
    // יצירת מצלמה
    const isMobile = window.innerWidth <= 768;
    const fov = isMobile ? 90 : 70; // הגדלת שדה הראייה במובייל מ-70 ל-90 מעלות
    const zDistance = isMobile ? 4.5 : 3; // הרחקת המצלמה במובייל מ-3 ל-4.5 יחידות
    
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, zDistance);
    
    // יצירת רנדרר
    const canvas = document.getElementById('scene');
    renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // יצירת בקרי מצלמה
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = isMobile ? 3 : 2; // התאמת מרחק מינימלי במובייל
    controls.maxDistance = isMobile ? 15 : 10; // התאמת מרחק מקסימלי במובייל
  }
  
  // יצירת אפקט Bloom
  if (window.sceneSetup && window.sceneSetup.setupPostProcessing) {
    window.sceneSetup.setupPostProcessing();
  } else {
    setupPostProcessing();
  }
  
  // יצירת חדר
  if (window.sceneSetup && window.sceneSetup.createRoom) {
    window.sceneSetup.createRoom();
  } else {
    createRoom();
  }
  
  // יצירת תאורה
  if (window.sceneSetup && window.sceneSetup.setupLighting) {
    window.sceneSetup.setupLighting();
  } else {
    setupLighting();
  }
  
  // יצירת טקסט כותרת
  if (window.animationEffects && window.animationEffects.createHeaderText) {
    window.animationEffects.createHeaderText();
  } else {
    createHeaderText();
  }
  
  // הסתרת מסך הטעינה
  setTimeout(() => {
    document.getElementById('loader').style.display = 'none';
  }, 1500);
  
  // התחלת לולאת האנימציה
  if (window.uiManager && window.uiManager.animate) {
    window.uiManager.animate();
  } else {
    animate();
  }
  
  // טעינת קבצי האפקטים
  if (window.uiManager && window.uiManager.loadEffectScripts) {
    await window.uiManager.loadEffectScripts();
  } else {
    await loadEffectScripts();
  }
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
