// createPortraitVideo.js - טיפול ביצירת וידאו לתמונות אורכיות (פורטרט)

// פונקציה ליצירת וידאו במצב פורטרט (אורכי)
function createPortraitVideo() {
  if (!imageMesh) return;
  
  // הצגת פס התקדמות
  document.getElementById('video-progress').style.display = 'block';
  document.getElementById('create-video').disabled = true;
  
  // הכנת הרשימה של האפקטים להצגה
  const effectsList = Object.entries(activeEffects).map(([category, effect]) => {
    let hebrewCategory = '';
    switch (category) {
      case 'appearance': hebrewCategory = 'הופעת תמונה'; break;
      case 'camera': hebrewCategory = 'תנועת מצלמה'; break;
      case 'objects': hebrewCategory = 'אובייקטים זזים'; break;
      case 'light': hebrewCategory = 'אור וצבע'; break;
    }
    let effectName = effect;
    if (category === 'appearance' && window.imageAppearanceEffects) {
      const effectObj = Object.values(window.imageAppearanceEffects).find(e => e.value === effect);
      if (effectObj) effectName = effectObj.name;
    } else if (category === 'camera' && window.cameraMovementEffects) {
      const effectObj = Object.values(window.cameraMovementEffects).find(e => e.value === effect);
      if (effectObj) effectName = effectObj.name;
    } else if (category === 'objects' && window.movingObjectsEffects) {
      const effectObj = Object.values(window.movingObjectsEffects).find(e => e.value === effect);
      if (effectObj) effectName = effectObj.name;
    } else if (category === 'light' && window.lightAndColorEffects) {
      const effectObj = Object.values(window.lightAndColorEffects).find(e => e.value === effect);
      if (effectObj) effectName = effectObj.name;
    }
    return `${hebrewCategory}: ${effectName}`;
  }).join(', ');
  document.getElementById('applied-effects').textContent = effectsList.length > 0 ? `אפקטים: ${effectsList}` : 'ללא אפקטים';
  
  // יצירת רנדרר נפרד רק לתמונה - במצב פורטרט (720x1280)
  const imageRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  imageRenderer.setSize(720, 1280); // שינוי הגודל למצב פורטרט
  imageRenderer.setClearColor(0x000000, 0);
  
  // יצירת סצנה נפרדת רק לתמונה
  const imageScene = new THREE.Scene();
  const imageCopy = imageMesh.clone();
  
  // העתקת מידע משמעותי מה-mesh המקורי לעותק
  if (imageMesh.userData) {
    imageCopy.userData = Object.assign({}, imageMesh.userData);
  }
  
  imageScene.add(imageCopy);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 1);
  imageScene.add(light);
  
  // מצלמה בגודל סביר: הגדלת ה-FOV כדי לכלול את כל התמונה האורכית
  const imageCamera = new THREE.PerspectiveCamera(75, 720 / 1280, 0.1, 1000); // הגדלת ה-FOV ל-75 במקום 60
  // הרחקת המצלמה כדי לכלול את כל התמונה בגודל סביר
  imageCamera.position.z = 2.5; // הרחקת המצלמה יותר (מ-1.5 ל-2.5) כדי לראות את כל התמונה
  
  // ודא שהעותק של התמונה מוצב ומשוקלל נכון
  // התאמת גודל התמונה לווידאו במצב פורטרט
  imageCopy.position.set(0, 0, 0);
  
  // התאמת סקייל לתמונה אורכית
  if (imageMesh.scale) {
    // בדיקה אם מדובר באפקט תנועת מצלמה, ואם כן - הגדלת התמונה יותר
    if (activeEffects.camera) {
      // הגדלה מוגברת לאפקטי תנועת מצלמה
      imageCopy.scale.copy(imageMesh.scale).multiplyScalar(1.2);
    } else {
      // הגדלה רגילה לשאר האפקטים
      imageCopy.scale.copy(imageMesh.scale).multiplyScalar(0.5); // הקטנת הסקייל מ-0.7 ל-0.5 כדי לראות את כל התמונה
    }
    // שמירת הסקייל המקורי לשימוש בפונקציות עדכון
    imageCopy.userData.originalScale = imageCopy.scale.clone();
  } else {
    if (activeEffects.camera) {
      // הגדלה מוגברת לאפקטי תנועת מצלמה
      imageCopy.scale.set(1.2, 1.2, 1.2); // הקטנת הסקייל מ-2.0 ל-1.2
      imageCopy.userData.originalScale = new THREE.Vector3(1.2, 1.2, 1.2);
    } else {
      // הגדלה רגילה לשאר האפקטים
      imageCopy.scale.set(0.5, 0.5, 0.5); // הקטנת הסקייל מ-0.7 ל-0.5
      imageCopy.userData.originalScale = new THREE.Vector3(0.5, 0.5, 0.5);
    }
  }
  
  const imageComposer = new THREE.EffectComposer(imageRenderer);
  const renderPass = new THREE.RenderPass(imageScene, imageCamera);
  imageComposer.addPass(renderPass);
  
  const fxaaPassCopy = new THREE.ShaderPass(THREE.FXAAShader);
  fxaaPassCopy.material.uniforms['resolution'].value.x = 1 / 720; // התאמה לרזולוציה החדשה
  fxaaPassCopy.material.uniforms['resolution'].value.y = 1 / 1280; // התאמה לרזולוציה החדשה
  fxaaPassCopy.enabled = true;
  imageComposer.addPass(fxaaPassCopy);
  
  // הוספת הפילטרים הנדרשים לאפקטים
  // BLOOM
  const bloomPassCopy = new THREE.UnrealBloomPass(new THREE.Vector2(720, 1280), 1.5, 0.4, 0.85); // התאמה לרזולוציה החדשה
  imageComposer.addPass(bloomPassCopy);
  
  // GLITCH
  const glitchPassCopy = new THREE.GlitchPass();
  glitchPassCopy.enabled = false;
  imageComposer.addPass(glitchPassCopy);
  
  // COLOR
  const colorPassCopy = new THREE.ShaderPass(THREE.ColorCorrectionShader);
  colorPassCopy.enabled = false;
  imageComposer.addPass(colorPassCopy);
  
  // FILM
  const filmPassCopy = new THREE.FilmPass(0.35, 0.025, 648, false);
  filmPassCopy.enabled = false;
  imageComposer.addPass(filmPassCopy);
  
  imageComposer.render();
  
  const stream = imageRenderer.domElement.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.start();
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    document.getElementById('video-progress').style.width = `${Math.min(progress, 100)}%`;
  }, 100);
  
  const startTime = Date.now();
  const duration = 5000; // 5 שניות
  
  // פונקציה להחלת האפקטים על העותק של התמונה
  function applyEffectsToImageCopy() {
    // אפס את כל האפקטים הקודמים לפני החלת האפקטים החדשים
    if (window.resetCameraEffects) {
      window.resetCameraEffects(imageCopy, imageComposer);
    }
    if (window.resetAppearanceEffects) {
      window.resetAppearanceEffects(imageCopy);
    }
    if (window.resetMovingObjectsEffects) {
      window.resetMovingObjectsEffects(imageCopy, imageScene, imageComposer);
    }
    if (window.resetLightAndColorEffects) {
      window.resetLightAndColorEffects(imageCopy, imageScene, imageComposer);
    }
    
    // החלת האפקטים על העותק של התמונה
    Object.entries(activeEffects).forEach(([category, effect]) => {
      switch (category) {
        case 'appearance':
          if (window.applyImageAppearanceEffect) {
            window.applyImageAppearanceEffect(effect, imageCopy, imageScene, imageComposer);
          }
          break;
        case 'camera':
          if (window.applyCameraMovementEffect) {
            window.applyCameraMovementEffect(effect, imageCopy, imageScene, imageComposer);
          }
          break;
        case 'objects':
          if (window.applyMovingObjectsEffect) {
            window.applyMovingObjectsEffect(effect, imageCopy, imageScene, imageComposer);
          }
          break;
        case 'light':
          if (window.applyLightAndColorEffect) {
            window.applyLightAndColorEffect(effect, imageCopy, imageScene, imageComposer);
          }
          break;
        default:
          // אפקטים קלאסיים
          switch (effect) {
            case 'neon':
              bloomPassCopy.strength = 1.5;
              bloomPassCopy.radius = 0.4;
              bloomPassCopy.threshold = 0.85;
              break;
            case 'glitch':
              glitchPassCopy.enabled = true;
              break;
            case 'zoom':
              // אנימציית זום תיושם בפונקצית האנימציה
              break;
            case 'rotate':
              // אנימציית סיבוב תיושם בפונקצית האנימציה
              break;
            case 'film':
              filmPassCopy.enabled = true;
              break;
            case 'color':
              colorPassCopy.enabled = true;
              colorPassCopy.uniforms['powRGB'].value = new THREE.Vector3(1.4, 1.2, 1.0);
              break;
          }
          break;
      }
    });
  }
  
  function animateImage() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    
    if (elapsed < duration) {
      // אנימציה של העותק בהתאם לזמן שחלף
      const time = elapsed * 0.001; // המרה למילישניות
      const delta = 0.016; // כ-60 פריימים בשנייה
      
      // קריאה לפונקציות העדכון של כל האפקטים הפעילים
      Object.entries(activeEffects).forEach(([category, effect]) => {
        switch (category) {
          case 'appearance':
            if (window.imageAppearanceEffects && window.imageAppearanceEffects[effect] && window.imageAppearanceEffects[effect].update) {
              window.imageAppearanceEffects[effect].update(imageCopy, delta);
            }
            break;
          case 'camera':
            if (window.cameraMovementEffects && window.cameraMovementEffects[effect] && window.cameraMovementEffects[effect].update) {
              window.cameraMovementEffects[effect].update(imageCopy, delta);
            }
            break;
          case 'objects':
            if (window.movingObjectsEffects && window.movingObjectsEffects[effect] && window.movingObjectsEffects[effect].update) {
              window.movingObjectsEffects[effect].update(imageCopy, delta);
            }
            break;
          case 'light':
            if (window.lightAndColorEffects && window.lightAndColorEffects[effect] && window.lightAndColorEffects[effect].update) {
              window.lightAndColorEffects[effect].update(imageCopy, delta);
            }
            break;
        }
      });
      
      // קריאה לפונקציית העדכון הישנה אם קיימת (לתאימות לאחור)
      if (imageCopy.userData && imageCopy.userData.updateFunction) {
        const bounds = {
          width: imageCopy.userData.originalImageWidth || 1,
          height: imageCopy.userData.originalImageHeight || 1,
          aspectRatio: (imageCopy.userData.originalImageWidth || 1) / (imageCopy.userData.originalImageHeight || 1)
        };
        imageCopy.userData.updateFunction(delta, bounds);
      }
      
      // החלת אפקטים על העותק של התמונה
      if (activeEffects.camera === 'zoom') {
        const zoomFactor = 1 + progress * 0.5; // זום עד 150%
        imageCopy.scale.set(zoomFactor, zoomFactor, 1);
      }
      
      if (activeEffects.camera === 'rotate') {
        imageCopy.rotation.z = progress * Math.PI * 2; // סיבוב מלא
      }
      
      if (activeEffects.camera === 'pan') {
        imageCopy.position.x = Math.sin(time) * 0.5;
      }
      
      if (activeEffects.light === 'neon') {
        bloomPassCopy.strength = 1.5 + Math.sin(time * 3) * 0.5;
      }
      
      // רנדור של הסצנה עם האפקטים
      imageComposer.render();
      requestAnimationFrame(animateImage);
    }
  }
  
  // החלת האפקטים פעם אחת לפני האנימציה
  applyEffectsToImageCopy();
  
  // התחלת האנימציה
  animateImage();
  
  setTimeout(() => {
    mediaRecorder.stop();
    clearInterval(progressInterval);
    document.getElementById('video-progress').style.width = '100%';
    mediaRecorder.onstop = async () => {
      try {
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(webmBlob);
        const videoPlayer = document.getElementById('output-video');
        videoPlayer.src = videoUrl;
        
        // ודא שאירוע onloadeddata נורה כאשר הווידאו מוכן להצגה
        videoPlayer.onloadeddata = () => {
          console.log('הווידאו נטען בהצלחה וזמין להפעלה');
          // נסה להריץ את הווידאו אוטומטית
          videoPlayer.play().catch(e => console.error('שגיאה בהפעלת הווידאו:', e));
        };
        
        videoPlayer.onerror = (e) => {
          console.error('שגיאה בטעינת הווידאו:', e);
        };
        
        document.getElementById('video-container').style.display = 'flex';
        document.getElementById('video-progress').style.display = 'none';
        document.getElementById('create-video').disabled = false;
        
        // התאמות למובייל - מיקום במרכז המסך
        const videoContainer = document.getElementById('video-container');
        
        // מיקום במרכז המסך - אחיד לכל המכשירים
        videoContainer.style.position = 'fixed';
        videoContainer.style.top = '50%';
        videoContainer.style.left = '50%';
        videoContainer.style.transform = 'translate(-50%, -50%)';
        videoContainer.style.margin = '0 auto';
        videoContainer.style.width = '90%';
        videoContainer.style.boxSizing = 'border-box';
        videoContainer.style.background = 'rgba(15, 15, 25, 0.92)';
        videoContainer.style.backdropFilter = 'blur(10px)';
        videoContainer.style.boxShadow = '0 0 20px rgba(0, 200, 255, 0.3)';
        videoContainer.style.border = '1px solid rgba(100, 200, 255, 0.15)';
        videoContainer.style.zIndex = '1000';
        
        // הגדרת סגנון לווידאו עצמו - התאמה למצב פורטרט
        videoPlayer.style.width = '100%'; // שינוי ל-100% כדי למלא את המיכל
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.maxHeight = '80vh'; // הגדלת הגובה המקסימלי מ-70vh ל-80vh
        videoPlayer.style.borderRadius = '8px';
        videoPlayer.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.4)';
        
        // בדיקה אם המכשיר הוא טלפון נייד (רוחב מסך קטן מ-768 פיקסלים)
        if (window.innerWidth <= 768) {
          // הגדרות נוספות ספציפיות למובייל
          videoContainer.style.maxWidth = '100%'; 
          videoContainer.style.maxHeight = '95vh'; 
          videoContainer.style.display = 'flex';
          videoContainer.style.flexDirection = 'column';
          videoContainer.style.justifyContent = 'center';
          videoContainer.style.alignItems = 'center';
          videoContainer.style.padding = '10px'; 
          videoContainer.style.paddingBottom = '40px'; 
          videoContainer.style.margin = '0 auto'; 
          videoContainer.style.right = 'auto'; 
          videoContainer.style.left = '50%'; 
          videoContainer.style.transform = 'translate(-50%, -50%)'; 
          videoContainer.style.height = 'auto'; 
          videoContainer.style.minHeight = '85vh'; 
          
          // התאמות ספציפיות לווידאו במובייל
          videoPlayer.style.width = '100%';
          videoPlayer.style.maxHeight = '70vh';
          videoPlayer.style.objectFit = 'contain';  
          
          // עיצוב ספציפי לכפתורים
          const videoControls = document.querySelector('.video-controls');
          
          // מיקום במרכז המסך - אחיד לכל המכשירים
          videoControls.style.position = 'relative';
          videoControls.style.bottom = 'auto';
          videoControls.style.left = '0';
          videoControls.style.right = '0';
          videoControls.style.width = '100%';
          videoControls.style.display = 'flex';
          videoControls.style.justifyContent = 'center';
          videoControls.style.alignItems = 'center';
          videoControls.style.padding = '15px 10px';
          videoControls.style.background = 'transparent';
          videoControls.style.zIndex = '1001';
          videoControls.style.marginTop = '5px'; 
          
          // התאמת הצגת מידע האפקטים במצב מובייל
          const appliedEffects = document.getElementById('applied-effects');
          if (appliedEffects) {
            appliedEffects.style.marginBottom = '15px';
            appliedEffects.style.marginTop = '0';
            appliedEffects.style.width = '90%';
            appliedEffects.style.padding = '8px 10px';
            appliedEffects.style.fontSize = '15px';
            appliedEffects.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.2)';
            appliedEffects.style.background = 'rgba(20, 20, 20, 0.8)';
            appliedEffects.style.position = 'relative';
            appliedEffects.style.top = '-20px'; 
            appliedEffects.style.marginBottom = '0px'; 
            appliedEffects.style.textAlign = 'center'; 
            appliedEffects.style.display = 'block'; 
            appliedEffects.style.margin = '0 auto 15px auto'; 
            appliedEffects.style.borderRadius = '8px'; 
            appliedEffects.style.border = '1px solid rgba(0, 243, 255, 0.3)'; 
            appliedEffects.style.left = '0'; 
          }
        }
        
        // הוספת כפתור הורדה
        const downloadButton = document.getElementById('download-video');
        if (downloadButton) {
          downloadButton.addEventListener('click', async () => {
            try {
              // יצירת קישור להורדה
              const a = document.createElement('a');
              a.href = videoUrl;
              a.download = 'portrait-video-effect.webm';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (error) {
              console.error('שגיאה בהורדת הווידאו:', error);
              alert('אירעה שגיאה בהורדת הווידאו. נסה שוב מאוחר יותר.');
            }
          });
        }
      } catch (error) {
        console.error('שגיאה ביצירת הווידאו:', error);
        document.getElementById('video-progress').style.display = 'none';
        document.getElementById('create-video').disabled = false;
        alert('אירעה שגיאה ביצירת הווידאו. נסה שוב מאוחר יותר.');
      }
    };
  }, duration);
}

// ייצוא הפונקציה לחלון הגלובלי
window.createPortraitVideo = createPortraitVideo;
