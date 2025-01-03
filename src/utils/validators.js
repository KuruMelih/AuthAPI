exports.validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  exports.validatePassword = (password) => {
    // En az 6 karakter ve en az 1 rakam
    return password.length >= 6 && /\d/.test(password);
  };