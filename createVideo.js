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
        
        const videoContainer = document.getElementById('video-container');
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
        
        // הגדרת סגנון לווידאו עצמו - בהתאם לאוריינטציה של התמונה
        if (isPortrait) {
          console.log('Applying portrait video styling');
          
          // התאמת גודל הווידאו לפי יחס התמונה
          videoPlayer.style.width = 'auto';
          videoPlayer.style.height = '70vh';
          videoPlayer.style.maxHeight = '80vh';
        } else {
          console.log('Applying landscape video styling');
          
          // הגדרת סגנון לווידאו עצמו - ברירת מחדל
          videoPlayer.style.width = '100%';
          videoPlayer.style.maxWidth = '100%';
        }
        
        videoPlayer.style.display = 'block';
        videoPlayer.style.margin = '0 auto';
        videoPlayer.style.marginBottom = '20px';
        
        // התאמת המכל של הווידאו
        videoContainer.style.display = 'flex';
        videoContainer.style.flexDirection = 'column';
        videoContainer.style.alignItems = 'center';
        videoContainer.style.justifyContent = 'center';
        videoContainer.style.padding = '20px';
        
        // כפתורי הפעלה
        const videoControls = document.createElement('div');
        videoControls.className = 'video-controls';
        videoControls.style.display = 'flex';
        videoControls.style.flexDirection = 'row';
        videoControls.style.justifyContent = 'center';
        videoControls.style.width = '100%';
        videoControls.style.marginTop = '20px';
        
        const downloadButton = document.createElement('button');
        downloadButton.id = 'download-video';
        downloadButton.className = 'control-button';
        downloadButton.innerText = 'הורד MP4';
        
        const backButton = document.createElement('button');
        backButton.id = 'back-to-editor';
        backButton.className = 'control-button';
        backButton.innerText = 'חזור לעריכה';
        
        videoControls.appendChild(downloadButton);
        videoControls.appendChild(backButton);
        
        // נקה את המכל קודם למניעת כפילויות
        while (videoContainer.firstChild) {
          videoContainer.removeChild(videoContainer.firstChild);
        }
        
        videoContainer.appendChild(videoPlayer);
        videoContainer.appendChild(videoControls);
        
        // הגדרת אירועים לכפתורים
        downloadButton.onclick = function() {
          const a = document.createElement('a');
          a.href = videoUrl;
          a.download = 'effect-cube-video.mp4';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        
        backButton.onclick = function() {
          videoContainer.style.display = 'none';
          document.querySelector('.controls-panel').style.display = 'flex';
        };
        
        // סגנון כפתורים
        const buttonsStyle = `
          .control-button {
            background-color: rgba(15, 15, 25, 0.85);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 25px;
            margin: 0 10px;
            font-family: 'Heebo', Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
            border-bottom: 2px solid #00f3ff;
            backdrop-filter: blur(5px);
          }
          
          .control-button:hover {
            background-color: rgba(30, 30, 50, 0.9);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
            transform: translateY(-2px);
          }
          
          #download-video {
            background: linear-gradient(45deg, #00f3ff, #9d00ff);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
          }
          
          #download-video:hover {
            background: linear-gradient(45deg, #00f3ff, #b700ff);
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.7);
          }
        `;
        
        // הוספת סגנון לדף
        const styleElement = document.createElement('style');
        styleElement.textContent = buttonsStyle;
        document.head.appendChild(styleElement);
        
        // התאמות ספציפיות למובייל
        if (window.innerWidth <= 768) {
          videoControls.style.flexDirection = 'column';
          videoControls.style.alignItems = 'center';
          downloadButton.style.marginBottom = '15px';
          downloadButton.style.width = '80%';
          backButton.style.width = '80%';
          
          // התאמת גודל הווידאו למובייל בהתאם לאוריינטציה
          if (isPortrait) {
            videoPlayer.style.height = '60vh';
            videoPlayer.style.width = 'auto';
          } else {
            videoPlayer.style.width = '100%';
            videoPlayer.style.maxHeight = '50vh';
          }
        }
        
        document.getElementById('video-container').style.display = 'flex';
        document.getElementById('video-progress').style.display = 'none';
        document.getElementById('create-video').disabled = false;
        
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
