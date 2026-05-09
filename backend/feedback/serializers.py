from rest_framework import serializers
from .models import FeedbackForm, FeedbackQuestion, FormAnswer, FormResponse


class FeedbackQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FeedbackQuestion
        fields = ('id', 'text', 'question_type', 'options', 'order')


class FeedbackFormSerializer(serializers.ModelSerializer):
    questions      = FeedbackQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model  = FeedbackForm
        fields = ('id', 'title', 'form_type', 'status', 'question_count', 'questions', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_question_count(self, obj):
        return obj.questions.count()


class FeedbackFormWriteSerializer(serializers.ModelSerializer):
    questions = FeedbackQuestionSerializer(many=True)

    class Meta:
        model  = FeedbackForm
        fields = ('id', 'title', 'form_type', 'status', 'questions')

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        form = FeedbackForm.objects.create(**validated_data)
        for idx, q in enumerate(questions_data):
            q.setdefault('order', idx)
            FeedbackQuestion.objects.create(form=form, **q)
        return form

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for idx, q in enumerate(questions_data):
                q.setdefault('order', idx)
                FeedbackQuestion.objects.create(form=instance, **q)

        return instance


class FormAnswerWriteSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer      = serializers.CharField(allow_blank=True)


class FormResponseWriteSerializer(serializers.Serializer):
    answers = FormAnswerWriteSerializer(many=True)
