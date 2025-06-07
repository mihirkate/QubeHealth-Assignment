import axios from "axios";

const API_BASE = "http://localhost:8081/api";

// Patients
export const getPatients = () => axios.get(`${API_BASE}/patients`);
export const getPatientById = (id) => axios.get(`${API_BASE}/patients/${id}`);
export const createPatient = (data) => axios.post(`${API_BASE}/patients`, data);
export const updatePatient = (id, data) => axios.put(`${API_BASE}/patients/${id}`, data);
export const deletePatient = (id) => axios.delete(`${API_BASE}/patients/${id}`);

// Doctors
export const getDoctors = () => axios.get(`${API_BASE}/doctors`);
export const getDoctorById = (id) => axios.get(`${API_BASE}/doctors/${id}`);
export const createDoctor = (data) => axios.post(`${API_BASE}/doctors`, data);
export const updateDoctor = (id, data) => axios.put(`${API_BASE}/doctors/${id}`, data);
export const deleteDoctor = (id) => axios.delete(`${API_BASE}/doctors/${id}`);

// Appointments
export const getAppointments = () => axios.get(`${API_BASE}/appointments`);
export const getAppointmentById = (id) => axios.get(`${API_BASE}/appointments/${id}`);
export const createAppointment = (data) => axios.post(`${API_BASE}/appointments`, data);
export const updateAppointment = (id, data) => axios.put(`${API_BASE}/appointments/${id}`, data);
export const deleteAppointment = (id) => axios.delete(`${API_BASE}/appointments/${id}`);
