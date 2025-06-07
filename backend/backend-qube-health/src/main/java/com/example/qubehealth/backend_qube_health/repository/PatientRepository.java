package com.example.qubehealth.backend_qube_health.repository;

import com.example.qubehealth.backend_qube_health.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
