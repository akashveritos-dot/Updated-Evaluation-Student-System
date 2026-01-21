SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `t_subquestions`;
DROP TABLE IF EXISTS `t_student_marks_raw`;
DROP TABLE IF EXISTS `t_student_marks_obtained`;
DROP TABLE IF EXISTS `t_question_marks_raw`;
DROP TABLE IF EXISTS `t_questions`;
DROP TABLE IF EXISTS `t_examination_copy_raw`;
DROP TABLE IF EXISTS `m_user`;
DROP TABLE IF EXISTS `m_subject`;
DROP TABLE IF EXISTS `m_student`;
DROP TABLE IF EXISTS `m_question_paper`;
DROP TABLE IF EXISTS `m_event`;
DROP TABLE IF EXISTS `m_course_part_term`;
DROP TABLE IF EXISTS `m_course_part`;
DROP TABLE IF EXISTS `m_course`;
DROP TABLE IF EXISTS `m_college`;
DROP TABLE IF EXISTS `m_answer_sheet_allocation_batch`;
DROP TABLE IF EXISTS `m_answer_sheet_allocation`;
DROP TABLE IF EXISTS `m_academic_year`;

-- Recreate Tables

CREATE TABLE `m_academic_year` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `year` varchar(9) NOT NULL,
 `status` varchar(1) NOT NULL DEFAULT 'I',
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `m_college` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `college_name` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_course` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `course_name` varchar(255) NOT NULL,
 `course_status` varchar(1) NOT NULL DEFAULT 'I',
 `course_created_on` datetime DEFAULT current_timestamp(),
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_course_part` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `course_id` int(11) NOT NULL,
 `course_part_name` varchar(55) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `course_id` (`course_id`),
 CONSTRAINT `m_course_part_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `m_course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_course_part_term` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `course_id` int(11) NOT NULL,
 `course_part_id` int(11) NOT NULL,
 `course_part_term_name` varchar(55) NOT NULL,
 `course_year` int(11) NOT NULL,
 PRIMARY KEY (`id`),
 KEY `course_part_id` (`course_part_id`),
 KEY `course_id` (`course_id`),
 CONSTRAINT `m_course_part_term_ibfk_1` FOREIGN KEY (`course_part_id`) REFERENCES `m_course_part` (`id`),
 CONSTRAINT `m_course_part_term_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `m_course` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_event` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `year_id` int(11) NOT NULL,
 `event` varchar(22) NOT NULL,
 `status` varchar(1) NOT NULL DEFAULT 'I',
 PRIMARY KEY (`id`),
 KEY `year_id` (`year_id`),
 CONSTRAINT `m_event_ibfk_1` FOREIGN KEY (`year_id`) REFERENCES `m_academic_year` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `m_subject` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `course_id` int(11) NOT NULL,
 `course_part_id` int(11) NOT NULL,
 `course_part_term_id` int(11) DEFAULT NULL,
 `subject_name` varchar(55) NOT NULL,
 `subject_code` int(11) NOT NULL,
 `subject_status` varchar(1) NOT NULL DEFAULT 'A',
 PRIMARY KEY (`id`),
 KEY `course_id` (`course_id`),
 KEY `course_part_id` (`course_part_id`),
 KEY `course_part_term_id` (`course_part_term_id`),
 CONSTRAINT `m_subject_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `m_course` (`id`),
 CONSTRAINT `m_subject_ibfk_2` FOREIGN KEY (`course_part_id`) REFERENCES `m_course_part` (`id`),
 CONSTRAINT `m_subject_ibfk_3` FOREIGN KEY (`course_part_term_id`) REFERENCES `m_course_part_term` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_question_paper` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `subject_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `serial_no` varchar(20) NOT NULL,
 `set_no` varchar(20) NOT NULL,
 `description` varchar(100) NOT NULL,
 `max_marks` int(11) NOT NULL,
 `passing_marks` int(11) NOT NULL,
 `total_questions` int(11) NOT NULL,
 `mandatory_questions` int(11) NOT NULL,
 `question_file` text DEFAULT NULL,
 `active_status` varchar(2) NOT NULL,
 `created_by` varchar(11) NOT NULL,
 `created_on` datetime(6) NOT NULL DEFAULT current_timestamp(6),
 PRIMARY KEY (`id`),
 UNIQUE KEY `subject_id` (`subject_id`,`academic_year`,`academic_event`,`serial_no`,`set_no`) USING BTREE,
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 CONSTRAINT `m_question_paper_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `m_question_paper_ibfk_2` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `m_question_paper_ibfk_3` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_student` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `college_id` int(11) NOT NULL,
 `course_id` int(11) NOT NULL,
 `course_part_id` int(11) NOT NULL,
 `course_part_term_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `fictitious_roll_no` int(12) NOT NULL,
 `enrolement_no` varchar(33) NOT NULL,
 `roll_no` int(11) NOT NULL,
 `name` varchar(55) NOT NULL,
 `father_name` varchar(55) NOT NULL,
 `status` varchar(1) DEFAULT 'A',
 `created_on` timestamp NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 UNIQUE KEY `fictitious_roll_no` (`fictitious_roll_no`),
 UNIQUE KEY `fictitious_roll_no_2` (`fictitious_roll_no`,`roll_no`),
 UNIQUE KEY `roll_no_2` (`roll_no`),
 KEY `course_id` (`course_id`),
 KEY `course_part_id` (`course_part_id`),
 KEY `course_part_term_id` (`course_part_term_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 KEY `roll_no` (`roll_no`,`name`),
 CONSTRAINT `m_student_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `m_course` (`id`),
 CONSTRAINT `m_student_ibfk_3` FOREIGN KEY (`course_part_id`) REFERENCES `m_course_part` (`id`),
 CONSTRAINT `m_student_ibfk_4` FOREIGN KEY (`course_part_term_id`) REFERENCES `m_course_part_term` (`id`),
 CONSTRAINT `m_student_ibfk_5` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `m_student_ibfk_6` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- MUser requires UserRole? The SQL provided refers to user_role but didn't provide CREATE TABLE for it.
-- Assuming user_role exists or adding a placeholder creation if needed.
-- Wait, m_user SQL says: FOREIGN KEY (`u_role`) REFERENCES `user_role` (`id`)
-- I MUST CREATE user_role first. The user did NOT provide it but it's a dependency.
-- I'll add a minimal create statement for `user_role` based on inference from constraints.
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `m_user` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `u_name` varchar(22) NOT NULL,
 `u_fathers_name` varchar(50) NOT NULL,
 `u_dob` date NOT NULL,
 `u_email` varchar(55) NOT NULL,
 `u_password` varchar(150) DEFAULT NULL,
 `u_role` int(11) NOT NULL,
 `fictitious_roll_no` int(11) DEFAULT NULL,
 `designation` varchar(33) DEFAULT NULL,
 `college` varchar(250) DEFAULT NULL,
 `experience` varchar(255) DEFAULT NULL,
 `specialization` longtext DEFAULT NULL,
 `qualification` varchar(55) DEFAULT NULL,
 `mobile_no` bigint(11) DEFAULT NULL,
 `principal_name` varchar(255) DEFAULT NULL,
 `principal_mobile` bigint(11) DEFAULT NULL,
 `declaration` varchar(10) DEFAULT NULL,
 `bank_name` varchar(30) NOT NULL,
 `bank_acnt_no` varchar(16) DEFAULT NULL,
 `confirm_bank_acnt_no` int(20) DEFAULT NULL,
 `ifsc_code` varchar(13) DEFAULT NULL,
 `branch_name` varchar(155) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
 `u_status` varchar(1) NOT NULL DEFAULT 'I',
 `approved_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
 `created_on` datetime NOT NULL DEFAULT current_timestamp(),
 `auto_allocation` varchar(1) NOT NULL DEFAULT 'N',
 `face_recognition` varchar(1) NOT NULL DEFAULT 'N',
 `face_data_source` longblob DEFAULT NULL,
 `allotment_ltr_no` varchar(50) DEFAULT NULL,
 `allotment_ltr_date` date DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `u_email` (`u_email`),
 UNIQUE KEY `u_name` (`u_name`,`u_fathers_name`,`u_dob`,`u_email`) USING BTREE,
 KEY `m_user_ibfk_1` (`u_role`),
 CONSTRAINT `m_user_ibfk_1` FOREIGN KEY (`u_role`) REFERENCES `user_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `m_answer_sheet_allocation_batch` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `allocated_sheets` int(11) NOT NULL,
 `target_date` date NOT NULL,
 `status` varchar(1) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
 `allocated_by` int(11) NOT NULL,
 `allocated_on` datetime NOT NULL DEFAULT current_timestamp(),
 `revoked_sheets` int(11) DEFAULT NULL,
 `revoked_by` int(11) DEFAULT NULL,
 `revoked_on` date DEFAULT NULL,
 PRIMARY KEY (`id`),
 KEY `academic_event` (`academic_event`),
 KEY `user_id` (`user_id`),
 KEY `m_answer_sheet_allocation_batch_ibfk_1` (`academic_year`),
 CONSTRAINT `m_answer_sheet_allocation_batch_ibfk_1` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_batch_ibfk_2` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_batch_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- m_student_subject_answer_sheet is referenced by m_answer_sheet_allocation but was NOT provided.
-- I must infer it or creation will fail.
-- Based on inference:
CREATE TABLE IF NOT EXISTS `m_student_subject_answer_sheet` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `m_answer_sheet_allocation` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `batch_id` int(11) DEFAULT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `student_fictitious_roll_no` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `answer_sheet_id` int(11) NOT NULL,
 `status` varchar(1) NOT NULL,
 `created_by` int(11) NOT NULL,
 `created_on` datetime NOT NULL DEFAULT current_timestamp(),
 `checked_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp(),
 `checker_remarks` varchar(1000) DEFAULT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `answer_sheet_id_2` (`answer_sheet_id`),
 KEY `subject_id` (`subject_id`),
 KEY `user_id` (`user_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 KEY `answer_sheet_id` (`answer_sheet_id`),
 KEY `student_fictitious_roll_no` (`student_fictitious_roll_no`,`subject_id`,`answer_sheet_id`),
 KEY `batch_id` (`batch_id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_3` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_4` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_5` FOREIGN KEY (`answer_sheet_id`) REFERENCES `m_student_subject_answer_sheet` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_6` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `m_answer_sheet_allocation_ibfk_7` FOREIGN KEY (`batch_id`) REFERENCES `m_answer_sheet_allocation_batch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

CREATE TABLE `t_examination_copy_raw` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `paper_id` int(11) NOT NULL,
 `fictitious_roll_no` int(11) NOT NULL,
 `answer_sheet_name` varchar(55) DEFAULT NULL,
 `examination_copy_page_id` int(11) NOT NULL,
 `examination_copy_page_barcode` varchar(20) DEFAULT NULL,
 `examination_copy_page_image` longblob DEFAULT NULL,
 `examination_copy_page_checked` tinyint(1) NOT NULL,
 `date_time` timestamp NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `user_id` (`user_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 KEY `subject_id` (`subject_id`),
 KEY `paper_id` (`paper_id`),
 KEY `user_id_2` (`user_id`,`academic_year`,`academic_event`,`subject_id`,`paper_id`,`fictitious_roll_no`,`examination_copy_page_id`),
 CONSTRAINT `t_examination_copy_raw_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`),
 CONSTRAINT `t_examination_copy_raw_ibfk_2` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `t_examination_copy_raw_ibfk_3` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`),
 CONSTRAINT `t_examination_copy_raw_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `t_examination_copy_raw_ibfk_5` FOREIGN KEY (`paper_id`) REFERENCES `m_question_paper` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `t_questions` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `subject_id` int(11) NOT NULL,
 `paper_id` int(11) NOT NULL,
 `question_no` varchar(10) NOT NULL,
 `question` varchar(500) NOT NULL,
 `max_marks` int(11) NOT NULL,
 `has_subquestion` varchar(1) NOT NULL DEFAULT 'N',
 `active_status` varchar(1) NOT NULL DEFAULT 'A',
 PRIMARY KEY (`id`),
 UNIQUE KEY `subject_id_2` (`subject_id`,`paper_id`,`question_no`),
 KEY `subject_id` (`subject_id`),
 KEY `academic_year` (`paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `t_question_marks_raw` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `paper_id` int(11) NOT NULL,
 `fictitious_roll_no` int(11) NOT NULL,
 `question_marks_question_no` varchar(10) NOT NULL,
 `question_marks_sub_question_no` varchar(10) DEFAULT NULL,
 `question_marks_question` text DEFAULT NULL,
 `question_marks_max_marks` int(11) NOT NULL,
 `question_marks_marks_obtained` float(4,2) NOT NULL,
 `question_marks_is_checked` tinyint(1) NOT NULL,
 `question_marks_is_not_attended` tinyint(1) NOT NULL,
 `question_marks_is_marked_for_check_later` tinyint(1) NOT NULL,
 `question_marks_checker_remarks` varchar(200) DEFAULT NULL,
 `question_marks_question_max_marks` int(11) NOT NULL,
 `date_time` timestamp NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `subject_id` (`subject_id`),
 KEY `paper_id` (`paper_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 KEY `t_question_marks_raw_ibfk_1` (`user_id`),
 CONSTRAINT `t_question_marks_raw_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`),
 CONSTRAINT `t_question_marks_raw_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `t_question_marks_raw_ibfk_3` FOREIGN KEY (`paper_id`) REFERENCES `m_question_paper` (`id`),
 CONSTRAINT `t_question_marks_raw_ibfk_4` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `t_question_marks_raw_ibfk_5` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `t_student_marks_obtained` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `paper_id` int(11) NOT NULL,
 `fictitious_roll_no` int(11) NOT NULL,
 `question_no` varchar(10) NOT NULL,
 `sub_question_no` varchar(10) DEFAULT NULL,
 `question` text DEFAULT NULL,
 `max_marks` int(11) NOT NULL,
 `marks_obtained` float(4,2) NOT NULL,
 `date_time` timestamp NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `user_id` (`user_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 KEY `subject_id` (`subject_id`),
 KEY `paper_id` (`paper_id`),
 CONSTRAINT `t_student_marks_obtained_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`),
 CONSTRAINT `t_student_marks_obtained_ibfk_2` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `t_student_marks_obtained_ibfk_3` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`),
 CONSTRAINT `t_student_marks_obtained_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `t_student_marks_obtained_ibfk_5` FOREIGN KEY (`paper_id`) REFERENCES `m_question_paper` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `t_student_marks_raw` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` int(11) NOT NULL,
 `academic_year` int(11) NOT NULL,
 `academic_event` int(11) NOT NULL,
 `subject_id` int(11) NOT NULL,
 `paper_id` int(11) NOT NULL,
 `fictitious_roll_no` int(11) NOT NULL,
 `record_marks_id` int(11) NOT NULL,
 `record_marks_question_id` int(11) NOT NULL,
 `record_marks_marks_id` int(11) NOT NULL,
 `record_marks_page_id` int(11) NOT NULL,
 `record_marks_question_no` varchar(10) NOT NULL,
 `record_marks_max_marks` int(11) NOT NULL,
 `record_marks_marks_scored` float(4,2) NOT NULL,
 `record_marks_is_checked` tinyint(1) NOT NULL,
 `record_marks_checker_action` varchar(10) DEFAULT NULL,
 `record_marks_checker_remarks` varchar(100) DEFAULT NULL,
 `record_marks_page_image` longblob DEFAULT NULL,
 `date_time` timestamp NULL DEFAULT current_timestamp(),
 PRIMARY KEY (`id`),
 KEY `user_id` (`user_id`),
 KEY `subject_id` (`subject_id`),
 KEY `paper_id` (`paper_id`),
 KEY `academic_year` (`academic_year`),
 KEY `academic_event` (`academic_event`),
 CONSTRAINT `t_student_marks_raw_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `m_user` (`id`),
 CONSTRAINT `t_student_marks_raw_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `m_subject` (`id`),
 CONSTRAINT `t_student_marks_raw_ibfk_3` FOREIGN KEY (`paper_id`) REFERENCES `m_question_paper` (`id`),
 CONSTRAINT `t_student_marks_raw_ibfk_4` FOREIGN KEY (`academic_year`) REFERENCES `m_academic_year` (`id`),
 CONSTRAINT `t_student_marks_raw_ibfk_5` FOREIGN KEY (`academic_event`) REFERENCES `m_event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `t_subquestions` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `question_id` int(11) NOT NULL,
 `question_no` varchar(10) DEFAULT NULL,
 `question` varchar(3000) NOT NULL,
 `max_marks` int(11) NOT NULL,
 `active_status` varchar(1) NOT NULL DEFAULT 'A',
 PRIMARY KEY (`id`),
 KEY `question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

SET FOREIGN_KEY_CHECKS=1;
