/** Unsplash photo slugs, grouped by what they actually depict. */
const u = (slug: string) => `https://images.unsplash.com/photo-${slug}`;

export const APARTMENT_PHOTOS = [
  "1502672260266-1c1ef2d93688",
  "1522708323590-d24dbb6b0267",
  "1560448204-e02f11c3d0e2",
  "1560185007-c5ca9d2c014d",
  "1493809842364-78817add7ffb",
  "1484154218962-a197022b5858",
  "1556911220-bff31c812dba",
  "1600607687939-ce8a6c25118c",
  "1600566753086-00f18fb6b3ea",
  "1554995207-c18c203602cb",
  "1505873242700-f289a29e1e0f",
  "1631049307264-da0ec9d70304",
  "1600210492486-724fe5c67fb0",
  "1536376072261-38c75010e6c9",
  "1615529182904-14819c35db37",
  "1600607687644-c7171b42498f",
  "1600047509807-ba8f99d2cdde",
  "1600573472550-8090b5e0745e",
  "1600121848594-d8644e57abab",
  "1600566753190-17f0baa2a6c3",
  "1502005097973-6a7082348e28",
  "1502672023488-70e25813eb80",
  "1493663284031-b7e3aefcae8e",
  "1522771739844-6a9f6d5f14af",
  "1600585152220-90363fe7e115",
].map(u);

export const HOUSE_PHOTOS = [
  "1600585154340-be6161a56a0c",
  "1600596542815-ffad4c1539a9",
  "1613490493576-7fde63acd811",
  "1568605114967-8130f3a36994",
  "1512917774080-9991f1c4c750",
  "1580587771525-78b9dba3b914",
  "1449844908441-8829872d2607",
  "1600047509807-ba8f99d2cdde",
  "1600573472550-8090b5e0745e",
  "1560184897-ae75f418493e",
  "1571055107559-3e67626fa8be",
  "1523217582562-09d0def993a6",
].map(u);

export const NEW_BUILDING_PHOTOS = [
  "1545324418-cc1a3fa10c00",
  "1541888946425-d81bb19240f5",
  "1486406146926-c627a92ad1ab",
].map(u);

export const COMMERCIAL_PHOTOS = [
  "1486406146926-c627a92ad1ab",
  "1497366216548-37526070297c",
  "1497366811353-6870744d04b2",
  "1524758631624-e2822e304c36",
  "1497215728101-856f4ea42174",
].map(u);

export const LAND_PHOTOS = ["1500382017468-9049fed747ef", "1470071459604-3b5ec3a7fe05"].map(u);

export const HOTEL_PHOTOS = [
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1520250497591-112f2f40a3f4",
  "1445019980597-93fa8acb246c",
  "1571003123894-1f0594d2b5d9",
  "1590490360182-c33d57733427",
  "1611892440504-42a792e24d32",
].map(u);

/** Wide landscape shot behind the home page hero. */
export const HERO_PHOTO = u("1500382017468-9049fed747ef");

/** Cars, keyed loosely by what the shot shows so brands stay believable. */
export const CAR_PHOTOS = {
  toyotaSedan: u("1621007947382-bb3c3994e3fb"),
  toyotaWhite: u("1619682817481-e994891cd1f5"),
  bmwWhite: u("1555215695-3004980ad54e"),
  bmwBlue: u("1502877338535-766e1452684a"),
  bmwGrey: u("1580273916550-e323be2ae537"),
  mercedesWhite: u("1590362891991-f776e747a588"),
  mercedesYellow: u("1605559424843-9e4c228bf1c2"),
  mercedesSilver: u("1618843479313-40f8afb4b4d8"),
  mercedesRed: u("1553440569-bcc63803a83d"),
  teslaWhite: u("1560958089-b8a1929cea89"),
  teslaBlack: u("1536700503339-1e4b06520771"),
  teslaRoadster: u("1617788138017-80ad40651399"),
  audiBlack: u("1606664515524-ed2f786a0bd6"),
  audiGrey: u("1606152421802-db97b9c7a11b"),
  crossoverNight: u("1609521263047-f8f205293f24"),
  suvWhite: u("1533473359331-0135ef1b58bf"),
  hatchBlue: u("1549317661-bd32c8ce0db2"),
  sedanRed: u("1550355291-bbee04a92027"),
  roadRear: u("1568605117036-5fe5e7bab0b7"),
  coupeBlue: u("1552519507-da3b142c6e3d"),
  coupeBlack: u("1494976388531-d1058494cdd8"),
  muscleBlack: u("1547744152-14d985cb937f"),
  darkSedan: u("1503376780353-7e6692767b70"),
  nightRed: u("1493238792000-8113da705763"),
} as const;

export const AVATARS = Array.from(
  { length: 12 },
  (_, i) => `https://i.pravatar.cc/160?img=${i * 5 + 3}`,
);
