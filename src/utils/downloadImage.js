export const downloadImage = async (url, title, width, height, qualityName) => {
  try {
    let proxyUrl = url;
    if (url.startsWith('https://w.wallhaven.cc/')) {
      proxyUrl = url.replace('https://w.wallhaven.cc/', '/w-image/');
    } else if (url.startsWith('https://th.wallhaven.cc/')) {
      proxyUrl = url.replace('https://th.wallhaven.cc/', '/th-image/');
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    
    img.onload = () => {
      try {
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
        
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${qualityName}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.warn('Canvas tainted or download failed, falling back to original image', err);
        window.open(url, '_blank');
      }
    };

    img.onerror = () => {
      console.error('Failed to load image for downloading. Falling back to original URL.');
      window.open(url, '_blank');
    };

    img.src = proxyUrl;
  } catch (error) {
    console.error('Download error:', error);
    window.open(url, '_blank');
  }
};
