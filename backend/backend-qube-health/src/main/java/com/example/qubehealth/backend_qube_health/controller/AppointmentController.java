package com.example.qubehealth.backend_qube_health.controller;

import com.example.qubehealth.backend_qube_health.dto.AppointmentDTO;
import com.example.qubehealth.backend_qube_health.model.Appointment;
import com.example.qubehealth.backend_qube_health.model.Doctor;
import com.example.qubehealth.backend_qube_health.model.Patient;
import com.example.qubehealth.backend_qube_health.repository.AppointmentRepository;
import com.example.qubehealth.backend_qube_health.repository.DoctorRepository;
import com.example.qubehealth.backend_qube_health.repository.PatientRepository;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody AppointmentDTO request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
        Optional<Patient> patientOpt = patientRepository.findById(request.getPatientId());
        if (doctorOpt.isEmpty() || patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid doctor or patient ID");
        }
        // Double booking check
        if (appointmentRepository
                .findByDoctorIdAndAppointmentDateTime(request.getDoctorId(), request.getAppointmentDateTime())
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Doctor already has an appointment at this time");
        }
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctorOpt.get());
        appointment.setPatient(patientOpt.get());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment = appointmentRepository.save(appointment);
        // Convert to DTO for response
        AppointmentDTO responseDto = new AppointmentDTO();
        responseDto.setId(appointment.getId());
        responseDto.setDoctorId(appointment.getDoctor().getId());
        responseDto.setPatientId(appointment.getPatient().getId());
        responseDto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping
    public List<AppointmentDTO> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream().map(a -> {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setId(a.getId());
            dto.setDoctorId(a.getDoctor().getId());
            dto.setPatientId(a.getPatient().getId());
            dto.setAppointmentDateTime(a.getAppointmentDateTime());
            return dto;
        }).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(a -> {
                    AppointmentDTO dto = new AppointmentDTO();
                    dto.setId(a.getId());
                    dto.setDoctorId(a.getDoctor().getId());
                    dto.setPatientId(a.getPatient().getId());
                    dto.setAppointmentDateTime(a.getAppointmentDateTime());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        if (!appointmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        appointmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDTO request,
            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
        Optional<Patient> patientOpt = patientRepository.findById(request.getPatientId());
        if (doctorOpt.isEmpty() || patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid doctor or patient ID");
        }
        // Double booking check (exclude current appointment)
        if (appointmentRepository
                .findByDoctorIdAndAppointmentDateTime(request.getDoctorId(), request.getAppointmentDateTime())
                .filter(a -> !a.getId().equals(id))
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Doctor already has an appointment at this time");
        }
        Appointment appointment = appointmentOpt.get();
        appointment.setDoctor(doctorOpt.get());
        appointment.setPatient(patientOpt.get());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment = appointmentRepository.save(appointment);
        AppointmentDTO responseDto = new AppointmentDTO();
        responseDto.setId(appointment.getId());
        responseDto.setDoctorId(appointment.getDoctor().getId());
        responseDto.setPatientId(appointment.getPatient().getId());
        responseDto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        return ResponseEntity.ok(responseDto);
    }
}
