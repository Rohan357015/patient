import React, { useState, useEffect } from 'react';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { user } = useAuthStore();
  const [page, setPage] = useState('loading');

  // Authenticate user and direct to their dashboard on startup
  useEffect(() => {
    if (user) {
      if (user.role === 'doctor') {
        setPage('doctor-dashboard');
      } else {
        setPage('patient-dashboard');
      }
    } else {
      setPage('login');
    }
  }, [user]);

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <Login onNavigate={setPage} />;
      case 'register':
        return <Register onNavigate={setPage} />;
      case 'patient-dashboard':
        return user && user.role === 'patient' ? (
          <PatientDashboard />
        ) : (
          <Login onNavigate={setPage} />
        );
      case 'doctor-dashboard':
        return user && user.role === 'doctor' ? (
          <DoctorDashboard />
        ) : (
          <Login onNavigate={setPage} />
        );
      case 'loading':
      default:
        return (
          <Center h="70vh">
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </Center>
        );
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar onNavigate={setPage} />
      <Box as="main" py={4}>
        {renderPage()}
      </Box>
    </Box>
  );
}
