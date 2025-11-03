import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Navbar */}
      <Header
        style={{
          padding: '0 20px',
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>
          Hotel Management System
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <LogoutOutlined /> Logout
        </button>
      </Header>

      {/* Sidebar + Content below Navbar */}
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              { key: '/dashboard', label: 'Dashboard', onClick: () => (window.location.href = '/dashboard') },
              { key: '/guests', label: 'Guests', onClick: () => (window.location.href = '/guests') },
              { key: '/rooms', label: 'Rooms', onClick: () => (window.location.href = '/rooms') },
              { key: '/bookings', label: 'Bookings', onClick: () => (window.location.href = '/bookings') },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
