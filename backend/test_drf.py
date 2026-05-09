from students.serializers import StudentSerializer
from students.models import Student
from institutions.models import Institution

inst, _ = Institution.objects.get_or_create(institution_name="Test Inst", institution_type="Test")
student, _ = Student.objects.get_or_create(student_id="123", full_name="Test Student", institution=inst, course=None)

try:
    data = StudentSerializer(student).data
    print("Serializer data:", data)
except Exception as e:
    import traceback
    traceback.print_exc()
