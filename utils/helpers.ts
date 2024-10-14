export const generateRandomCode = (): string => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    return randomCode.toString();
  };

export const validateEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

export const validateFiveDigitCode = (input: string): boolean => {
    const fiveDigitCodeRegex = /^\d{5}$/;
    return fiveDigitCodeRegex.test(input);
  };