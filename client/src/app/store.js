import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

// SLICES
import authReducer from "../features/auth/authSlice";
import customerReducer from "../features/customer/customerSlice";
import userReducer from "../features/user/userSlice";
import fabricReducer from "../features/fabric/fabricSlice";
import categoryReducer from "../features/category/categorySlice";
import itemReducer from "../features/item/itemSlice";
import sizeTemplateReducer from "../features/sizeTemplate/sizeTemplateSlice";
import sizeFieldReducer from "../features/sizeField/sizeFieldSlice";
import orderReducer from "../features/order/orderSlice";
import garmentReducer from "../features/garment/garmentSlice";
import workReducer from "../features/work/workSlice";
import tailorReducer from "../features/tailor/tailorSlice";

// ✅ NEW: Add these missing reducers
import cuttingMasterReducer from "../features/cuttingMaster/cuttingMasterSlice";
import storeKeeperReducer from "../features/storeKeeper/storeKeeperSlice";
import notificationReducer from "../features/notification/notificationSlice";
import customerSizeReducer from "../features/customerSize/customerSizeSlice";
import transactionReducer from '../features/transaction/transactionSlice';
import paymentReducer from "../features/payment/paymentSlice";
import appointmentReducer from "../features/appointment/appointmentSlice";

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  user: userReducer,
  fabric: fabricReducer,
  category: categoryReducer,
  item: itemReducer,
  sizeTemplate: sizeTemplateReducer,
  sizeField: sizeFieldReducer,
  order: orderReducer,
  garment: garmentReducer,
  work: workReducer,
  tailor: tailorReducer,
  customerSize: customerSizeReducer,
  
  // ✅ NEW: Add these to the store
  cuttingMaster: cuttingMasterReducer,
  storeKeeper: storeKeeperReducer,
notification: notificationReducer,
   transaction: transactionReducer,
     payment: paymentReducer,
  appointment: appointmentReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only auth saved in localStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});