interface LoginData {
  email?: string;
  password?: string;
}

interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

type ValidationResult = { status: boolean; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = (data: LoginData): ValidationResult => {
  if (!data.email?.trim()) return { status: false, error: 'Email is required' };
  if (!data.password?.trim()) return { status: false, error: 'Password is required' };
  if (!EMAIL_REGEX.test(data.email)) return { status: false, error: 'Invalid email format' };
  return { status: true, error: '' };
};

export const validateRegister = (data: RegisterData): ValidationResult => {
  if (!data.name?.trim()) return { status: false, error: 'Name is required' };
  if (!data.email?.trim()) return { status: false, error: 'Email is required' };
  if (!data.password?.trim()) return { status: false, error: 'Password is required' };
  if (!EMAIL_REGEX.test(data.email)) return { status: false, error: 'Invalid email format' };
  if (data.password.length < 8)
    return { status: false, error: 'Password must be at least 8 characters' };
  return { status: true, error: '' };
};

export const validateUpdateUser = (data: UpdateUserData): ValidationResult => {
  if (data.email !== undefined && !EMAIL_REGEX.test(data.email)) {
    return { status: false, error: 'Invalid email format' };
  }
  if (data.password !== undefined && data.password.length < 8) {
    return { status: false, error: 'Password must be at least 8 characters' };
  }
  return { status: true, error: '' };
};
