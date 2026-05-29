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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  HStack,
  Avatar
} from '@chakra-ui/react';
import { FaUserMd, FaCalendarAlt, FaHistory, FaSearch, FaChevronRight, FaGraduationCap } from 'react-icons/fa';
import { useDoctorStore } from '../store/doctorStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { DoctorTrie, mergeSort } from '../utils/algorithms';

export default function PatientDashboard() {
  const { doctors, fetchDoctors } = useDoctorStore();
  const { appointments, bookAppointment, fetchPatientHistory, loading } = useAppointmentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // experience desc or asc
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchDoctors();
    fetchPatientHistory();
  }, []);

  // 1. PREFIX TRIE OPTIMIZATION (Instantly index doctors for search)
  const doctorTrie = useMemo(() => {
    const trie = new DoctorTrie();
    doctors.forEach((doc) => {
      if (doc.user?.name) {
        trie.insert(doc.user.name, doc);
      }
      if (doc.specialty) {
        trie.insert(doc.specialty, doc);
      }
    });
    return trie;
  }, [doctors]);

  // Search logic utilizing Prefix Trie
  const searchedDoctors = useMemo(() => {
    if (!searchQuery.trim()) {
      return doctors;
    }
    return doctorTrie.search(searchQuery);
  }, [searchQuery, doctors, doctorTrie]);

  // 2. MERGE SORT OPTIMIZATION (Sort doctors by years of experience)
  const sortedDoctors = useMemo(() => {
    return mergeSort(searchedDoctors, 'experience', sortOrder);
  }, [searchedDoctors, sortOrder]);

  const handleOpenBooking = (doctor) => {
    setSelectedDoctor(doctor);
    onOpen();
  };

  const handleBookSlot = async (slot) => {
    if (!selectedDoctor) return;

    const result = await bookAppointment(selectedDoctor.user._id, slot.date, slot.time);
    
    if (result.success) {
      toast({
        title: 'Appointment Booked',
        description: `Booking requested for ${slot.date} at ${slot.time}.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onClose();
      // Re-fetch profiles and history to update state
      fetchDoctors();
      fetchPatientHistory();
    } else {
      toast({
        title: 'Booking Failed',
        description: result.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Get status color for history badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'yellow';
    }
  };

  return (
    <Box maxW="1200px" mx="auto" px={6} py={8}>
      <Stack spacing={8}>
        
        {/* Welcome Section */}
        <Box bgGradient="linear(to-r, teal.500, teal.700)" p={8} borderRadius="2xl" color="white" boxShadow="md">
          <Heading size="xl" mb={2}>Welcome to CareSync</Heading>
          <Text fontSize="lg" opacity={0.9}>
            Book slots with expert consultants and track your consultation schedule easily.
          </Text>
        </Box>

        {/* Main Work Area */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="start">
          
          {/* Doctors Listing Section */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <Stack spacing={4}>
              <Flex align="center" justify="space-between">
                <Heading size="md" color="teal.700">Available Doctors</Heading>
                <HStack>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500">Sort by Experience:</Text>
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant={sortOrder === 'desc' ? 'solid' : 'outline'}
                    onClick={() => setSortOrder('desc')}
                  >
                    High to Low
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant={sortOrder === 'asc' ? 'solid' : 'outline'}
                    onClick={() => setSortOrder('asc')}
                  >
                    Low to High
                  </Button>
                </HStack>
              </Flex>

              {/* Search Bar */}
              <Box position="relative">
                <Input
                  placeholder="Search doctors by name or specialty (e.g. Cardiologist)..."
                  focusBorderColor="teal.500"
                  size="lg"
                  bg="white"
                  pl={12}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  boxShadow="sm"
                />
                <Icon
                  as={FaSearch}
                  color="gray.400"
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  w={5}
                  h={5}
                />
              </Box>

              {/* Doctor Cards */}
              {sortedDoctors.length === 0 ? (
                <Card variant="outline" p={8} align="center">
                  <Text color="gray.500" fontWeight="medium">No doctors found matching your query.</Text>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {sortedDoctors.map((doc) => (
                    <Card key={doc._id} variant="outline" hover={{ boxShadow: 'md' }} transition="all 0.2s" borderRadius="xl">
                      <CardBody p={6}>
                        <Flex gap={4} align="start" mb={4}>
                          <Avatar size="md" name={doc.user?.name} bg="teal.500" color="white" icon={<FaUserMd />} />
                          <Box>
                            <Heading size="sm" mb={1}>{doc.user?.name || 'Dr. Unknown'}</Heading>
                            <Badge colorScheme="teal" px={2} py={0.5} borderRadius="md">
                              {doc.specialty}
                            </Badge>
                          </Box>
                        </Flex>

                        <Stack spacing={2} fontSize="sm" color="gray.600" mb={4}>
                          <Flex align="center" gap={2}>
                            <Icon as={FaGraduationCap} color="teal.500" />
                            <Text fontWeight="semibold">{doc.experience} Years of Experience</Text>
                          </Flex>
                          <Text noOfLines={2} fontStyle="italic" color="gray.500">
                            "{doc.bio || 'Consulting doctor at CareSync Clinic.'}"
                          </Text>
                        </Stack>

                        <Divider mb={4} />

                        <Button
                          w="full"
                          colorScheme="teal"
                          rightIcon={<FaChevronRight />}
                          onClick={() => handleOpenBooking(doc)}
                        >
                          Book Appointment
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </Box>

          {/* Appointment History Sidebar */}
          <Box>
            <Card variant="outline" borderRadius="xl" boxShadow="sm">
              <CardHeader pb={0}>
                <Flex align="center" gap={2} color="teal.700">
                  <Icon as={FaHistory} w={5} h={5} />
                  <Heading size="sm">Your Appointment History</Heading>
                </Flex>
              </CardHeader>
              <CardBody p={6}>
                {appointments.length === 0 ? (
                  <Text color="gray.500" fontSize="sm" py={4} align="center">
                    You haven't booked any appointments yet.
                  </Text>
                ) : (
                  <Stack spacing={4}>
                    {appointments.map((appt) => (
                      <Box
                        key={appt._id}
                        p={4}
                        border="1px"
                        borderColor="gray.100"
                        borderRadius="lg"
                        bg="gray.50"
                      >
                        <Flex justify="space-between" align="start" mb={2}>
                          <Text fontWeight="bold" fontSize="sm">
                            {appt.doctor?.name || 'Dr. Consultant'}
                          </Text>
                          <Badge colorScheme={getStatusColor(appt.status)} fontSize="xx-small" px={2} py={0.5} borderRadius="full">
                            {appt.status}
                          </Badge>
                        </Flex>
                        
                        <Flex gap={2} align="center" color="gray.500" fontSize="xs" mt={1}>
                          <Icon as={FaCalendarAlt} />
                          <Text>{appt.date} | {appt.time}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </Box>
        </SimpleGrid>
      </Stack>

      {/* Booking Slot Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader color="teal.600">Available Consultation Slots</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDoctor && (
              <Stack spacing={4}>
                <Box bg="teal.50" p={4} borderRadius="xl">
                  <Text fontWeight="bold" color="teal.800">{selectedDoctor.user?.name}</Text>
                  <Text fontSize="sm" color="teal.600">{selectedDoctor.specialty} • {selectedDoctor.experience} Years Exp.</Text>
                </Box>
                
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Select an Available Time Slot:</Text>
                
                {selectedDoctor.slots && selectedDoctor.slots.filter(s => !s.isBooked).length === 0 ? (
                  <Text color="red.500" fontSize="sm" py={4} align="center">
                    No open booking slots available. Check back later!
                  </Text>
                ) : (
                  <SimpleGrid columns={2} spacing={3}>
                    {selectedDoctor.slots
                      .filter((s) => !s.isBooked)
                      .map((slot) => (
                        <Button
                          key={slot._id}
                          variant="outline"
                          colorScheme="teal"
                          onClick={() => handleBookSlot(slot)}
                          _hover={{ bg: 'teal.500', color: 'white' }}
                          leftIcon={<FaCalendarAlt />}
                          py={6}
                        >
                          <Stack spacing={0} align="start">
                            <Text fontSize="xs" fontWeight="bold">{slot.date}</Text>
                            <Text fontSize="sm">{slot.time}</Text>
                          </Stack>
                        </Button>
                      ))}
                  </SimpleGrid>
                )}
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
