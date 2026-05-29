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
  RadioGroup,
  Radio,
  HStack
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';

export default function Register({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const { register, loading } = useAuthStore();
  const toast = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const result = await register(name, email, password, role);
    if (result.success) {
      toast({
        title: 'Account Created',
        description: `Welcome, ${name}! Your account has been set up successfully.`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      // Redirect based on role
      if (role === 'doctor') {
        onNavigate('doctor-dashboard');
      } else {
        onNavigate('patient-dashboard');
      }
    } else {
      toast({
        title: 'Registration Failed',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} px={4}>
      <Card variant="outline" boxShadow="lg" borderRadius="xl">
        <CardBody p={8}>
          <Stack spacing={4} align="center" mb={6}>
            <Heading size="lg" color="teal.500">Create Account</Heading>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Register now to find expert doctors or manage patient bookings.
            </Text>
          </Stack>

          <form onSubmit={handleRegister}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  placeholder="John Doe"
                  focusBorderColor="teal.500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

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
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  focusBorderColor="teal.500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Register As</FormLabel>
                <RadioGroup onChange={setRole} value={role} colorScheme="teal">
                  <HStack spacing={6}>
                    <Radio value="patient">Patient (Booking)</Radio>
                    <Radio value="doctor">Doctor (Consultant)</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                fontSize="md"
                isLoading={loading}
                mt={4}
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text mt={6} align="center" fontSize="sm" color="gray.500">
            Already have an account?{' '}
            <Link color="teal.500" fontWeight="semibold" onClick={() => onNavigate('login')}>
              Sign In
            </Link>
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
