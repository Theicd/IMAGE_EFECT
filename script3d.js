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

document.getElementById('create-video').addEventListener('click', createVideo);
document.getElementById('back-to-editor').addEventListener('click', () => {
  document.getElementById('video-container').style.display = 'none';
});

// פונקציה לעדכון סגנון הכפתורים במצב טלפון
function updateMobileButtonStyles() {
  // בדיקה אם המכשיר הוא טלפון נייד (רוחב מסך קטן מ-768 פיקסלים)
  if (window.innerWidth <= 768) {
    // רשימת כפתורים לעדכון
    const buttonsToStyle = [
      document.querySelector('.upload-button'), // כפתור העלה תמונה
      document.getElementById('category-select'), // כפתור בחר קטגוריה
      document.getElementById('effect-select'), // כפתור בחר אפקט
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
    
    // עיצוב ספציפי לכפתור צור וידאו
    const createVideoButton = document.getElementById('create-video');
    if (createVideoButton) {
      createVideoButton.style.background = 'linear-gradient(45deg, #00f3ff, #9d00ff)';
      createVideoButton.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.5)';
    }
  }
}

// פונקציית אתחול
async function init() {
  // יצירת סצנה
  if (window.sceneSetup && window.sceneSetup.setupScene) {
    window.sceneSetup.setupScene();
  } else {
    // יצירת סצנה
    scene = new THREE.Scene();
    
    // יצירת מצלמה
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 3);
    
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
    controls.minDistance = 2;
    controls.maxDistance = 10;
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

// יצירת וידאו
function createVideo() {
  console.log("יצירת וידאו");
  
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
