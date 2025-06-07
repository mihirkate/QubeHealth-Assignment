package com.example.qubehealth.backend_qube_health.controller;

import com.example.qubehealth.backend_qube_health.dto.PatientDTO;
import com.example.qubehealth.backend_qube_health.model.Patient;
import com.example.qubehealth.backend_qube_health.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> addPatient(@Valid @RequestBody PatientDTO patientDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        Patient patient = new Patient();
        BeanUtils.copyProperties(patientDTO, patient);
        patient = patientRepository.save(patient);
        patientDTO.setId(patient.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(patientDTO);
    }

    @GetMapping
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream().map(p -> {
            PatientDTO dto = new PatientDTO();
            BeanUtils.copyProperties(p, dto);
            return dto;
        }).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(p -> {
                    PatientDTO dto = new PatientDTO();
                    BeanUtils.copyProperties(p, dto);
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDTO updatedPatientDTO,
            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatientDTO.getName());
            patient.setEmail(updatedPatientDTO.getEmail());
            patient.setPhone(updatedPatientDTO.getPhone());
            patientRepository.save(patient);
            BeanUtils.copyProperties(patient, updatedPatientDTO);
            return ResponseEntity.ok(updatedPatientDTO);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
