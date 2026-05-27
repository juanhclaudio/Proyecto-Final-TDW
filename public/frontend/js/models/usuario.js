class Usuario {
  constructor(email, password, role = 'PÚBLICO') {
    this.email = email;
    this.password = password;
    this.role = role.toUpperCase();
  }
  static esPasswordValido(password) {
    const tieneNumero = /\d/.test(password);
    return password.length >= 8 && tieneNumero;
  }
}