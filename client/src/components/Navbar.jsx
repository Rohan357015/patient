import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FaUserCircle, FaSignOutAlt, FaPlusSquare } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuthStore();
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <Box
      bg={bg}
      px={6}
      py={4}
      borderBottom="1px"
      borderColor={border}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        {/* Brand Logo */}
        <Flex
          align="center"
          cursor="pointer"
          onClick={() => onNavigate(user ? (user.role === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard') : 'login')}
        >
          <Heading size="md" color="teal.500" fontWeight="extrabold" letterSpacing="tight">
            🏥 CareSync
          </Heading>
        </Flex>

        {/* User Info & Actions */}
        {user ? (
          <Flex align="center" gap={4}>
            <Flex align="center" gap={2}>
              <Icon as={FaUserCircle} w={5} h={5} color="teal.500" />
              <Box display={{ base: 'none', md: 'block' }}>
                <Text fontWeight="semibold" fontSize="sm">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                  {user.role} Dashboard
                </Text>
              </Box>
            </Flex>
            <Button
              colorScheme="teal"
              variant="outline"
              size="sm"
              leftIcon={<FaSignOutAlt />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Flex>
        ) : (
          <Flex gap={3}>
            <Button size="sm" variant="ghost" colorScheme="teal" onClick={() => onNavigate('login')}>
              Sign In
            </Button>
            <Button size="sm" colorScheme="teal" onClick={() => onNavigate('register')}>
              Create Account
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
