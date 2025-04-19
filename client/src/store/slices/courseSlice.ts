import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Video {
  url: string;
  title: string;
  transcript: string;
  order: number;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  tutor: string;
  videos: Video[];
  enrollments: Array<{
    student: string;
    enrolledAt: string;
  }>;
  chatRoom: Array<{
    user: string;
    text: string;
    replies: Array<{
      user: string;
      text: string;
      createdAt: string;
    }>;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData: { title: string; description: string; thumbnail: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/course/create', courseData);
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const addVideoToCourse = createAsyncThunk(
  'course/addVideo',
  async ({ courseId, videoData }: { courseId: string; videoData: { url: string; title: string } }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/course/add-video/${courseId}`, videoData);
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add video');
    }
  }
);

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/course');
      return response.data.courses;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'course/fetchCourseById',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/course/${courseId}`);
      return response.data.course;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
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
        state.error = action.payload as string;
      })
      // Add Video
      .addCase(addVideoToCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVideoToCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(course => course._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      .addCase(addVideoToCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer; 