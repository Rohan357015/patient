import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Link,
  Card,
  CardBody,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      // Redirect based on role
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.role === 'doctor') {
        onNavigate('doctor-dashboard');
      } else {
        onNavigate('patient-dashboard');
      }
    } else {
      toast({
        title: 'Login Failed',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={12} px={4}>
      <Card variant="outline" boxShadow="lg" borderRadius="xl">
        <CardBody p={8}>
          <Stack spacing={6} align="center" mb={6}>
            <Heading size="lg" color="teal.500">Welcome Back</Heading>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Access your personalized portal and manage bookings instantly.
            </Text>
          </Stack>

          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  focusBorderColor="teal.500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    focusBorderColor="teal.500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                isLoading={loading}
                mt={2}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Text mt={6} align="center" fontSize="sm" color="gray.500">
            Don't have an account?{' '}
            <Link color="teal.500" fontWeight="semibold" onClick={() => onNavigate('register')}>
              Create one
            </Link>
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
