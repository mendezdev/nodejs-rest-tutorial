const fs = require("fs");

module.exports = cloudinary => {
  const saveImage = path => {
    return new Promise((resolve, rejected) => {
      cloudinary.uploader.upload(path, result => {
        resolve(result);
      });
    });
  };
  
  const removeTempImage = path => {
    return new Promise((resolve, reject) => {
      fs.unlink(path, error => {
        if (error) {
          reject({
            success: false,
            error
          });
        }
  
        resolve({ success: true });
      });
    });
  };

  return {
    saveImage,
    removeTempImage
  };
}