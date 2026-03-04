export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration * 1000); // ms
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};
