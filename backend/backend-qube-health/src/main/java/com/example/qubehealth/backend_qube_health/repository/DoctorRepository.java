package com.example.qubehealth.backend_qube_health.repository;

import com.example.qubehealth.backend_qube_health.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
