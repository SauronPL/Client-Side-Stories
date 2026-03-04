export const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      // ustawiamy minimalny czas, żeby złapać klatkę
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(video.src);
      resolve(thumbnail);
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};
