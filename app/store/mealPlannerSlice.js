// src/redux/slices/mealPlannerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMealPlanFromFirestore,
  saveMealPlanToFirestore,
} from "../lib/firebaseUtils"; // Adjust path as needed

// Define the initial state for the meal planner
const mealTypes = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
];

const initialState = {
  meals: mealTypes.reduce((acc, meal) => {
    acc[meal] = [];
    return acc;
  }, {}),
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
};

// Async Thunk for fetching meal plan
export const fetchMealPlan = createAsyncThunk(
  "mealPlanner/fetchMealPlan",
  async ({ userId, date }, { rejectWithValue }) => {
    try {
      const data = await getMealPlanFromFirestore(userId, date);
      return data || initialState.meals; // Return fetched data or initial empty meals
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for saving meal plan
export const saveMealPlan = createAsyncThunk(
  "mealPlanner/saveMealPlan",
  async ({ userId, date, meals }, { rejectWithValue }) => {
    try {
      await saveMealPlanToFirestore(userId, date, meals);
      return meals;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const mealPlannerSlice = createSlice({
  name: "mealPlanner",
  initialState,
  reducers: {
    // Synchronous reducers for adding/removing food locally
    addFood: (state, action) => {
      const { mealType, food } = action.payload;
      if (state.meals[mealType]) {
        state.meals[mealType].push(food);
      }
    },
    removeFood: (state, action) => {
      const { mealType, index } = action.payload;
      if (state.meals[mealType]) {
        state.meals[mealType] = state.meals[mealType].filter(
          (_, i) => i !== index
        );
      }
    },
    setMealPlanDate: (state, action) => {
      state.currentDate = action.payload;
      state.status = "idle"; // Reset status when date changes
    },
    // Reset meals when switching users or on logout
    resetMealPlan: (state) => {
      state.meals = mealTypes.reduce((acc, meal) => {
        acc[meal] = [];
        return acc;
      }, {});
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlan.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMealPlan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.meals = action.payload;
      })
      .addCase(fetchMealPlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(saveMealPlan.pending, (state) => {
        state.status = "loading"; // Can show a saving indicator
      })
      .addCase(saveMealPlan.fulfilled, (state) => {
        state.status = "succeeded"; // Data is saved
      })
      .addCase(saveMealPlan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { addFood, removeFood, setMealPlanDate, resetMealPlan } =
  mealPlannerSlice.actions;

export default mealPlannerSlice.reducer;
