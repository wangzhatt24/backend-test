function formatPriceTV(price) {
  if (price >= 1000000000) {
    let newPrice = price / 1000000000;

    return `${newPrice
      .toFixed(3)
      .replace(/\.0+$|(\d)(?=(\d{3})+\.)/g, '$1')} tỷ`;
  }

  if (price >= 1000000) {
    let newPrice = price / 1000000;

    return `${newPrice} triệu`;
  }
}

export default formatPriceTV;
