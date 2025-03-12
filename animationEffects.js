// animationEffects.js - אנימציות ואפקטים ויזואליים

// יצירת טקסט כותרת
function createHeaderText() {
  console.log("יצירת טקסט כותרת");
  const loader = new THREE.TextureLoader();
  
  // יצירת canvas לטקסט
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // הגדרת סגנון הטקסט
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // יצירת רקע מגניב עם עומק
  createCoolBackground(ctx, canvas.width, canvas.height);
  
  // הכנת הטקסטורה
  const textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  
  // יצירת חומר לטקסט
  neonTextMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  });
  
  // יצירת גיאומטריה לטקסט
  const textGeometry = new THREE.PlaneGeometry(5, 3);
  neonText = new THREE.Mesh(textGeometry, neonTextMaterial);
  neonText.position.set(0, 0.5, -4.5);
  scene.add(neonText);
  
  // הגדרת טקסט הכותרת והתת-כותרת
  const mainText = 'הפכו תמונות לקטעי וידאו קצרים';
  const subText = 'העלו תמונה ← בחרו אפקט ← צרו וידאו';
  
  console.log("קריאה לפונקציית animateTypingEffect");
  // הפעלת אנימציית הקלדה
  animateTypingEffect(canvas, ctx, mainText, subText);
  console.log("סיום קריאה לפונקציית animateTypingEffect");
}

// אנימציית הקלדה
function animateTypingEffect(canvas, ctx, mainText, subText) {
  console.log("התחלת אנימציית הקלדה");
  let mainTextIndex = 0;
  let subTextIndex = 0;
  let frameCount = 0;
  
  function animate() {
    frameCount++;
    
    // האט את קצב האנימציה - רק כל 5 פריימים
    if (frameCount % 5 === 0) {
      console.log("אנימציית הקלדה פריים:", frameCount, "טקסט:", mainText.substring(0, mainTextIndex));
      
      // נקה את הקנבס
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // יצירת רקע מגניב עם עומק
      createCoolBackground(ctx, canvas.width, canvas.height, frameCount);
      
      // הגדרת סגנון הטקסט הראשי
      ctx.font = 'bold 48px Heebo';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // יצירת מסגרת זוהרת לטקסט
      drawGlowingTextWithFrame(ctx, mainText.substring(0, mainTextIndex), canvas.width / 2, canvas.height / 2 - 40, 48, frameCount);
      
      // הגדרת סגנון הטקסט המשני
      ctx.font = 'bold 32px Heebo';
      
      // יצירת מסגרת זוהרת לטקסט המשני
      drawGlowingTextWithFrame(ctx, subText.substring(0, subTextIndex), canvas.width / 2, canvas.height / 2 + 40, 32, frameCount);
      
      // עדכון הטקסטורה
      neonText.material.map.needsUpdate = true;
      
      // הגדלת האינדקסים - אט יותר
      mainTextIndex = Math.min(mainTextIndex + 1, mainText.length);
      if (mainTextIndex >= mainText.length) {
        subTextIndex = Math.min(subTextIndex + 1, subText.length);
      }
    }
    
    // המשך האנימציה
    if (mainTextIndex < mainText.length || subTextIndex < subText.length) {
      requestAnimationFrame(animate);
    } else {
      console.log("סיום אנימציית הקלדה, מעבר לאנימציית רקע");
      // המשך אנימציית הרקע גם אחרי סיום ההקלדה
      animateBackground(canvas, ctx, mainText, subText);
    }
  }
  
  // התחל את האנימציה
  animate();
}

// יצירת רקע מגניב עם עומק
function createCoolBackground(ctx, width, height, frameCount = 0) {
  // רקע כהה עם גרדיאנט
  const gradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width/2);
  gradient.addColorStop(0, 'rgba(0, 40, 80, 0.8)');
  gradient.addColorStop(0.5, 'rgba(0, 20, 40, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 10, 20, 0.9)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // יצירת מסגרת ניאון מרובעת עם פינות מעוגלות
  const padding = 40;
  const cornerRadius = 20;
  
  ctx.beginPath();
  ctx.moveTo(padding + cornerRadius, padding);
  ctx.lineTo(width - padding - cornerRadius, padding);
  ctx.quadraticCurveTo(width - padding, padding, width - padding, padding + cornerRadius);
  ctx.lineTo(width - padding, height - padding - cornerRadius);
  ctx.quadraticCurveTo(width - padding, height - padding, width - padding - cornerRadius, height - padding);
  ctx.lineTo(padding + cornerRadius, height - padding);
  ctx.quadraticCurveTo(padding, height - padding, padding, height - padding - cornerRadius);
  ctx.lineTo(padding, padding + cornerRadius);
  ctx.quadraticCurveTo(padding, padding, padding + cornerRadius, padding);
  ctx.closePath();
  
  // אפקט זוהר למסגרת
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // יצירת קווי רשת תלת-מימדיים ברקע
  drawGridLines(ctx, width, height, frameCount);
}

// יצירת קווי רשת תלת-מימדיים
function drawGridLines(ctx, width, height, frameCount = 0) {
  const gridSize = 40;
  const perspective = 800;
  const horizonY = height / 2;
  
  // שמירת מצב הקנבס
  ctx.save();
  
  // הגדרת סגנון הקווים
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // קווים אופקיים
  for (let y = horizonY; y <= height; y += gridSize) {
    const perspectiveFactor = (y - horizonY) / perspective;
    const xOffset = width * perspectiveFactor * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(xOffset, y);
    ctx.lineTo(width - xOffset, y);
    ctx.stroke();
  }
  
  // קווים אנכיים עם עיוות פרספקטיבה
  const gridColumns = 20;
  for (let i = 0; i <= gridColumns; i++) {
    const xPercent = i / gridColumns;
    const x1 = width * xPercent;
    const x2 = width * 0.1 + width * 0.8 * xPercent;
    
    ctx.beginPath();
    ctx.moveTo(x1, height);
    ctx.lineTo(x2, horizonY);
    ctx.stroke();
  }
  
  // שחזור מצב הקנבס
  ctx.restore();
}

// יצירת טקסט זוהר עם מסגרת
function drawGlowingTextWithFrame(ctx, text, x, y, fontSize, frameCount = 0) {
  // מדידת רוחב הטקסט
  const textWidth = ctx.measureText(text).width;
  
  // חישוב גודל המסגרת יחסית לרוחב הקנבס
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // הגדלת המסגרת למקסימום שיתאים לטלפון נייד
  // השתמש ב-80% מרוחב הקנבס
  const frameWidth = canvasWidth * 0.8;
  // גובה המסגרת יהיה יחסי לגודל הפונט אבל גדול יותר
  const frameHeight = fontSize * 2.5;
  const cornerRadius = 15;
  
  // שמירת מצב הקנבס
  ctx.save();
  
  // יצירת מסגרת
  ctx.beginPath();
  ctx.moveTo(x - frameWidth/2 + cornerRadius, y - frameHeight/2);
  ctx.lineTo(x + frameWidth/2 - cornerRadius, y - frameHeight/2);
  ctx.quadraticCurveTo(x + frameWidth/2, y - frameHeight/2, x + frameWidth/2, y - frameHeight/2 + cornerRadius);
  ctx.lineTo(x + frameWidth/2, y + frameHeight/2 - cornerRadius);
  ctx.quadraticCurveTo(x + frameWidth/2, y + frameHeight/2, x + frameWidth/2 - cornerRadius, y + frameHeight/2);
  ctx.lineTo(x - frameWidth/2 + cornerRadius, y + frameHeight/2);
  ctx.quadraticCurveTo(x - frameWidth/2, y + frameHeight/2, x - frameWidth/2, y + frameHeight/2 - cornerRadius);
  ctx.lineTo(x - frameWidth/2, y - frameHeight/2 + cornerRadius);
  ctx.quadraticCurveTo(x - frameWidth/2, y - frameHeight/2, x - frameWidth/2 + cornerRadius, y - frameHeight/2);
  ctx.closePath();
  
  // צביעת הרקע של המסגרת - רקע כהה יותר להבלטת הטקסט
  const gradient = ctx.createLinearGradient(
    x - frameWidth/2, y, 
    x + frameWidth/2, y
  );
  gradient.addColorStop(0, 'rgba(0, 10, 30, 0.9)'); // רקע אטום יותר
  gradient.addColorStop(0.5, 'rgba(0, 20, 50, 0.9)');
  gradient.addColorStop(1, 'rgba(0, 10, 30, 0.9)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // מסגרת רגילה ללא אפקט ניאון
  ctx.shadowBlur = 0; // ביטול אפקט הזוהר
  ctx.strokeStyle = '#4080a0'; // צבע מסגרת רגיל במקום ניאון
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // הגדרת סגנון הטקסט - ללא אפקט זוהר
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // טקסט לבן בהיר עם קו מתאר דק
  ctx.strokeStyle = '#000000'; // קו מתאר שחור דק סביב הטקסט לשיפור הקריאות
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  
  ctx.fillStyle = '#ffffff'; // טקסט לבן בהיר
  ctx.fillText(text, x, y);
  
  // שחזור מצב הקנבס
  ctx.restore();
}

// פונקציה לקבלת צבע ניאון משתנה לפי זמן
function getNeonColorByTime(frameCount) {
  // שינוי צבעים עדין בין גווני כחול, טורקיז וסגול
  const time = frameCount * 0.01; // האטת קצב שינוי הצבע
  
  // ערכי HSL בסיס - גוון (0-360), רוויה (0-100), בהירות (0-100)
  const hue = (180 + 30 * Math.sin(time)) % 360; // נע בין 150-210 (טורקיז-כחול-סגול)
  const saturation = 100; // רוויה מלאה
  const lightness = 60 + 10 * Math.sin(time * 1.5); // בהירות משתנה
  
  // צבע בסיסי לגבול
  const borderColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  // צבע זוהר (בהיר יותר)
  const glowColor = `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`;
  
  return {
    border: borderColor,
    glow: glowColor
  };
}

// אנימציית רקע מתמשכת
function animateBackground(canvas, ctx, mainText, subText) {
  console.log("התחלת אנימציית רקע");
  let frameCount = 0;
  
  function animate() {
    frameCount++;
    if (frameCount % 10 === 0) {
      console.log("אנימציית רקע פריים:", frameCount);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // יצירת רקע מגניב עם עומק
    createCoolBackground(ctx, canvas.width, canvas.height, frameCount);
    
    // הגדרת סגנון הטקסט הראשי
    ctx.font = 'bold 48px Heebo';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // יצירת מסגרת זוהרת לטקסט
    drawGlowingTextWithFrame(ctx, mainText, canvas.width / 2, canvas.height / 2 - 40, 48, frameCount);
    
    // הגדרת סגנון הטקסט המשני
    ctx.font = 'bold 32px Heebo';
    
    // יצירת מסגרת זוהרת לטקסט המשני
    drawGlowingTextWithFrame(ctx, subText, canvas.width / 2, canvas.height / 2 + 40, 32, frameCount);
    
    // עדכון הטקסטורה
    neonText.material.map.needsUpdate = true;
    
    // המשך האנימציה
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ייצוא הפונקציות
window.animationEffects = {
  createHeaderText,
  animateTypingEffect,
  createCoolBackground,
  drawGridLines,
  drawGlowingTextWithFrame,
  getNeonColorByTime,
  animateBackground
};
