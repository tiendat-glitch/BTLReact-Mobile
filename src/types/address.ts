export type Address = {
  id: number | string;
  user_id?: number | string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
  ward: string | null;
  district: string | null;
  province: string;
  latitude: number | string | null;
  longitude: number | string | null;
  is_default: boolean | number;
};

export type AddressInput = {
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
  ward: string;
  district: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
};

export type ReverseGeocodedFields = Pick<
  AddressInput,
  "address_line" | "ward" | "district" | "province"
>;

