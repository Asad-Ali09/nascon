import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/lib/AxiosClient";
import axios from "axios";

const initialState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (courseData, { rejectWithValue }) => {
    try {
      let thumbnailUrl = "";

      // Upload to Cloudinary if thumbnail exists
      if (courseData.thumbnailFile) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", courseData.thumbnailFile);
        cloudinaryFormData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_PRESET_KEY
        );

        // Use regular axios for Cloudinary (not your axiosClient)
        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          cloudinaryFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: false,
          }
        );

        thumbnailUrl = cloudinaryResponse.data.secure_url;
      }

      // Now use your axiosClient for your own API
      const response = await axiosClient.post("/course/create", {
        title: courseData.title,
        description: courseData.description,
        thumbnail: thumbnailUrl,
      });

      if (response.data.success) {
        return response.data.course;
      }
      return rejectWithValue(
        response.data.message || "Failed to create course"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
);
export const addVideoToCourse = createAsyncThunk(
  "course/addVideo",
  async ({ courseId, videoData }, { rejectWithValue }) => {
    try {
      // Ensure videoData has the correct structure
      const formattedVideoData = {
        ...videoData,
        url: videoData.url,
      };

      const response = await axiosClient.post(
        `/course/add-video/${courseId}`,
        formattedVideoData
      );
      if (response.data.success) {
        return response.data.course;
      }
      return rejectWithValue(response.data.message || "Failed to add video");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add video"
      );
    }
  }
);

export const updateVideo = createAsyncThunk(
  "course/updateVideo",
  async ({ courseId, videoId, videoData }, { rejectWithValue }) => {
    try {
      // Ensure videoData has the correct structure with title and url
      const formattedVideoData = {
        title: videoData.title,
        url: videoData.url
      };

      const response = await axiosClient.put(
        `/course/${courseId}/video/${videoId}`,
        formattedVideoData
      );
      
      if (response.data.success) {
        return response.data.course;
      }
      return rejectWithValue(response.data.message || "Failed to update video");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update video"
      );
    }
  }
);

export const updateVideoOrder = createAsyncThunk(
  "course/updateVideoOrder",
  async ({ courseId, videos }, { rejectWithValue }) => {
    try {
      // Send the complete video objects in the new order
      const response = await axiosClient.put(
        `/course/${courseId}/videos/order`,
        { videos }
      );
      
      if (response.data.success) {
        return response.data.course;
      }
      return rejectWithValue(response.data.message || "Failed to update video order");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update video order"
      );
    }
  }
);

export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/course/my-courses");
      console.log("Fetched courses:", response.data.courses);
      
      // Log video data for debugging
      response.data.courses.forEach(course => {
        if (course.videos && course.videos.length > 0) {
          console.log(`Course ${course.title} has ${course.videos.length} videos`);
          course.videos.forEach(video => {
            console.log(`Video ${video.title} transcript:`, video.transcript ? "Available" : "Not available");
          });
        }
      });
      
      return response.data.courses;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/course/${courseId}`);
      console.log("Fetched course by ID:", response.data.course);
      
      // Log video data for debugging
      if (response.data.course && response.data.course.videos) {
        console.log(`Course ${response.data.course.title} has ${response.data.course.videos.length} videos`);
        response.data.course.videos.forEach(video => {
          console.log(`Video ${video.title} transcript:`, video.transcript ? "Available" : "Not available");
        });
      }
      
      return response.data.course;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.push(action.payload);
        state.currentCourse = action.payload;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Video
      .addCase(addVideoToCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVideoToCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(addVideoToCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Video
      .addCase(updateVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Video Order
      .addCase(updateVideoOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideoOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(updateVideoOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
