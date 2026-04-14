import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const userStr = localStorage.getItem('currentUser');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || user.role !== 'admin') {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;