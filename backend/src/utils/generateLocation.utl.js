import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// tạo ra trường location theo cấu trúc
// có trường nào thì tạo trường đó

function generateLocation(province_id, district_id, ward_id, street) {
  const path = __dirname + '/provinces.json';
  const provinces = JSON.parse(fs.readFileSync(path, 'utf-8'));

  province_id = parseInt(province_id);
  district_id = parseInt(district_id);

  const current_province = provinces.find((item) => item.code === province_id);
  const current_district = current_province.districts.find(
    (item) => item.code === district_id
  );

  // nếu trường phường/xã và đường có tồn tại
  if (ward_id && street) {
    ward_id = parseInt(ward_id);
    const current_ward = current_district.wards.find(
      (item) => item.code === ward_id
    );

    return {
      province: {
        code: current_province.code,
        name: current_province.name,
      },
      district: {
        code: current_district.code,
        name: current_district.name,
      },
      ward: {
        code: current_ward.code,
        name: current_ward.name,
      },
      street: street,
    };
  }

  return {
    province: {
      code: current_province.code,
      name: current_province.name,
    },
    district: {
      code: current_district.code,
      name: current_district.name,
    },
  };
}

export default generateLocation;
