export const validateSignIn = (email, password) => {
  const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    email.trim()
  );
  const isValidPassword = /^.{4,60}$/.test(password.trim());

  if (!isValidEmail) {
    return { field: "email", message: "Please enter a valid email." };
  }
  if (!isValidPassword) {
    return {
      field: "password",
      message: "Your password must contain between 4 and 60 characters.",
    };
  }
  return null;
};

export const validateSignUp = (email, password, name) => {
  const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    email.trim()
  );
  const isValidPassword = /^.{6,60}$/.test(password.trim());
  const isValidName = /^[A-Za-z]{3,}(?: [A-Za-z]+)*$/.test(name.trim());

  if (!isValidName) {
    return { field: "name", message: "Name must contain only letters (A–Z)." };
  }
  if (!isValidEmail) {
    return { field: "email", message: "Please enter a valid email." };
  }
  if (!isValidPassword) {
    return {
      field: "password",
      message: "Your password must contain between 6 and 60 characters.",
    };
  }
  return null;
};