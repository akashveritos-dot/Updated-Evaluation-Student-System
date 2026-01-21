from django.db import models

class MAcademicYear(models.Model):
    id = models.AutoField(primary_key=True)
    year = models.CharField(max_length=9)
    status = models.CharField(max_length=1, default='I')

    class Meta:
        db_table = 'm_academic_year'

    def __str__(self):
        return self.year

class MEvent(models.Model):
    id = models.AutoField(primary_key=True)
    year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='year_id')
    event = models.CharField(max_length=22)
    status = models.CharField(max_length=1, default='I')

    class Meta:
        db_table = 'm_event'

    def __str__(self):
        return self.event

class UserRole(models.Model):
    id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'user_role'

class MUser(models.Model):
    id = models.AutoField(primary_key=True)
    u_name = models.CharField(max_length=22)
    u_fathers_name = models.CharField(max_length=50)
    u_dob = models.DateField()
    u_email = models.CharField(max_length=55, unique=True)
    u_password = models.CharField(max_length=150, null=True, blank=True)
    u_role = models.ForeignKey(UserRole, on_delete=models.CASCADE, db_column='u_role')
    fictitious_roll_no = models.IntegerField(null=True, blank=True)
    designation = models.CharField(max_length=33, null=True, blank=True)
    college = models.CharField(max_length=250, null=True, blank=True)
    experience = models.CharField(max_length=255, null=True, blank=True)
    specialization = models.TextField(null=True, blank=True)
    qualification = models.CharField(max_length=55, null=True, blank=True)
    mobile_no = models.BigIntegerField(null=True, blank=True)
    principal_name = models.CharField(max_length=255, null=True, blank=True)
    principal_mobile = models.BigIntegerField(null=True, blank=True)
    declaration = models.CharField(max_length=10, null=True, blank=True)
    bank_name = models.CharField(max_length=30)
    bank_acnt_no = models.CharField(max_length=16, null=True, blank=True)
    confirm_bank_acnt_no = models.IntegerField(null=True, blank=True)
    ifsc_code = models.CharField(max_length=13, null=True, blank=True)
    branch_name = models.CharField(max_length=155, null=True, blank=True)
    u_status = models.CharField(max_length=1, default='I')
    approved_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)
    auto_allocation = models.CharField(max_length=1, default='N')
    face_recognition = models.CharField(max_length=1, default='N')
    face_data_source = models.BinaryField(null=True, blank=True)
    allotment_ltr_no = models.CharField(max_length=50, null=True, blank=True)
    allotment_ltr_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'm_user'
        unique_together = (('u_name', 'u_fathers_name', 'u_dob', 'u_email'),)

    def __str__(self):
        return self.u_name

class MCollege(models.Model):
    id = models.AutoField(primary_key=True)
    college_name = models.CharField(max_length=255)

    class Meta:
        db_table = 'm_college'

class MCourse(models.Model):
    id = models.AutoField(primary_key=True)
    course_name = models.CharField(max_length=255)
    course_status = models.CharField(max_length=1, default='I')
    course_created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'm_course'

class MCoursePart(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(MCourse, on_delete=models.CASCADE, db_column='course_id')
    course_part_name = models.CharField(max_length=55)

    class Meta:
        db_table = 'm_course_part'

class MCoursePartTerm(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(MCourse, on_delete=models.CASCADE, db_column='course_id')
    course_part = models.ForeignKey(MCoursePart, on_delete=models.CASCADE, db_column='course_part_id')
    course_part_term_name = models.CharField(max_length=55)
    course_year = models.IntegerField()

    class Meta:
        db_table = 'm_course_part_term'

class MSubject(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(MCourse, on_delete=models.CASCADE, db_column='course_id')
    course_part = models.ForeignKey(MCoursePart, on_delete=models.CASCADE, db_column='course_part_id')
    course_part_term = models.ForeignKey(MCoursePartTerm, on_delete=models.CASCADE, db_column='course_part_term_id', null=True)
    subject_name = models.CharField(max_length=55)
    subject_code = models.IntegerField()
    subject_status = models.CharField(max_length=1, default='A')

    class Meta:
        db_table = 'm_subject'

class MStudent(models.Model):
    id = models.AutoField(primary_key=True)
    college_id = models.IntegerField() 
    course = models.ForeignKey(MCourse, on_delete=models.CASCADE, db_column='course_id')
    course_part = models.ForeignKey(MCoursePart, on_delete=models.CASCADE, db_column='course_part_id')
    course_part_term = models.ForeignKey(MCoursePartTerm, on_delete=models.CASCADE, db_column='course_part_term_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    fictitious_roll_no = models.IntegerField(unique=True)
    enrolement_no = models.CharField(max_length=33)
    roll_no = models.IntegerField()
    name = models.CharField(max_length=55)
    father_name = models.CharField(max_length=55)
    status = models.CharField(max_length=1, default='A')
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'm_student'
        unique_together = (('fictitious_roll_no', 'roll_no'),)

class MQuestionPaper(models.Model):
    id = models.AutoField(primary_key=True)
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    serial_no = models.CharField(max_length=20)
    set_no = models.CharField(max_length=20)
    description = models.CharField(max_length=100)
    max_marks = models.IntegerField()
    passing_marks = models.IntegerField()
    total_questions = models.IntegerField()
    mandatory_questions = models.IntegerField()
    question_file = models.TextField(null=True, blank=True)
    active_status = models.CharField(max_length=2)
    created_by = models.CharField(max_length=11)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'm_question_paper'
        unique_together = (('subject', 'academic_year', 'academic_event', 'serial_no', 'set_no'),)

class TQuestions(models.Model):
    id = models.AutoField(primary_key=True)
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    paper = models.ForeignKey(MQuestionPaper, on_delete=models.CASCADE, db_column='paper_id')
    question_no = models.CharField(max_length=10)
    question = models.CharField(max_length=500)
    max_marks = models.IntegerField()
    has_subquestion = models.CharField(max_length=1, default='N')
    active_status = models.CharField(max_length=1, default='A')

    class Meta:
        db_table = 't_questions'
        unique_together = (('subject', 'paper', 'question_no'),)

class TSubquestions(models.Model):
    id = models.AutoField(primary_key=True)
    question_ref = models.ForeignKey(TQuestions, on_delete=models.CASCADE, db_column='question_id')
    question_no = models.CharField(max_length=10, null=True)
    question = models.CharField(max_length=3000)
    max_marks = models.IntegerField()
    active_status = models.CharField(max_length=1, default='A')

    class Meta:
        db_table = 't_subquestions'

class MAnswerSheetAllocationBatch(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MUser, on_delete=models.CASCADE, db_column='user_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    allocated_sheets = models.IntegerField()
    target_date = models.DateField()
    status = models.CharField(max_length=1)
    allocated_by = models.IntegerField()
    allocated_on = models.DateTimeField(auto_now_add=True)
    revoked_sheets = models.IntegerField(null=True, blank=True)
    revoked_by = models.IntegerField(null=True, blank=True)
    revoked_on = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'm_answer_sheet_allocation_batch'

class MStudentSubjectAnswerSheet(models.Model):
    id = models.AutoField(primary_key=True)
    student_fictitious_roll_no = models.IntegerField()
    # ... other fields inferred
    class Meta:
        db_table = 'm_student_subject_answer_sheet'

class MAnswerSheetAllocation(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MUser, on_delete=models.CASCADE, db_column='user_id')
    batch = models.ForeignKey(MAnswerSheetAllocationBatch, on_delete=models.CASCADE, db_column='batch_id', null=True)
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    student_fictitious_roll_no = models.IntegerField()
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    answer_sheet = models.ForeignKey(MStudentSubjectAnswerSheet, on_delete=models.CASCADE, db_column='answer_sheet_id')
    status = models.CharField(max_length=1)
    created_by = models.IntegerField()
    created_on = models.DateTimeField(auto_now_add=True)
    checked_on = models.DateTimeField(auto_now=True)
    checker_remarks = models.CharField(max_length=1000, null=True, blank=True)

    class Meta:
        db_table = 'm_answer_sheet_allocation'

class TExaminationCopyRaw(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MUser, on_delete=models.CASCADE, db_column='user_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    paper = models.ForeignKey(MQuestionPaper, on_delete=models.CASCADE, db_column='paper_id')
    fictitious_roll_no = models.IntegerField()
    answer_sheet_name = models.CharField(max_length=55, null=True, blank=True)
    examination_copy_page_id = models.IntegerField()
    examination_copy_page_barcode = models.CharField(max_length=20, null=True, blank=True)
    examination_copy_page_image = models.BinaryField(null=True, blank=True) # LongBlob
    examination_copy_page_checked = models.BooleanField()
    date_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 't_examination_copy_raw'

class TQuestionMarksRaw(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MUser, on_delete=models.CASCADE, db_column='user_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    paper = models.ForeignKey(MQuestionPaper, on_delete=models.CASCADE, db_column='paper_id')
    fictitious_roll_no = models.IntegerField()
    question_marks_question_no = models.CharField(max_length=10)
    question_marks_sub_question_no = models.CharField(max_length=10, null=True, blank=True)
    question_marks_question = models.TextField(null=True, blank=True)
    question_marks_max_marks = models.IntegerField()
    question_marks_marks_obtained = models.FloatField()
    question_marks_is_checked = models.BooleanField()
    question_marks_is_not_attended = models.BooleanField()
    question_marks_is_marked_for_check_later = models.BooleanField()
    question_marks_checker_remarks = models.CharField(max_length=200, null=True, blank=True)
    question_marks_question_max_marks = models.IntegerField()
    date_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 't_question_marks_raw'

class TStudentMarksObtained(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(MUser, on_delete=models.CASCADE, db_column='user_id')
    academic_year = models.ForeignKey(MAcademicYear, on_delete=models.CASCADE, db_column='academic_year')
    academic_event = models.ForeignKey(MEvent, on_delete=models.CASCADE, db_column='academic_event')
    subject = models.ForeignKey(MSubject, on_delete=models.CASCADE, db_column='subject_id')
    paper = models.ForeignKey(MQuestionPaper, on_delete=models.CASCADE, db_column='paper_id')
    fictitious_roll_no = models.IntegerField()
    question_no = models.CharField(max_length=10)
    sub_question_no = models.CharField(max_length=10, null=True, blank=True)
    question = models.TextField(null=True, blank=True)
    max_marks = models.IntegerField()
    marks_obtained = models.FloatField()
    date_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 't_student_marks_obtained'
