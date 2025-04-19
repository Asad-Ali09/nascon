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
      const response = await axiosClient.post(
        `/course/add-video/${courseId}`,
        videoData
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

export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/course/my-courses");
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
