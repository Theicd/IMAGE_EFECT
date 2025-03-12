// createVideo.js - Handles video creation logic

// פונקציה ליצירת וידאו
function createVideoFull() {
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
  
  // בדיקת היחס בין רוחב וגובה של התמונה המקורית
  let imageAspectRatio = 1;
  let isPortrait = false;
  let videoWidth = 1280;
  let videoHeight = 720;
  
  if (imageMesh.userData && imageMesh.userData.originalTexture) {
    const img = imageMesh.userData.originalTexture.image;
    if (img) {
      imageAspectRatio = img.width / img.height;
      isPortrait = imageAspectRatio < 0.9; // אם היחס קטן מ-0.9, זו כנראה תמונת פורטרט
      console.log('Image aspect ratio:', imageAspectRatio, 'Is portrait:', isPortrait);
      
      // התאמת גודל הווידאו לפי יחס התמונה
      if (isPortrait) {
        // אם התמונה היא פורטרט, הפוך את הרוחב והגובה כדי שהתמונה תוצג נכון
        videoWidth = 720;
        videoHeight = 1280;
        console.log('Using portrait video dimensions:', videoWidth, 'x', videoHeight);
      }
    }
  }
  
  // יצירת רנדרר נפרד רק לתמונה - עם גודל שמותאם לכיוון התמונה
  const imageRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  imageRenderer.setSize(videoWidth, videoHeight);
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

  // מצלמה בגודל סביר - יחס שמותאם לכיוון התמונה
  const imageCamera = new THREE.PerspectiveCamera(45, videoWidth / videoHeight, 0.1, 1000);
  
  // התאמת מרחק המצלמה בהתאם לכיוון התמונה (פורטרט או לרוחב)
  let cameraDistance = 1.3; // ערך ברירת מחדל לתמונות לרוחב
  
  if (isPortrait) {
    // אם התמונה היא פורטרט, הרחק את המצלמה יותר כדי לכלול את כל הגובה
    cameraDistance = 1.3; // נשתמש באותו מרחק, אבל היחס שונה
  }
  
  // הרחקת המצלמה כדי לכלול את כל התמונה בגודל סביר
  imageCamera.position.z = cameraDistance;
  
  // וידאו של רנדרר נפרד רק לתמונה
  const imageComposer = new THREE.EffectComposer(imageRenderer);
  const renderPass = new THREE.RenderPass(imageScene, imageCamera);
  imageComposer.addPass(renderPass);
  
  const fxaaPassCopy = new THREE.ShaderPass(THREE.FXAAShader);
  fxaaPassCopy.material.uniforms['resolution'].value.x = 1 / videoWidth;
  fxaaPassCopy.material.uniforms['resolution'].value.y = 1 / videoHeight;
  fxaaPassCopy.enabled = true;
  imageComposer.addPass(fxaaPassCopy);
  
  // הוספת הפילטרים הנדרשים לאפקטים
  // BLOOM
  const bloomPassCopy = new THREE.UnrealBloomPass(new THREE.Vector2(videoWidth, videoHeight), 1.5, 0.4, 0.85);
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
            // לא מאפסים את גודל התמונה עבור אפקטי הופעת תמונה
            // כדי שהתמונה תמלא את כל המסך
            // imageCopy.scale.copy(imageCopy.userData.originalScale);
          }
          break;
        case 'camera':
          if (window.applyCameraMovementEffect) {
            window.applyCameraMovementEffect(effect, imageCopy, imageScene, imageComposer);
            // לא מאפסים את גודל התמונה עבור אפקטי תנועת מצלמה
            // כדי שהתמונה תמלא את כל המסך
            // imageCopy.scale.copy(imageCopy.userData.originalScale);
          }
          break;
        case 'objects':
          if (window.applyMovingObjectsEffect) {
            window.applyMovingObjectsEffect(effect, imageCopy, imageScene, imageComposer);
            // לא מאפסים את גודל התמונה עבור אפקטי אובייקטים זזים
            // כדי שהתמונה תמלא את כל המסך
            // imageCopy.scale.copy(imageCopy.userData.originalScale);
          }
          break;
        case 'light':
          if (window.applyLightAndColorEffect) {
            window.applyLightAndColorEffect(effect, imageCopy, imageScene, imageComposer);
            // לא מאפסים את גודל התמונה עבור אפקטי אור וצבע
            // כדי שהתמונה תמלא את כל המסך
            // imageCopy.scale.copy(imageCopy.userData.originalScale);
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
            } else {
              // אם אין פונקציית עדכון, לא נאפס את גודל התמונה
            }
            break;
          case 'camera':
            if (window.cameraMovementEffects && window.cameraMovementEffects[effect] && window.cameraMovementEffects[effect].update) {
              window.cameraMovementEffects[effect].update(imageCopy, delta);
            } else {
              // אם אין פונקציית עדכון, לא נאפס את הגודל
            }
            break;
          case 'objects':
            if (window.movingObjectsEffects && window.movingObjectsEffects[effect] && window.movingObjectsEffects[effect].update) {
              window.movingObjectsEffects[effect].update(imageCopy, delta);
            } else {
              // אם אין פונקציית עדכון, לא נאפס את גודל התמונה
            }
            break;
          case 'light':
            if (window.lightAndColorEffects && window.lightAndColorEffects[effect] && window.lightAndColorEffects[effect].update) {
              window.lightAndColorEffects[effect].update(imageCopy, delta);
            } else {
              // אם אין פונקציית עדכון, לא נאפס את גודל התמונה
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
        
        // הגדרת סגנון לווידאו עצמו
        videoPlayer.style.width = '100%';
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.borderRadius = '8px';
        videoPlayer.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.4)';
        
        // בדיקה אם המכשיר הוא טלפון נייד (רוחב מסך קטן מ-768 פיקסלים)
        if (window.innerWidth <= 768) {
          // הגדרות נוספות ספציפיות למובייל
          videoContainer.style.maxWidth = '95%';
          videoContainer.style.maxHeight = '90vh';
          videoContainer.style.display = 'flex';
          videoContainer.style.flexDirection = 'column';
          videoContainer.style.justifyContent = 'center';
          videoContainer.style.alignItems = 'center';
          videoContainer.style.padding = '20px';
          videoContainer.style.paddingBottom = '60px'; // הגדלת הפדינג התחתון
          videoContainer.style.margin = '0 auto'; // מרכוז אופקי
          videoContainer.style.right = 'auto'; // ביטול צמידה לצד
          videoContainer.style.left = '50%'; // מיקום במרכז המסך
          videoContainer.style.transform = 'translate(-50%, -50%)'; // שמירה על מרכוז אנכי ואופקי
          videoContainer.style.height = 'auto'; // גובה אוטומטי
          videoContainer.style.minHeight = '80vh'; // גובה מינימלי
          
          // הגדרת סגנון לכפתורים
          const videoControls = document.querySelector('.video-controls');
          videoControls.style.position = 'relative';
          videoControls.style.bottom = 'auto';
          videoControls.style.left = '0';
          videoControls.style.right = '0';
          videoControls.style.width = '100%';
          videoControls.style.display = 'flex';
          videoControls.style.justifyContent = 'center';
          videoControls.style.padding = '15px 10px';
          videoControls.style.background = 'transparent';
          videoControls.style.zIndex = '1001';
          videoControls.style.marginTop = '70px'; // הגדלת המרווח מעל הכפתורים ל-70px
          
          // עיצוב חדש לכפתורים בהתאם לעיצוב הכללי של הממשק
          const downloadButton = document.getElementById('download-video');
          const backButton = document.getElementById('back-to-editor');
          
          // מערך הכפתורים לעיצוב
          const buttonsToStyle = [downloadButton, backButton];
          
          buttonsToStyle.forEach(button => {
            if (button) {
              // עיצוב בסיסי
              button.style.backgroundColor = 'rgba(10, 10, 20, 0.8)';
              button.style.color = 'white';
              button.style.border = 'none';
              button.style.borderRadius = '8px';
              button.style.padding = '12px 20px';
              button.style.margin = '0 10px';
              button.style.fontFamily = "'Heebo', Arial, sans-serif";
              button.style.fontSize = '16px';
              button.style.fontWeight = 'bold';
              button.style.cursor = 'pointer';
              button.style.transition = 'all 0.3s ease';
              button.style.textAlign = 'center';
              button.style.width = '100%';
              button.style.boxSizing = 'border-box';
              
              // אפקטים מתקדמים - תאורת ניאון וגלו
              button.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.3)';
              button.style.borderBottom = '2px solid var(--neon-blue, #00f3ff)';
              button.style.backdropFilter = 'blur(5px)';
            }
          });
          
          // עיצוב ספציפי לכפתור הורדה
          if (downloadButton) {
            downloadButton.style.background = 'linear-gradient(45deg, #00f3ff, #9d00ff)';
            downloadButton.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.5)';
          }
          
          // התאמת גודל הווידאו
          videoPlayer.style.maxHeight = '50vh';
          videoPlayer.style.marginBottom = '20px';
          videoPlayer.style.objectFit = 'contain';
          videoPlayer.style.margin = '0 auto'; // מרכוז אופקי
          videoPlayer.style.display = 'block'; // חשוב לתצוגה נכונה
          videoPlayer.style.position = 'relative'; // הגדרת מיקום יחסי
          videoPlayer.style.right = 'auto'; // ביטול צמידה לצד ימין
          videoPlayer.style.left = 'auto'; // ביטול צמידה לצד שמאל
          
          // התאמת הצגת מידע האפקטים
          const videoInfo = document.querySelector('.video-info');
          if (videoInfo) {
            videoInfo.style.marginBottom = '15px';
            videoInfo.style.marginTop = '0';
            videoInfo.style.width = '90%';
            videoInfo.style.padding = '8px 10px';
            videoInfo.style.fontSize = '14px';
            videoInfo.style.boxShadow = '0 0 10px rgba(0, 243, 255, 0.2)';
            videoInfo.style.background = 'rgba(20, 20, 20, 0.8)';
          }
        }
        
        // הפעלת הווידאו
        videoPlayer.play();
        
        document.getElementById('download-video').onclick = () => {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = `effect_cube_video.webm`;
          a.click();
        };
      } catch (error) {
        console.error('שגיאה ביצירת הווידאו:', error);
        document.getElementById('video-progress').style.display = 'none';
        document.getElementById('create-video').disabled = false;
      }
    };
  }, duration);
}

// ייצוא הפונקציה לחלון הגלובלי
window.createVideoFull = createVideoFull;
