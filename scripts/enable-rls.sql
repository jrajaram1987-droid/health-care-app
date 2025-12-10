-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_relationships ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Doctors table policies
CREATE POLICY "Doctors can view their own profile" ON doctors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Doctors can update their own profile" ON doctors FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Anyone can view doctor profiles" ON doctors FOR SELECT USING (true);

-- Patients table policies
CREATE POLICY "Patients can view their own profile" ON patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Patients can update their own profile" ON patients FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Doctors can view assigned patients" ON patients FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM doctor_patient_relationships dpr
    WHERE dpr.patient_id = patients.id
    AND dpr.doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
  )
);

-- Pharmacies table policies
CREATE POLICY "Pharmacies can view their own profile" ON pharmacies FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Pharmacies can update their own profile" ON pharmacies FOR UPDATE USING (user_id = auth.uid());

-- Medical History policies
CREATE POLICY "Patients can view their medical history" ON medical_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p WHERE p.id = medical_history.patient_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can view assigned patient history" ON medical_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = medical_history.doctor_id AND d.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can insert medical history" ON medical_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = medical_history.doctor_id AND d.user_id = auth.uid()
  )
);

-- Appointments policies
CREATE POLICY "Patients can view their appointments" ON appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can view assigned patient appointments" ON appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()
  )
);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p WHERE p.id = appointments.patient_id AND p.user_id = auth.uid()
  )
);

-- Prescriptions policies
CREATE POLICY "Patients can view their prescriptions" ON prescriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p WHERE p.id = prescriptions.patient_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can view their prescriptions" ON prescriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can create prescriptions" ON prescriptions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()
  )
);

-- Prescription Orders policies
CREATE POLICY "Pharmacies can view orders" ON prescription_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pharmacies p WHERE p.id = prescription_orders.pharmacy_id AND p.user_id = auth.uid()
  )
);
CREATE POLICY "Pharmacies can update order status" ON prescription_orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM pharmacies p WHERE p.id = prescription_orders.pharmacy_id AND p.user_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);

-- Medicine Reminders policies
CREATE POLICY "Patients can view their reminders" ON medicine_reminders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patients p WHERE p.id = medicine_reminders.patient_id AND p.user_id = auth.uid()
  )
);
