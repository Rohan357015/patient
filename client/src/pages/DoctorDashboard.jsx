import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Stack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Flex,
  Icon,
  useToast,
  Divider,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  Spacer,
  IconButton
} from '@chakra-ui/react';
import { FaUserMd, FaCalendarPlus, FaClock, FaCheck, FaTimes, FaUser, FaTrashAlt, FaCalendarDay } from 'react-icons/fa';
import { useDoctorStore } from '../store/doctorStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { indexAppointmentsByDate } from '../utils/algorithms';

export default function DoctorDashboard() {
  const { myProfile, fetchMyProfile, updateProfile, addSlot, removeSlot } = useDoctorStore();
  const { appointments, fetchDoctorSchedule, updateStatus } = useAppointmentStore();

  // Profile Form States
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState(0);
  const [bio, setBio] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // New Slot States
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');

  // Daily Schedule States (Date Selection)
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(
    new Date().toISOString().split('T')[0] // Defaults to today's date in YYYY-MM-DD
  );

  const toast = useToast();

  useEffect(() => {
    fetchMyProfile();
    fetchDoctorSchedule();
  }, []);

  // Pre-fill profile form fields when profile is loaded
  useEffect(() => {
    if (myProfile) {
      setSpecialty(myProfile.specialty || '');
      setExperience(myProfile.experience || 0);
      setBio(myProfile.bio || '');
    }
  }, [myProfile]);

  // 1. HASHMAP GROUPING OPTIMIZATION
  // Indexes appointments by their date so we can query any date's schedule in O(1) time complexity!
  const indexedSchedule = useMemo(() => {
    return indexAppointmentsByDate(appointments);
  }, [appointments]);

  // Lookup the schedule for the selected date instantly via our optimized HashMap
  const dailySchedule = useMemo(() => {
    return indexedSchedule[selectedScheduleDate] || [];
  }, [indexedSchedule, selectedScheduleDate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({ specialty, experience: Number(experience), bio });
    if (result.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your professional credentials have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setIsEditingProfile(false);
    } else {
      toast({
        title: 'Update Failed',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!slotDate || !slotTime) {
      toast({
        title: 'Error',
        description: 'Please select both date and time to add a slot',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }

    const result = await addSlot(slotDate, slotTime);
    if (result.success) {
      toast({
        title: 'Slot Added',
        description: `Successfully added slot on ${slotDate} at ${slotTime}.`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
      setSlotDate('');
      setSlotTime('');
    } else {
      toast({
        title: 'Failed to Add Slot',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleRemoveSlot = async (slotId) => {
    const result = await removeSlot(slotId);
    if (result.success) {
      toast({
        title: 'Slot Removed',
        description: 'The consultation slot has been deleted.',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: 'Failed to delete slot',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    const result = await updateStatus(appointmentId, status);
    if (result.success) {
      toast({
        title: `Appointment ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Patient has been notified.`,
        status: status === 'approved' ? 'success' : 'info',
        duration: 3000,
        isClosable: true
      });
      // Re-fetch doctor profile to update slot booking states
      fetchMyProfile();
    } else {
      toast({
        title: 'Status Update Failed',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const pendingAppointments = appointments.filter(appt => appt.status === 'pending');

  return (
    <Box maxW="1200px" mx="auto" px={6} py={8}>
      <Stack spacing={8}>
        
        {/* Header Block */}
        <Box bgGradient="linear(to-r, teal.600, teal.800)" p={8} borderRadius="2xl" color="white" boxShadow="md">
          <Heading size="xl" mb={2}>Welcome, {myProfile?.user?.name || 'Doctor'}</Heading>
          <Text fontSize="lg" opacity={0.9}>
            Manage your daily consultation schedule, configure slot timings, and handle bookings.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="start">
          
          {/* Column 1 & 2: Main Panels */}
          <Stack spacing={8} gridColumn={{ lg: 'span 2' }}>
            
            {/* 1. Daily Schedule with HashMap Optimization */}
            <Card variant="outline" borderRadius="2xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Icon as={FaCalendarDay} w={5} h={5} color="teal.500" />
                  <Heading size="md" color="teal.700">Daily Consultation Schedule</Heading>
                  <Spacer />
                  {/* Date Picker trigger for O(1) daily schedule lookup */}
                  <HStack>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" whiteSpace="nowrap">Select Date:</Text>
                    <Input
                      type="date"
                      size="sm"
                      focusBorderColor="teal.500"
                      value={selectedScheduleDate}
                      onChange={(e) => setSelectedScheduleDate(e.target.value)}
                      borderRadius="md"
                      width="auto"
                    />
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <Divider mb={4} />
                {dailySchedule.length === 0 ? (
                  <Text color="gray.500" align="center" py={8} fontSize="sm">
                    No consultations booked for {selectedScheduleDate}.
                  </Text>
                ) : (
                  <Stack spacing={4}>
                    {dailySchedule.map((appt) => (
                      <Flex
                        key={appt._id}
                        p={4}
                        border="1px"
                        borderColor="gray.100"
                        borderRadius="xl"
                        align="center"
                        justify="space-between"
                        bg="gray.50"
                      >
                        <HStack spacing={4}>
                          <Icon as={FaUser} color="teal.500" />
                          <Box>
                            <Text fontWeight="bold">{appt.patient?.name}</Text>
                            <Text fontSize="xs" color="gray.500">{appt.patient?.email}</Text>
                          </Box>
                        </HStack>

                        <HStack spacing={4}>
                          <Flex align="center" gap={1} fontSize="xs" color="gray.600">
                            <Icon as={FaClock} />
                            <Text fontWeight="semibold">{appt.time}</Text>
                          </Flex>
                          <Badge
                            colorScheme={appt.status === 'approved' ? 'green' : appt.status === 'rejected' ? 'red' : 'yellow'}
                            borderRadius="full"
                            px={3}
                          >
                            {appt.status}
                          </Badge>
                        </HStack>
                      </Flex>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>

            {/* 2. Pending Requests List */}
            <Card variant="outline" borderRadius="2xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Heading size="md" color="teal.700">Pending Booking Requests</Heading>
              </CardHeader>
              <CardBody>
                <Divider mb={4} />
                {pendingAppointments.length === 0 ? (
                  <Text color="gray.500" align="center" py={8} fontSize="sm">
                    No pending consultation bookings.
                  </Text>
                ) : (
                  <Stack spacing={4}>
                    {pendingAppointments.map((appt) => (
                      <Flex
                        key={appt._id}
                        p={4}
                        border="1px"
                        borderColor="gray.100"
                        borderRadius="xl"
                        align="center"
                        justify="space-between"
                        bg="gray.50"
                      >
                        <Stack spacing={1}>
                          <Text fontWeight="bold">{appt.patient?.name}</Text>
                          <Text fontSize="xs" color="gray.500">Requested consultation: {appt.date} at {appt.time}</Text>
                        </Stack>

                        <HStack spacing={2}>
                          <Button
                            leftIcon={<FaCheck />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleStatusChange(appt._id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            leftIcon={<FaTimes />}
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleStatusChange(appt._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </HStack>
                      </Flex>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </Stack>

          {/* Column 3: Sidebar Controls */}
          <Stack spacing={8}>
            
            {/* Professional Profile Editor */}
            <Card variant="outline" borderRadius="2xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex align="center" gap={2} color="teal.700">
                  <Icon as={FaUserMd} />
                  <Heading size="sm">Professional Profile</Heading>
                  <Spacer />
                  {!isEditingProfile && (
                    <Button size="xs" colorScheme="teal" onClick={() => setIsEditingProfile(true)}>
                      Edit
                    </Button>
                  )}
                </Flex>
              </CardHeader>
              <CardBody>
                <Divider mb={4} />
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile}>
                    <Stack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs">Specialty</FormLabel>
                        <Input
                          size="sm"
                          focusBorderColor="teal.500"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs">Years of Experience</FormLabel>
                        <Input
                          type="number"
                          size="sm"
                          focusBorderColor="teal.500"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Professional Bio</FormLabel>
                        <Textarea
                          size="sm"
                          focusBorderColor="teal.500"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </FormControl>
                      <HStack mt={2}>
                        <Button type="submit" size="sm" colorScheme="teal">
                          Save Credentials
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </HStack>
                    </Stack>
                  </form>
                ) : (
                  <Stack spacing={4} fontSize="sm">
                    <Box>
                      <Text fontWeight="bold" color="gray.500" fontSize="xs">SPECIALTY</Text>
                      <Text fontSize="md" fontWeight="semibold" color="teal.700">
                        {myProfile?.specialty || 'General Medicine'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.500" fontSize="xs">EXPERIENCE</Text>
                      <Text fontSize="md" fontWeight="semibold">
                        {myProfile?.experience || 0} Years
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.500" fontSize="xs">PROFESSIONAL BIO</Text>
                      <Text fontStyle="italic" color="gray.600">
                        "{myProfile?.bio || 'Welcome! I am a registered health professional.'}"
                      </Text>
                    </Box>
                  </Stack>
                )}
              </CardBody>
            </Card>

            {/* Time Slot Scheduler */}
            <Card variant="outline" borderRadius="2xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex align="center" gap={2} color="teal.700">
                  <Icon as={FaCalendarPlus} />
                  <Heading size="sm">Manage Slot Availability</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Divider mb={4} />
                
                {/* Create Slot Form */}
                <form onSubmit={handleAddSlot}>
                  <Stack spacing={3} mb={6}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs">Date</FormLabel>
                      <Input
                        type="date"
                        size="sm"
                        focusBorderColor="teal.500"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs">Time</FormLabel>
                      <Input
                        type="time"
                        size="sm"
                        focusBorderColor="teal.500"
                        value={slotTime}
                        onChange={(e) => setSlotTime(e.target.value)}
                      />
                    </FormControl>
                    <Button type="submit" size="sm" colorScheme="teal" w="full">
                      Add Availability Slot
                    </Button>
                  </Stack>
                </form>

                <Divider mb={4} />
                <Text fontWeight="bold" color="gray.500" fontSize="xs" mb={3}>YOUR TIMINGS</Text>
                
                {/* List Active Slots */}
                {!myProfile?.slots || myProfile.slots.length === 0 ? (
                  <Text color="gray.400" fontSize="xs" align="center" py={4}>
                    You have not set any slot availabilities.
                  </Text>
                ) : (
                  <Stack spacing={2} maxH="300px" overflowY="auto">
                    {myProfile.slots.map((slot) => (
                      <Flex
                        key={slot._id}
                        p={2.5}
                        border="1px"
                        borderColor="gray.100"
                        borderRadius="md"
                        align="center"
                        fontSize="xs"
                        bg="gray.50"
                      >
                        <Stack spacing={0}>
                          <Text fontWeight="bold">{slot.date}</Text>
                          <Text color="gray.600">{slot.time}</Text>
                        </Stack>
                        <Spacer />
                        <HStack spacing={2}>
                          <Badge colorScheme={slot.isBooked ? 'green' : 'gray'}>
                            {slot.isBooked ? 'Booked' : 'Open'}
                          </Badge>
                          {!slot.isBooked && (
                            <IconButton
                              aria-label="Remove slot"
                              icon={<FaTrashAlt />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveSlot(slot._id)}
                            />
                          )}
                        </HStack>
                      </Flex>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>

          </Stack>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
