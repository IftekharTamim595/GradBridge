from rest_framework import serializers
from .models import Job
from profiles.models import Skill
from profiles.serializers import SkillSerializer

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company')
    salary = serializers.CharField(source='salary_range', required=False, allow_blank=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Job
        fields = ('id', 'user', 'posted_by', 'title', 'company_name', 'description', 'requirements', 'location', 'salary', 'job_type', 'apply_link', 'skills_required', 'skill_names', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('user', 'posted_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        skill_names = validated_data.pop('skill_names', None)
        job = super().create(validated_data)
        if skill_names is not None:
            skill_objs = []
            for name in skill_names:
                skill, _ = Skill.objects.get_or_create(name=name)
                skill_objs.append(skill)
            job.skills_required.set(skill_objs)
        return job

    def update(self, instance, validated_data):
        skill_names = validated_data.pop('skill_names', None)
        job = super().update(instance, validated_data)
        if skill_names is not None:
            skill_objs = []
            for name in skill_names:
                skill, _ = Skill.objects.get_or_create(name=name)
                skill_objs.append(skill)
            job.skills_required.set(skill_objs)
        return job
