const seededData = [
  {
    id: "ab1efe30-4fb5-4431-89cd-907c4b028234",
    price: 3699999,
    name: "Durango SXT RWD"
  },
  {
    id: "674236b1-14fd-4ac3-9cc0-450ef47ddc56",
    price: 3299999,
    name: "Charger SXT RWD"
  },
  {
    id: "98281c38-bd98-443b-910a-6d1b61375897",
    price: 3199999,
    name: "Pacifica Touring"
  },
  {
    id: "63f045c7-284f-4dda-a9ca-47126333e6f5",
    price: 2899999,
    name: "300 Touring"
  },
  {
    id: "077a1d94-d80e-488c-8000-9651b670af09",
    price: 2499999,
    name: "Dodge Hornet GT Plus"
  },
  {
    id: "37754219-c17b-42ba-89ad-c80cf37cc8e6",
    price: 1599999,
    name: "Rolex Cellini Moonphase"
  },
  {
    id: "d6a002b1-2938-4131-826e-d57f7c7e1c9f",
    price: 1499999,
    name: "MotoGP CI.H1"
  },
  {
    id: "377559b1-2824-421e-9ce2-f548954633c1",
    price: 1399999,
    name: "Rolex Submariner Watch"
  },
  {
    id: "07a3f168-13a2-42cd-b455-806225da33eb",
    price: 1299999,
    name: "Rolex Cellini Moonphase"
  },
  {
    id: "56e70581-09d8-4843-abe0-84cbc0e70cbe",
    price: 1099999,
    name: "Rolex Datejust"
  },
  {
    id: "27a3cd9b-3409-4ab3-b142-0c892ecd7c8b",
    price: 1099999,
    name: "Rolex Datejust Women"
  },
  {
    id: "b792847a-a365-41bc-b5ca-89d8b322e784",
    price: 899999,
    name: "Rolex Cellini Date Black Dial"
  },
  {
    id: "a6a5dd45-d114-46af-b7ba-0089329eba3e",
    price: 899999,
    name: "Kawasaki Z800"
  },
  {
    id: "890201b3-8e7c-4bc6-bceb-add302c62a97",
    price: 749999,
    name: "Sportbike Motorcycle"
  },
  {
    id: "90341d27-5599-49bf-972b-1a582fed24fb",
    price: 499999,
    name: "IWC Ingenieur Automatic Steel"
  },
  {
    id: "212624f3-c4dc-4085-b73f-cbda0e3b6351",
    price: 399999,
    name: "Generic Motorcycle"
  },
  {
    id: "e97f7f3f-d2c8-42d5-a3c0-c3e8f76c5171",
    price: 299999,
    name: "Scooter Motorcycle"
  },
  {
    id: "e60a4b50-356c-44d1-bb40-fdce224fffbd",
    price: 249999,
    name: "Annibale Colombo Sofa"
  },
  {
    id: "a5f06862-9a3e-4a0c-a3b5-46f0a7531024",
    price: 199999,
    name: "Apple MacBook Pro 14 Inch Space Grey"
  },
  {
    id: "aa04f54c-8112-4c4b-b03b-af78cc8d35f7",
    price: 189999,
    name: "Annibale Colombo Bed"
  },
  {
    id: "eb1adf45-eb18-4f5a-a6fd-b40b6a939086",
    price: 179999,
    name: "Asus Zenbook Pro Dual Screen Laptop"
  },
  {
    id: "8499fde0-3424-4d91-b253-48c43700e345",
    price: 149999,
    name: "New DELL XPS 13 9300 Laptop"
  },
  {
    id: "9b7b6a79-2761-453e-ae3b-eb1bab9216fc",
    price: 149999,
    name: "Longines Master Collection"
  },
  {
    id: "ac46f0d8-1188-45d9-95a8-af76540d934a",
    price: 139999,
    name: "Huawei Matebook X Pro"
  },
  {
    id: "3bb10392-8144-46f1-9f7f-26c121e81b31",
    price: 109999,
    name: "Lenovo Yoga 920"
  },
  {
    id: "a3bd9641-6f61-40c1-8d83-ecf7b686ce2f",
    price: 109999,
    name: "iPhone 13 Pro"
  },
  {
    id: "f72d0301-d210-42d8-a183-a64fc7655d28",
    price: 89999,
    name: "iPhone X"
  },
  {
    id: "4b3a7d01-1c19-4ef2-822c-9c79c6904d51",
    price: 79999,
    name: "Wooden Bathroom Sink With Mirror"
  },
  {
    id: "66920bec-8538-448e-8b56-9a972202e219",
    price: 79999,
    name: "Watch Gold for Women"
  },
  {
    id: "f9cae0d5-bd12-44d2-9497-60024f0397e7",
    price: 69999,
    name: "Samsung Galaxy S10"
  },
  {
    id: "6db31eda-0abc-4d7a-bc4e-caf0ce14b8de",
    price: 59999,
    name: "Samsung Galaxy Tab S8 Plus Grey"
  },
  {
    id: "fff812d3-ca97-4648-b468-711b6ad09be4",
    price: 59999,
    name: "Prada Women Bag"
  },
  {
    id: "1733edeb-0069-47e0-80ed-dd9db886486e",
    price: 54999,
    name: "Apple AirPods Max Silver"
  },
  {
    id: "ec9b36a0-47d8-4b03-8a3e-51e644e94a3b",
    price: 49999,
    name: "Knoll Saarinen Executive Conference Chair"
  },
  {
    id: "872b8107-4d75-4d06-9a5a-f8f21a9cebc9",
    price: 49999,
    name: "TV Studio Camera Pedestal"
  },
  {
    id: "d1e902a7-ef22-4158-8c61-749b5a09829d",
    price: 49999,
    name: "Samsung Galaxy S8"
  },
  {
    id: "ac69620c-608f-4400-af48-0dbd443c9760",
    price: 49999,
    name: "Vivo X21"
  },
  {
    id: "408b4460-4af2-4339-bde2-cadbc3b1d54e",
    price: 49999,
    name: "iPad Mini 2021 Starlight"
  },
  {
    id: "89642c0a-1b71-4fc9-903f-6e3aee1740f4",
    price: 39999,
    name: "Oppo F19 Pro Plus"
  },
  {
    id: "37111d07-c934-4e3a-aac9-02166bf67c90",
    price: 34999,
    name: "Apple Watch Series 4 Gold"
  },
  {
    id: "502d6785-2c73-4d6c-867f-9da3285798c4",
    price: 34999,
    name: "Realme XT"
  },
  {
    id: "ffde8b31-ace3-45c4-b2b0-f9817f00dd95",
    price: 34999,
    name: "Samsung Galaxy Tab White"
  },
  {
    id: "cdce93d4-3f51-44c5-98b5-f3d25c36b2bc",
    price: 29999,
    name: "Bedside Table African Cherry"
  },
  {
    id: "e88fdea6-259a-4f00-9517-76aa518905a6",
    price: 29999,
    name: "iPhone 6"
  },
  {
    id: "b4522a2e-9dee-4dc4-a55b-d07cb3f1dd58",
    price: 29999,
    name: "Oppo K1"
  },
  {
    id: "677184e0-93b2-4a9d-959d-af562826c413",
    price: 29999,
    name: "Realme X"
  },
  {
    id: "ce91ccff-0567-4ace-a180-f65176b9de11",
    price: 29999,
    name: "Samsung Galaxy S7"
  },
  {
    id: "b7b213fa-247f-41a8-aa34-862da2d9745c",
    price: 29999,
    name: "Vivo V9"
  },
  {
    id: "88b921f6-7f06-480a-8545-e9c41ca9b704",
    price: 24999,
    name: "Oppo A57"
  },
  {
    id: "400e6627-de17-43a3-a11f-69af2fa8834c",
    price: 24999,
    name: "Vivo S1"
  }
];

export { seededData };
