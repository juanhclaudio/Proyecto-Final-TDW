class Usuario {
  constructor(email, password, rol = 'PÚBLICO') {
    this.email = email;
    this.password = password;
    this.rol = rol;
  }
  static esPasswordValido(password) {
    const tieneNumero = /\d/.test(password);
    return password.length >= 8 && tieneNumero;
  }
}