export const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        const aspectRatio = width / height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            // Width is the limiting factor
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            // Height is the limiting factor
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Ensure dimensions are integers
        width = Math.round(width);
        height = Math.round(height);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.85; // Adjusted quality for better balance
        if (file.type === 'image/png') {
          // For PNGs, if they become very large, consider converting to JPEG
          // or just use PNG. For now, stick to PNG for transparency.
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.onerror = (error) => {
        console.error("Image loading error in resizeImage:", error);
        reject(new Error("Could not load image for resizing."));
      };
    };
    reader.onerror = (error) => {
      console.error("FileReader error in resizeImage:", error);
      reject(new Error("Could not read file for resizing."));
    };
  });
};
