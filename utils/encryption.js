// Hàm mã hóa với XOR Cipher
function encrypt(text, key) {
  let encryptedText = '';
  // Lặp qua từng ký tự trong chuỗi văn bản
  for (let i = 0; i < text.length; i++) {
    const keyChar = key[i % key.length]; // Lặp qua khóa nếu khóa ngắn hơn văn bản
    encryptedText += String.fromCharCode(
      text.charCodeAt(i) ^ keyChar.charCodeAt(0),
    ); // XOR và chuyển lại thành ký tự
  }
  return encryptedText;
}
// Hàm giải mã với XOR Cipher
function decrypt(encryptedText, key) {
  let decryptedText = '';
  // Lặp qua từng ký tự trong chuỗi văn bản đã mã hóa
  for (let i = 0; i < encryptedText.length; i++) {
    const keyChar = key[i % key.length]; // Lặp qua khóa nếu khóa ngắn hơn văn bản
    decryptedText += String.fromCharCode(
      encryptedText.charCodeAt(i) ^ keyChar.charCodeAt(0),
    ); // XOR và chuyển lại thành ký tự
  }
  return decryptedText;
}
