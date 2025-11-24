export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,}$/;
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { isValid: true };
}

export function validateFullName(fullName: string): ValidationResult {
  if (!fullName) {
    return { isValid: false, error: 'Full name is required' };
  }
  if (fullName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }
  if (fullName.length > 100) {
    return { isValid: false, error: 'Full name must be less than 100 characters' };
  }
  return { isValid: true };
}

export function validateDateOfBirth(dateOfBirth: string): ValidationResult {
  if (!dateOfBirth) {
    return { isValid: false, error: 'Date of birth is required' };
  }
  const date = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  if (age < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }
  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth' };
  }
  return { isValid: true };
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
}
