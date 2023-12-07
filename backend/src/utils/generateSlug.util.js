/* 
    Hàm xóa dấu tiếng việt và tạo ra slug 
*/

// function remove tiếng việt có dấu
function removeAccents(str) {
  // đổi / ==> space

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const generateSlug = (string) => {
  const removeAccentsString = removeAccents(string);

  return removeAccentsString
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default generateSlug;
