import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_LOGIN_CREDENTIALS,
  ROLE_OPTIONS,
  buildStudentProfileFromAccount,
  evaluatePasswordStrength,
  isValidEmail,
  validateLoginInput,
  validateRoleSetup,
  validateSignupCredentials,
} from './authLogic';

test('exposes all four onboarding roles matching the registration design', () => {
  const ids = ROLE_OPTIONS.map((r) => r.id);
  assert.deepEqual(ids, ['student', 'parent', 'teacher', 'school']);
  assert.equal(ROLE_OPTIONS[0].title, "I'm a Student");
  assert.equal(ROLE_OPTIONS[1].title, "I'm a parent or guardian");
  assert.equal(ROLE_OPTIONS[2].title, "I'm a teacher or tutor");
  assert.equal(ROLE_OPTIONS[3].title, "I'm from a school");
});

test('validates email format and password strength accurately', () => {
  assert.equal(isValidEmail('maya.patel@school.edu'), true);
  assert.equal(isValidEmail('bad-email@'), false);
  assert.equal(isValidEmail(''), false);

  assert.equal(evaluatePasswordStrength('short').label, 'Too short');
  assert.equal(evaluatePasswordStrength('abcdefgh').label, 'Weak');
  assert.equal(evaluatePasswordStrength('Abcdefgh').label, 'Fair');
  assert.equal(evaluatePasswordStrength('Abcdefg1').label, 'Good');
  assert.equal(evaluatePasswordStrength('TutorCloud#2026').label, 'Strong');
});

test('validateSignupCredentials rejects invalid fields and accepts valid credentials', () => {
  const bad = validateSignupCredentials({
    fullName: 'A',
    email: 'invalid',
    password: '123',
    confirmPassword: '456',
    acceptedTerms: false,
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.password);
  assert.ok(bad.errors.confirmPassword);
  assert.ok(bad.errors.acceptedTerms);

  const ok = validateSignupCredentials({
    fullName: 'Aarav Sharma',
    email: 'aarav@tutorcloud.edu',
    password: 'StrongPassword9!',
    confirmPassword: 'StrongPassword9!',
    acceptedTerms: true,
  });
  assert.equal(ok.valid, true);
  assert.deepEqual(ok.errors, {});
});

test('validateRoleSetup enforces role-specific required fields', () => {
  const badStudent = validateRoleSetup('student', {
    grade: '',
    curriculum: 'CCSS',
    subjects: [],
    learningStyle: 'Interactive',
  });
  assert.equal(badStudent.valid, false);
  assert.ok(badStudent.errors.grade);
  assert.ok(badStudent.errors.subjects);

  const badParent = validateRoleSetup('parent', {
    grade: '6',
    curriculum: 'CBSE',
    subjects: ['Science'],
    learningStyle: 'Visual',
    childName: '',
  });
  assert.equal(badParent.valid, false);
  assert.ok(badParent.errors.childName);

  const okSchool = validateRoleSetup('school', {
    grade: 'K-12',
    curriculum: 'CCSS',
    subjects: ['Mathematics'],
    learningStyle: 'Interactive',
    organizationName: 'Lincoln Prep Academy',
  });
  assert.equal(okSchool.valid, true);
});

test('validateLoginInput and buildStudentProfileFromAccount behave deterministically', () => {
  const badLogin = validateLoginInput({ identifier: '', password: '123' });
  assert.equal(badLogin.valid, false);
  assert.ok(badLogin.errors.identifier);
  assert.ok(badLogin.errors.password);

  const okLogin = validateLoginInput({
    identifier: 'aarav@tutorcloud.edu',
    password: 'StrongPassword9!',
  });
  assert.equal(okLogin.valid, true);

  assert.equal(DEMO_LOGIN_CREDENTIALS.identifier, 'you@your.edu');
  assert.equal(DEMO_LOGIN_CREDENTIALS.password, 'You1234');
  assert.equal(validateLoginInput(DEMO_LOGIN_CREDENTIALS).valid, true);

  const profile = buildStudentProfileFromAccount({
    fullName: 'Aarav Sharma',
    email: 'AARAV@TutorCloud.EDU',
    role: 'student',
    grade: '6',
    curriculum: 'CBSE',
    subjects: ['Science', 'Mathematics'],
    learningStyle: 'Visual',
  });
  assert.equal(profile.firstName, 'Aarav');
  assert.equal(profile.email, 'aarav@tutorcloud.edu');
  assert.equal(profile.grade, '6');
  assert.equal(profile.curriculum, 'CBSE');
  assert.deepEqual(profile.subjects, ['Science', 'Mathematics']);
  assert.equal(profile.role, 'student');
});
