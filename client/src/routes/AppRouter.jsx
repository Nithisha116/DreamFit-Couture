// // AppRouter.jsx - Complete with all routes and product details
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { Toaster } from "react-hot-toast";

// // Layout & Protected Route
// import MainLayout from "../components/layout/MainLayout";
// import ProtectedRoute from "./ProtectedRoute";

// // Auth Pages
// import Login from "../Pages/auth/Login";

// // Page Components
// import AdminDashboard from "../Pages/admin/AdminDashboard";
// import Orders from "../Pages/admin/order/Orders";
// import Customer from "../Pages/admin/Customers/Customers";
// import AddCustomer from "../Pages/admin/Customers/AddCustomer";
// import CustomerDetails from "./Pages/admin/customers/CustomerDetails";
// import CustomerSizePage from "./Pages/admin/customer-size/CustomerSizePage";
// import Staff from "../Pages/admin/staff/Staff";
// import StaffDetails from "../Pages/admin/staff/StaffDetails";
// import AddStaff from "../Pages/admin/staff/AddStaff";

// // Product Management Components
// import Products from "../Pages/admin/Products/Products";
// import FabricDetail from "../Pages/admin/Products/FabricDetail";
// import CategoryDetail from "../Pages/admin/Products/CategoryDetail";
// import ItemDetail from "../Pages/admin/Products/ItemDetail";
// import EditFabric from "../Pages/admin/Products/EditFabric";

// // Measurement Components
// import Measurements from "../Pages/admin/Measurements/Measurements";
// import NewTemplate from "../Pages/admin/Measurements/NewTemplate";
// import TemplateDetails from "../Pages/admin/Measurements/TemplateDetails";
// import EditTemplate from "../Pages/admin/Measurements/EditTemplate";

// // ✅ ORDER MANAGEMENT COMPONENTS
// import NewOrder from "../Pages/admin/order/NewOrder";
// import OrderDetails from "../Pages/admin/order/OrderDetails";
// import GarmentDetails from "../Pages/admin/garment/GarmentDetails";
// import EditOrder from "../Pages/admin/order/EditOrder";
// import EditGarment from "../Pages/admin/garment/EditGarment"; 

// // ✅ WORK MANAGEMENT COMPONENTS
// import WorksPage from "../Pages/works/WorksPage";
// import WorkDetailsPage from "../Pages/works/WorkDetailsPage";
// import CuttingMasterWorks from "../Pages/works/CuttingMasterWorks";

// // ✅ TAILOR MANAGEMENT COMPONENTS
// import Tailors from "../Pages/admin/tailor/Tailors";
// import AddTailor from "../Pages/admin/tailor/AddTailor";
// import TailorDetails from "../Pages/admin/tailor/TailorDetails";
// import EditTailor from "../Pages/admin/tailor/EditTailor";

// // ✅ CUTTING MASTER COMPONENTS
// import CuttingMasterDashboard from "../Pages/CuttingMasterDashboard";
// import CuttingMasters from "../Pages/admin/cuttingMaster/CuttingMasters";
// import AddCuttingMaster from "../Pages/admin/cuttingMaster/AddCuttingMaster";
// import CuttingMasterDetails from "../Pages/admin/cuttingMaster/CuttingMasterDetails";
// import EditCuttingMaster from "../Pages/admin/cuttingMaster/EditCuttingMaster";

// // ✅ STORE KEEPER COMPONENTS
// import StoreKeepers from "../Pages/admin/storeKeeper/StoreKeepers";
// import AddStoreKeeper from "../Pages/admin/storeKeeper/AddStoreKeeper";
// import StoreKeeperDetails from "../Pages/admin/storeKeeper/StoreKeeperDetails";
// import EditStoreKeeper from "../Pages/admin/storeKeeper/EditStoreKeeper";

// // ✅ BANKING MODULE COMPONENTS
// import BankingOverview from "../Pages/Banking/BankingOverview";
// import IncomePage from "../Pages/Banking/IncomePage";
// import ExpensePage from "../Pages/Banking/ExpensePage";
// import PaymentDetails from "../Pages/admin/payment/PaymentDetails";

// // ✅ NOTIFICATION COMPONENTS
// import NotificationsPage from "../Pages/notifications/NotificationsPage";

// // ✅ ATTENDANCE COMPONENTS
// import AttendancePage from "../Pages/admin/attendance/AttendancePage";

// // Placeholders
// const ManagerDashboard = () => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     Manager Panel Ready
//   </div>
// );

// const StoreKeeperDashboard = () => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     Store Keeper Panel Ready
//   </div>
// );



// const Work = () => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     Work Section
//   </div>
// );

// const ShopKeeper = () => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     Shop Keeper Section
//   </div>
// );

// const ReportsPlaceholder = ({ title }) => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     {title} - Coming Soon
//   </div>
// );

// const Settings = () => (
//   <div className="p-8 font-black text-slate-800 uppercase italic">
//     Settings - Coming Soon
//   </div>
// );

// export default function AppRouter() {
//   const { user, token } = useSelector((state) => state.auth);
//   const isAuthenticated = !!token;

//   return (
//     <BrowserRouter>
//       {/* Toaster with fast durations */}
//       <Toaster
//         position="top-right"
//         reverseOrder={false}
//         gutter={8}
//         containerStyle={{
//           top: 20,
//           right: 20,
//           zIndex: 99999,
//         }}
//         toastOptions={{
//           duration: 2000,
//           style: {
//             background: "#fff",
//             color: "#334155",
//             padding: "12px 16px",
//             borderRadius: "10px",
//             fontSize: "14px",
//             fontWeight: "500",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//             border: "1px solid #e2e8f0",
//             maxWidth: "350px",
//           },
//           success: {
//             icon: "✅",
//             duration: 1500,
//             style: {
//               borderLeft: "4px solid #10b981",
//             },
//           },
//           error: {
//             icon: "❌",
//             duration: 2000,
//             style: {
//               borderLeft: "4px solid #ef4444",
//             },
//           },
//           loading: {
//             icon: "⏳",
//             duration: 2000,
//           },
//         }}
//       />

//       <Routes>
//         {/* 🔓 PUBLIC ROUTES */}
//         <Route path="/" element={<Login />} />

//         {/* 🛡️ ADMIN ROUTES (Full Access) */}
//         <Route
//           path="/admin/*"
//           element={
//             <ProtectedRoute allowedRoles={["ADMIN"]}>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         >
//           {/* Dashboard */}
//           <Route path="dashboard" element={<AdminDashboard />} />
          
//           {/* Orders Management */}
//           <Route path="orders" element={<Orders />} />
//           <Route path="orders/new" element={<NewOrder />} />
//           <Route path="orders/:id" element={<OrderDetails />} />
//           <Route path="orders/edit/:id" element={<EditOrder />} />
          
//           {/* Garment Management */}
//           <Route path="garments/:id" element={<GarmentDetails />} />
//           <Route path="garments/edit/:id" element={<EditGarment />} />
          
//           {/* ✅ WORK MANAGEMENT - FULL ACCESS */}
//           <Route path="works" element={<WorksPage />} />
//           <Route path="works/:id" element={<WorkDetailsPage />} />
          
//           {/* Tailors Management */}
//           <Route path="tailors" element={<Tailors />} />
//           <Route path="tailors/add" element={<AddTailor />} />
//           <Route path="tailors/:id" element={<TailorDetails />} />
//           <Route path="tailors/edit/:id" element={<EditTailor />} />
          
//           {/* Cutting Masters Management */}
//           <Route path="cutting-masters" element={<CuttingMasters />} />
//           <Route path="cutting-masters/add" element={<AddCuttingMaster />} />
//           <Route path="cutting-masters/:id" element={<CuttingMasterDetails />} />
//           <Route path="cutting-masters/edit/:id" element={<EditCuttingMaster />} />
          
//           {/* Store Keepers Management */}
//           <Route path="store-keepers" element={<StoreKeepers />} />
//           <Route path="store-keepers/add" element={<AddStoreKeeper />} />
//           <Route path="store-keepers/:id" element={<StoreKeeperDetails />} />
//           <Route path="store-keepers/edit/:id" element={<EditStoreKeeper />} />
          
//           {/* Work Section (Legacy) */}
//           <Route path="work" element={<Work />} />
          
//           {/* Measurement - Admin gets full access */}
//           <Route path="measurements" element={<Measurements />} />
//           <Route path="measurements/new" element={<NewTemplate />} />
//           <Route path="measurements/:id" element={<TemplateDetails />} />
//           <Route path="measurements/edit/:id" element={<EditTemplate />} />
          
//           {/* Products Management */}
//           <Route path="products" element={<Products />} />
          
//           {/* Product Detail Pages */}
//           <Route path="fabrics/:id" element={<FabricDetail />} />
//           <Route path="categories/:id" element={<CategoryDetail />} />
//           <Route path="items/:id" element={<ItemDetail />} />
//           <Route path="fabrics/edit/:id" element={<EditFabric />} />
          
//           {/* Customers */}
//           <Route path="customers" element={<Customer />} />
//           <Route path="customers/:id" element={<CustomerDetails />} />
//           <Route path="add-customer" element={<AddCustomer />} />
          
//           {/* Staff Management */}
//           <Route path="staff" element={<Staff />} />
//           <Route path="staff/:id" element={<StaffDetails />} />
//           <Route path="add-staff" element={<AddStaff />} />
          
//           {/* Shop Keeper */}
//           <Route path="shopkeeper" element={<ShopKeeper />} />
          
//           {/* ✅ BANKING MODULE */}
//           <Route path="banking/overview" element={<BankingOverview />} />
//           <Route path="banking/income" element={<IncomePage />} />
//           <Route path="banking/expense" element={<ExpensePage />} />
          
//           {/* Reports */}
//           <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
//           <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
//           <Route path="reports/staff-performance" element={<ReportsPlaceholder title="Staff Performance" />} />
//           <Route path="reports/financial" element={<ReportsPlaceholder title="Financial Report" />} />
//           <Route path="reports/customer-analytics" element={<ReportsPlaceholder title="Customer Analytics" />} />

//             {/*  PAYMENT ROUTE */}
//          <Route path="payments/:id" element={<PaymentDetails />} />  
          
//           {/* Settings */}
//           <Route path="settings" element={<Settings />} />
          
//           {/* Notifications */}
//           <Route path="notifications" element={<NotificationsPage />} />
//         </Route>

//         {/* 🛡️ STORE KEEPER ROUTES */}
//         <Route
//           path="/storekeeper/*"
//           element={
//             <ProtectedRoute allowedRoles={["STORE_KEEPER"]}>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route path="dashboard" element={<AdminDashboard />} />
          
//           {/* Orders Management */}
//           <Route path="orders" element={<Orders />} />
//           <Route path="orders/new" element={<NewOrder />} />
//           <Route path="orders/:id" element={<OrderDetails />} />
//           <Route path="orders/edit/:id" element={<EditOrder />} />
          
//           {/* Garment Management */}
//           <Route path="garments/:id" element={<GarmentDetails />} />
//           <Route path="garments/edit/:id" element={<EditGarment />} />
          
//           {/* ✅ WORK MANAGEMENT - FULL ACCESS (VIEW ONLY) */}
//           <Route path="works" element={<WorksPage />} />
//           <Route path="works/:id" element={<WorkDetailsPage />} />
          
//           {/* Tailors Management */}
//           <Route path="tailors" element={<Tailors />} />
//           <Route path="tailors/add" element={<AddTailor />} />
//           <Route path="tailors/:id" element={<TailorDetails />} />
//           <Route path="tailors/edit/:id" element={<EditTailor />} />
          
//           {/* Work Section (Legacy) */}
//           <Route path="work" element={<Work />} />
          
//           {/* Measurement - Store Keeper access */}
//           <Route path="measurements" element={<Measurements />} />
//           <Route path="measurements/new" element={<NewTemplate />} />
//           <Route path="measurements/:id" element={<TemplateDetails />} />
//           <Route path="measurements/edit/:id" element={<EditTemplate />} />
          
//           <Route path="products" element={<Products />} />
//           <Route path="fabrics/:id" element={<FabricDetail />} />
//           <Route path="categories/:id" element={<CategoryDetail />} />
//           <Route path="items/:id" element={<ItemDetail />} />
//           <Route path="customers" element={<Customer />} />
//           <Route path="customers/:id" element={<CustomerDetails />} />
//           <Route path="add-customer" element={<AddCustomer />} />
//           <Route path="shopkeeper" element={<ShopKeeper />} />
          
//           {/* ✅ BANKING MODULE */}
//           <Route path="banking/overview" element={<BankingOverview />} />
//           <Route path="banking/income" element={<IncomePage />} />
//           <Route path="banking/expense" element={<ExpensePage />} />
          
//           {/* Reports - Limited access */}
//           <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
//           <Route path="reports/inventory" element={<ReportsPlaceholder title="Inventory Report" />} />
//           <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
          
//             {/*  PAYMENT ROUTE */}
//          <Route path="payments/:id" element={<PaymentDetails />} />  
          
//           {/* Notifications */}
//           <Route path="notifications" element={<NotificationsPage />} />
//         </Route>

//         {/* 🛡️ CUTTING MASTER ROUTES (Restricted) */}
//         <Route
//           path="/cuttingmaster/*"
//           element={
//             <ProtectedRoute allowedRoles={["CUTTING_MASTER"]}>
//               <MainLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route path="dashboard" element={<CuttingMasterDashboard />} />
          
//           {/* Orders - View only */}
//           <Route path="orders" element={<Orders />} />
//           <Route path="orders/:id" element={<OrderDetails />} />
          
//           {/* Garment Details - View only */}
//           <Route path="garments/:id" element={<GarmentDetails />} />
          
//           {/* ✅ WORK MANAGEMENT - CUTTING MASTER SPECIFIC */}
//           <Route path="works" element={<CuttingMasterWorks />} />
//           <Route path="works/:id" element={<WorkDetailsPage />} />
          
//           {/* Tailors - View only */}
//           <Route path="tailors" element={<Tailors />} />
//           <Route path="tailors/:id" element={<TailorDetails />} />
          
//           {/* Work Section (Legacy) */}
//           <Route path="work" element={<Work />} />
          
//           {/* Measurement - View only */}
//           <Route path="measurements" element={<Measurements />} />
//           <Route path="measurements/:id" element={<TemplateDetails />} />
          
//           <Route path="products" element={<Products />} />
          
//           {/* ❌ NO BANKING ACCESS FOR CUTTING MASTER */}
          
//           {/* Notifications */}
//           <Route path="notifications" element={<NotificationsPage />} />
//         </Route>

//         {/* 🚨 404 REDIRECT */}
//         <Route
//           path="*"
//           element={
//             !isAuthenticated ? (
//               <Navigate to="/" replace />
//             ) : (
//               <Navigate
//                 to={
//                   user?.role === "ADMIN"
//                     ? "/admin/dashboard"
//                     : user?.role === "STORE_KEEPER"
//                       ? "/storekeeper/dashboard"
//                       : "/cuttingmaster/dashboard"
//                 }
//                 replace
//               />
//             )
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }







// AppRouter.jsx - Complete with all routes and product details
import { Suspense, lazy } from "react"; // ✅ ADDED: Suspense & lazy imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import GlobalSocketListener from "../components/common/GlobalSocketListener";

// 🚀 LAZY LOADING - Auth Pages
const Login = lazy(() => import("../Pages/auth/Login"));

// 🚀 LAZY LOADING - Page Components
const AdminDashboard = lazy(() => import("../Pages/admin/AdminDashboard"));
const Orders = lazy(() => import("../Pages/admin/order/Orders"));
const Customer = lazy(() => import("../Pages/admin/Customers/Customers"));
const AddCustomer = lazy(() => import("../Pages/admin/Customers/AddCustomer"));
const CustomerDetails = lazy(() => import("../Pages/admin/Customers/CustomerDetails"));
const Staff = lazy(() => import("../Pages/admin/staff/Staff"));
const StaffDetails = lazy(() => import("../Pages/admin/staff/StaffDetails"));
const AddStaff = lazy(() => import("../Pages/admin/staff/AddStaff"));
const ActivityLogPage = lazy(() => import("../Pages/admin/ActivityLogPage"));

// 🚀 LAZY LOADING - Product Management Components
const Products = lazy(() => import("../Pages/admin/Products/Products"));
const FabricDetail = lazy(() => import("../Pages/admin/Products/FabricDetail"));
const CategoryDetail = lazy(() => import("../Pages/admin/Products/CategoryDetail"));
const ItemDetail = lazy(() => import("../Pages/admin/Products/ItemDetail"));
const EditFabric = lazy(() => import("../Pages/admin/Products/EditFabric"));

// 🚀 LAZY LOADING - Measurement Components
const Measurements = lazy(() => import("../Pages/admin/Measurements/Measurements"));
const NewTemplate = lazy(() => import("../Pages/admin/Measurements/NewTemplate"));
const TemplateDetails = lazy(() => import("../Pages/admin/Measurements/TemplateDetails"));
const EditTemplate = lazy(() => import("../Pages/admin/Measurements/EditTemplate"));

// 🚀 LAZY LOADING - ORDER MANAGEMENT COMPONENTS
const NewOrder = lazy(() => import("../Pages/admin/order/NewOrder"));
const OrderDetails = lazy(() => import("../Pages/admin/order/OrderDetails"));
const GarmentDetails = lazy(() => import("../Pages/admin/garment/GarmentDetails"));
const EditOrder = lazy(() => import("../Pages/admin/order/EditOrder"));
const EditGarment = lazy(() => import("../Pages/admin/garment/EditGarment")); 

// 🚀 LAZY LOADING - TASKS & WORK DETAILS
const TasksPage = lazy(() => import("../Pages/tasks/TasksPage"));
const TaskJobDetailPage = lazy(() => import("../Pages/tasks/TaskJobDetailPage"));
const WorkflowScanPage = lazy(() => import("../Pages/tasks/WorkflowScanPage"));
const QrWorkflowPage = lazy(() => import("../Pages/qr/QrWorkflowPage"));
const WorkDetailsPage = lazy(() => import("../Pages/works/WorkDetailsPage"));
const CuttingMasterWorks = lazy(() => import("../Pages/works/CuttingMasterWorks"));
const CheckAvailabilityPage = lazy(() =>
  import("../Pages/admin/availability/CheckAvailabilityPage"),
);
const AppointmentsPage = lazy(() =>
  import("../Pages/admin/appointments/AppointmentsPage")
);
const CrmPage = lazy(() => import("../Pages/admin/crm/CrmPage"));
const SourcingPage = lazy(() => import("../Pages/admin/sourcing/SourcingPage"));

// 🚀 LAZY LOADING - TAILOR MANAGEMENT COMPONENTS
const Tailors = lazy(() => import("../Pages/admin/tailor/Tailors"));
const AddTailor = lazy(() => import("../Pages/admin/tailor/AddTailor"));
const TailorDetails = lazy(() => import("../Pages/admin/tailor/TailorDetails"));
const EditTailor = lazy(() => import("../Pages/admin/tailor/EditTailor"));

// 🚀 LAZY LOADING - AARI WORKER COMPONENTS
const AariWorkers = lazy(() => import("../Pages/admin/aariWorker/AariWorkers"));
const AddAariWorker = lazy(() => import("../Pages/admin/aariWorker/AddAariWorker"));
const AariWorkerDetails = lazy(() => import("../Pages/admin/aariWorker/AariWorkerDetails"));
const EditAariWorker = lazy(() => import("../Pages/admin/aariWorker/EditAariWorker"));

const EmbroideryWorkers = lazy(() => import("../Pages/admin/embroideryWorker/EmbroideryWorkers"));
const AddEmbroideryWorker = lazy(() => import("../Pages/admin/embroideryWorker/AddEmbroideryWorker"));
const EmbroideryWorkerDetails = lazy(() => import("../Pages/admin/embroideryWorker/EmbroideryWorkerDetails"));
const EditEmbroideryWorker = lazy(() => import("../Pages/admin/embroideryWorker/EditEmbroideryWorker"));

const Helpers = lazy(() => import("../Pages/admin/helper/Helpers"));
const AddHelper = lazy(() => import("../Pages/admin/helper/AddHelper"));
const HelperDetails = lazy(() => import("../Pages/admin/helper/HelperDetails"));
const EditHelper = lazy(() => import("../Pages/admin/helper/EditHelper"));

// 🚀 LAZY LOADING - CUTTING MASTER COMPONENTS
const CuttingMasters = lazy(() => import("../Pages/admin/cuttingMaster/CuttingMasters"));
const AddCuttingMaster = lazy(() => import("../Pages/admin/cuttingMaster/AddCuttingMaster"));
const CuttingMasterDetails = lazy(() => import("../Pages/admin/cuttingMaster/CuttingMasterDetails"));
const EditCuttingMaster = lazy(() => import("../Pages/admin/cuttingMaster/EditCuttingMaster"));

// 🚀 LAZY LOADING - STORE KEEPER COMPONENTS
const StoreKeepers = lazy(() => import("../Pages/admin/storeKeeper/StoreKeepers"));
const AddStoreKeeper = lazy(() => import("../Pages/admin/storeKeeper/AddStoreKeeper"));
const StoreKeeperDetails = lazy(() => import("../Pages/admin/storeKeeper/StoreKeeperDetails"));
const EditStoreKeeper = lazy(() => import("../Pages/admin/storeKeeper/EditStoreKeeper"));

// 🚀 LAZY LOADING - BANKING MODULE COMPONENTS
const BankingOverview = lazy(() => import("../Pages/Banking/BankingOverview"));
const IncomePage = lazy(() => import("../Pages/Banking/IncomePage"));
const ExpensePage = lazy(() => import("../Pages/Banking/ExpensePage"));
const PaymentDetails = lazy(() => import("../Pages/admin/payment/PaymentDetails"));

// 🚀 LAZY LOADING - NOTIFICATION COMPONENTS
const NotificationsPage = lazy(() => import("../Pages/notifications/NotificationsPage"));

// 🚀 LAZY LOADING - OUTSOURCING
const OutsourcingPage = lazy(() =>
  import("../Pages/admin/outsourcing/OutsourcingPage")
);
const OutsourcingVendorsPage = lazy(() =>
  import("../Pages/admin/outsourcingVendors/OutsourcingVendorsPage")
);

// 🚀 LAZY LOADING - BILLING COMPONENTS
const BillingDashboard = lazy(() => import("../Pages/admin/billing/BillingDashboard"));
const InvoiceList = lazy(() => import("../Pages/admin/billing/InvoiceList"));
const CreateInvoice = lazy(() => import("../Pages/admin/billing/CreateInvoice"));
const InvoiceDetails = lazy(() => import("../Pages/admin/billing/InvoiceDetails"));
const PublicInvoiceView = lazy(() => import("../Pages/public/PublicInvoiceView"));
const PublicOrderCardView = lazy(() => import("../Pages/public/PublicOrderCardView"));

// 🚀 LAZY LOADING - CUSTOMER SIZE PROFILES
const CustomerSizePage = lazy(() => import("../Pages/admin/customer-size/CustomerSizePage"));

// 🚀 LAZY LOADING - ATTENDANCE
const AttendancePage = lazy(() =>
  import("../Pages/admin/attendance/AttendancePage")
);

// 🚀 LAZY LOADING - LEAVE MANAGEMENT
const LeavePage = lazy(() =>
  import("../Pages/admin/leave/LeavePage")
);

const SalaryManagement = lazy(() =>
  import("../Pages/admin/salary/SalaryManagement")
);

const EmployeeAnalytics = lazy(() =>
  import("../Pages/admin/salary/EmployeeAnalytics")
);

const SalaryHistoryPage = lazy(() =>
  import("../Pages/admin/salary/SalaryHistoryPage")
);
// Placeholders (keep as is - they're simple components)
const ManagerDashboard = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Manager Panel Ready
  </div>
);

const StoreKeeperDashboard = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Store Keeper Panel Ready
  </div>
);

const Work = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Work Section
  </div>
);

const ShopKeeper = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Shop Keeper Section
  </div>
);

const ReportsPlaceholder = ({ title }) => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    {title} - Coming Soon
  </div>
);

const Settings = () => (
  <div className="p-8 font-black text-slate-800 uppercase italic">
    Settings - Coming Soon
  </div>
);

function RedirectWorksListToTasks() {
  const { user } = useSelector((state) => state.auth);
  const target =
    user?.role === "STORE_KEEPER" ? "/storekeeper/tasks" : "/admin/tasks";
  return <Navigate to={target} replace />;
}

// ✅ ADDED: Loading component for Suspense fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Dreamfit Loading...</p>
    </div>
  </div>
);

export default function AppRouter() {
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      {/* Toaster with fast durations */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: "#fff",
            color: "#334155",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #e2e8f0",
            maxWidth: "350px",
          },
          success: {
            icon: "✅",
            duration: 1500,
            style: {
              borderLeft: "4px solid #10b981",
            },
          },
          error: {
            icon: "❌",
            duration: 2000,
            style: {
              borderLeft: "4px solid #ef4444",
            },
          },
          loading: {
            icon: "⏳",
            duration: 2000,
          },
        }}
      />

      <GlobalSocketListener />

      {/* ✅ ADDED: Suspense wrapper with PageLoader fallback */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          
          {/* 📱 QR WORKFLOW ROUTE (Isolated) */}
          <Route path="/qr-workflow/:qrCode" element={<QrWorkflowPage />} />

          {/* 📄 Public customer invoice (read-only, no auth) */}
          <Route path="/invoice/view/:orderId" element={<PublicInvoiceView />} />

          {/* 📋 Public customer order card (read-only, no auth) */}
          <Route path="/order-card/view/:orderId" element={<PublicOrderCardView />} />


          {/* 🛡️ ADMIN ROUTES (Full Access) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />

            {/* Internal-only Activity Log — page itself checks isInternalAdmin */}
            <Route path="activity-log" element={<ActivityLogPage />} />

            {/* Orders Management */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<NewOrder />} />
            <Route path="orders/new/:draftId" element={<NewOrder />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders/edit/:id" element={<EditOrder />} />
            
            {/* Appointments Management */}
            <Route path="appointments" element={<AppointmentsPage />} />
            
            {/* Outsourcing Management */}
            <Route path="outsourcing" element={<OutsourcingPage />} />
            <Route path="outsourcing-vendors" element={<OutsourcingVendorsPage />} />
            
            {/* Garment Management */}
            <Route path="garments/:id" element={<GarmentDetails />} />
            <Route path="garments/edit/:id" element={<EditGarment />} />
            
            {/* ✅ TASKS (boutique floor) + legacy /works list redirect */}
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/job/:trackingId" element={<TaskJobDetailPage />} />
            <Route path="tasks/scan" element={<WorkflowScanPage />} />
            <Route path="works" element={<RedirectWorksListToTasks />} />
            <Route path="works/:id" element={<WorkDetailsPage />} />
            <Route path="check-availability" element={<CheckAvailabilityPage />} />
            <Route path="crm" element={<CrmPage />} />
            <Route path="sourcing" element={<SourcingPage />} />
            
            {/* Tailors Management */}
            <Route path="tailors" element={<Tailors />} />
            <Route path="tailors/add" element={<AddTailor />} />
            <Route path="tailors/:id" element={<TailorDetails />} />
            <Route path="tailors/edit/:id" element={<EditTailor />} />
            
            {/* Aari Workers Management */}
            <Route path="aari-workers" element={<AariWorkers />} />
            <Route path="aari-workers/add" element={<AddAariWorker />} />
            <Route path="aari-workers/:id" element={<AariWorkerDetails />} />
            <Route path="aari-workers/edit/:id" element={<EditAariWorker />} />

            {/* Embroidery Workers Routes */}
            <Route path="embroidery-workers" element={<EmbroideryWorkers />} />
            <Route path="embroidery-workers/add" element={<AddEmbroideryWorker />} />
            <Route path="embroidery-workers/:id" element={<EmbroideryWorkerDetails />} />
            <Route path="embroidery-workers/edit/:id" element={<EditEmbroideryWorker />} />
            
            {/* Helpers Routes */}
            <Route path="helpers" element={<Helpers />} />
            <Route path="helpers/add" element={<AddHelper />} />
            <Route path="helpers/:id" element={<HelperDetails />} />
            <Route path="helpers/edit/:id" element={<EditHelper />} />
            
            {/* Cutting Masters Management */}
            <Route path="cutting-masters" element={<CuttingMasters />} />
            <Route path="cutting-masters/add" element={<AddCuttingMaster />} />
            <Route path="cutting-masters/:id" element={<CuttingMasterDetails />} />
            <Route path="cutting-masters/edit/:id" element={<EditCuttingMaster />} />
            
            {/* Store Keepers Management */}
            <Route path="store-keepers" element={<StoreKeepers />} />
            <Route path="store-keepers/add" element={<AddStoreKeeper />} />
            <Route path="store-keepers/:id" element={<StoreKeeperDetails />} />
            <Route path="store-keepers/edit/:id" element={<EditStoreKeeper />} />
            
            {/* Work Section (Legacy) */}
            <Route path="work" element={<Work />} />
            
            {/* Measurement - Admin gets full access */}
            <Route path="measurements" element={<Measurements />} />
            <Route path="measurements/new" element={<NewTemplate />} />
            <Route path="measurements/:id" element={<TemplateDetails />} />
            <Route path="measurements/edit/:id" element={<EditTemplate />} />
            
            {/* Products Management */}
            <Route path="products" element={<Products />} />
            
            {/* Product Detail Pages */}
            <Route path="fabrics/:id" element={<FabricDetail />} />
            <Route path="categories/:id" element={<CategoryDetail />} />
            <Route path="items/:id" element={<ItemDetail />} />
            <Route path="fabrics/edit/:id" element={<EditFabric />} />
            
            {/* Customers */}
            <Route path="customers" element={<Customer />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customer-size/:customerId" element={<CustomerSizePage />} />
            <Route path="add-customer" element={<AddCustomer />} />
            
            {/* Staff Management */}
            <Route path="staff" element={<Staff />} />
            <Route path="staff/:id" element={<StaffDetails />} />
            <Route path="add-staff" element={<AddStaff />} />

            {/* Attendance Management */}
            <Route path="attendance" element={<AttendancePage />} />
            
            {/* Leave Management */}
            <Route path="leave" element={<LeavePage />} />
            
            {/* Salary & Payroll Management */}
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="salary/analytics/:id" element={<EmployeeAnalytics />} />
            <Route path="salary/:employeeId" element={<SalaryHistoryPage />} />
            <Route path="salary-slip/:employeeId/:month/:year" element={<div className="p-8 text-slate-400 text-center font-medium">Salary Slip — Coming Soon</div>} />
            
            {/* Shop Keeper */}
            <Route path="shopkeeper" element={<ShopKeeper />} />
            
            {/* ✅ BANKING MODULE */}
            <Route path="banking/overview" element={<BankingOverview />} />
            <Route path="banking/income" element={<IncomePage />} />
            <Route path="banking/expense" element={<ExpensePage />} />
            
            {/* Reports */}
            <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
            <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
            <Route path="reports/staff-performance" element={<ReportsPlaceholder title="Staff Performance" />} />
            <Route path="reports/financial" element={<ReportsPlaceholder title="Financial Report" />} />
            <Route path="reports/customer-analytics" element={<ReportsPlaceholder title="Customer Analytics" />} />

            {/*  PAYMENT ROUTE */}
            <Route path="payments/:id" element={<PaymentDetails />} />  
            
            {/* 💳 BILLING SYSTEM ROUTES */}
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="billing/invoices" element={<InvoiceList />} />
            <Route path="billing/create/:orderId" element={<CreateInvoice />} />
            <Route path="billing/invoices/:id" element={<InvoiceDetails />} />
            
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
            
            {/* Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* 🛡️ STORE KEEPER ROUTES */}
          <Route
            path="/storekeeper/*"
            element={
              <ProtectedRoute allowedRoles={["STORE_KEEPER"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
            
            {/* Orders Management */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<NewOrder />} />
            <Route path="orders/new/:draftId" element={<NewOrder />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders/edit/:id" element={<EditOrder />} />
            
            {/* Appointments Management */}
            <Route path="appointments" element={<AppointmentsPage />} />
            
            {/* Outsourcing Management */}
            <Route path="outsourcing" element={<OutsourcingPage />} />
            <Route path="outsourcing-vendors" element={<OutsourcingVendorsPage />} />
            
            {/* Garment Management */}
            <Route path="garments/:id" element={<GarmentDetails />} />
            <Route path="garments/edit/:id" element={<EditGarment />} />
            
            {/* ✅ TASKS + legacy /works list redirect */}
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/job/:trackingId" element={<TaskJobDetailPage />} />
            <Route path="tasks/scan" element={<WorkflowScanPage />} />
            <Route path="works" element={<RedirectWorksListToTasks />} />
            <Route path="works/:id" element={<WorkDetailsPage />} />
            <Route path="check-availability" element={<CheckAvailabilityPage />} />
            <Route path="crm" element={<CrmPage />} />
            <Route path="sourcing" element={<SourcingPage />} />
            
            {/* Tailors Management */}
            <Route path="tailors" element={<Tailors />} />
            <Route path="tailors/add" element={<AddTailor />} />
            <Route path="tailors/:id" element={<TailorDetails />} />
            <Route path="tailors/edit/:id" element={<EditTailor />} />
            
            {/* Aari Workers Management */}
            <Route path="aari-workers" element={<AariWorkers />} />
            <Route path="aari-workers/add" element={<AddAariWorker />} />
            <Route path="aari-workers/:id" element={<AariWorkerDetails />} />
            <Route path="aari-workers/edit/:id" element={<EditAariWorker />} />

            <Route path="embroidery-workers" element={<EmbroideryWorkers />} />
            <Route path="embroidery-workers/add" element={<AddEmbroideryWorker />} />
            <Route path="embroidery-workers/:id" element={<EmbroideryWorkerDetails />} />
            <Route path="embroidery-workers/edit/:id" element={<EditEmbroideryWorker />} />
            
            <Route path="helpers" element={<Helpers />} />
            <Route path="helpers/add" element={<AddHelper />} />
            <Route path="helpers/:id" element={<HelperDetails />} />
            <Route path="helpers/edit/:id" element={<EditHelper />} />
            
            {/* Work Section (Legacy) */}
            <Route path="work" element={<Work />} />
            
            {/* Measurement - Store Keeper access */}
            <Route path="measurements" element={<Measurements />} />
            <Route path="measurements/new" element={<NewTemplate />} />
            <Route path="measurements/:id" element={<TemplateDetails />} />
            <Route path="measurements/edit/:id" element={<EditTemplate />} />
            
            <Route path="products" element={<Products />} />
            <Route path="fabrics/:id" element={<FabricDetail />} />
            <Route path="categories/:id" element={<CategoryDetail />} />
            <Route path="items/:id" element={<ItemDetail />} />
            <Route path="customers" element={<Customer />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="add-customer" element={<AddCustomer />} />
            <Route path="shopkeeper" element={<ShopKeeper />} />
            
            {/* ✅ BANKING MODULE */}
            <Route path="banking/overview" element={<BankingOverview />} />
            <Route path="banking/income" element={<IncomePage />} />
            <Route path="banking/expense" element={<ExpensePage />} />
            
            {/* Reports - Limited access */}
            <Route path="reports/sales" element={<ReportsPlaceholder title="Sales Report" />} />
            <Route path="reports/inventory" element={<ReportsPlaceholder title="Inventory Report" />} />
            <Route path="reports/production" element={<ReportsPlaceholder title="Production Report" />} />
            
            {/*  PAYMENT ROUTE */}
            <Route path="payments/:id" element={<PaymentDetails />} />  
            
            {/* Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* 🛡️ CUTTING MASTER ROUTES (Restricted) */}
          <Route
            path="/cuttingmaster/*"
            element={
              <ProtectedRoute allowedRoles={["CUTTING_MASTER"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Navigate to="works" replace />} />
            
            {/* Orders - View only */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            
            {/* Garment Details - View only */}
            <Route path="garments/:id" element={<GarmentDetails />} />
            
            {/* ✅ WORK MANAGEMENT - CUTTING MASTER SPECIFIC */}
            <Route path="works" element={<CuttingMasterWorks />} />
            <Route path="works/:id" element={<WorkDetailsPage />} />
            
            {/* Tailors - View only */}
            <Route path="tailors" element={<Tailors />} />
            <Route path="tailors/:id" element={<TailorDetails />} />
            
            {/* Aari Workers - View only */}
            <Route path="aari-workers" element={<AariWorkers />} />
            <Route path="aari-workers/:id" element={<AariWorkerDetails />} />

            <Route path="embroidery-workers" element={<EmbroideryWorkers />} />
            <Route path="embroidery-workers/:id" element={<EmbroideryWorkerDetails />} />
            
            <Route path="helpers" element={<Helpers />} />
            <Route path="helpers/:id" element={<HelperDetails />} />
            
            {/* Work Section (Legacy) */}
            <Route path="work" element={<Work />} />
            
            {/* Measurement - View only */}
            <Route path="measurements" element={<Measurements />} />
            <Route path="measurements/:id" element={<TemplateDetails />} />
            
            <Route path="products" element={<Products />} />
            
            {/* ❌ NO BANKING ACCESS FOR CUTTING MASTER */}
            
            {/* Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* 🚨 404 REDIRECT */}
          <Route
            path="*"
            element={
              !isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate
                  to={
                    user?.role === "ADMIN"
                      ? "/admin/dashboard"
                      : user?.role === "STORE_KEEPER"
                        ? "/storekeeper/dashboard"
                        : "/cuttingmaster/works"
                  }
                  replace
                />
              )
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}