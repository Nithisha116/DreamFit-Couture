// // src/App.jsx or src/main.jsx
// import ToastContainer from './components/common/ToastContainer';

// function App() {
//   return (
//     <>
//       <ToastContainer /> {/* Add this once */}
//       {/* Your other components */}
//     </>
//   );
// }

// App.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadCount } from './features/notification/notificationSlice';
import ToastContainer from './components/common/ToastContainer';
import GlobalSocketListener from './components/common/GlobalSocketListener';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ Page Load ஆனதும் உடனே Unread Count வாங்கணும்
  useEffect(() => {
    if (user) {
      console.log("🔍 App.js - Fetching unread count on load");
      dispatch(fetchUnreadCount());
    }
  }, [user, dispatch]);

  return (
    <>
      <GlobalSocketListener />
      <ToastContainer />
      {/* Your routes */}
    </>
  );
}

export default App;