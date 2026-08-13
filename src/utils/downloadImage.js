export const downloadImage = async (url, title, width, height, qualityName) => {
  try {
    const img = new Image();
    // Enable CORS to allow toDataURL if loading from an external source (though we use local images here)
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Calculate aspect ratio to crop if necessary
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (imgRatio > targetRatio) {
        // Source is wider, crop sides
        sourceWidth = img.height * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Source is taller, crop top/bottom
        sourceHeight = img.width / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, width, height
      );
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${qualityName}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.onerror = () => {
      console.error('Failed to load image for downloading.');
      alert('Failed to download image.');
    };

    img.src = url;
  } catch (error) {
    console.error('Download error:', error);
  }
};
