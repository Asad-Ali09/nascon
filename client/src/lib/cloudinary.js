import axios from "axios";

const uploadCloudinary = async (file, isVideo) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_KEY);

  if (isVideo) {
    formData.append("resource_type", "video");
  }

  const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudname}/${
        isVideo ? "video" : "image"
      }/upload`,
      formData,
      {
        withCredentials: false,
      }
    );

    return response.data.secure_url;
  } catch (error) {
    throw error;
  }
};

export default uploadCloudinary;
