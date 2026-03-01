function togglePassword() {
    const input = document.getElementById('password');
    const eyeOn  = document.getElementById('icon-eye');
    const eyeOff = document.getElementById('icon-eye-off');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    eyeOn.style.display  = isHidden ? 'none'  : '';
    eyeOff.style.display = isHidden ? ''      : 'none';
}