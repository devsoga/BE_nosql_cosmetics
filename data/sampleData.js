// Sample data for cosmetics e-commerce website (English translations)
import dotenv from "dotenv";
dotenv.config();

const BASE_URL =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}/static`;

export const cosmetics = [
  {
    name: "La Roche-Posay Toleriane Ultra Moisturizer",
    price: 450000,
    description:
      "A deep moisturizing cream for sensitive skin, fragrance-free and paraben-free. Helps restore and protect the skin barrier.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd1.1.jpg`,
    ],
    category: "Skincare",
    brand: "La Roche-Posay",
    size: ["50ml", "100ml"],
    color: [],
    stock: 50,
    _destroy: false,
  },
  {
    name: "The Ordinary Vitamin C Ascorbic Acid 8% Serum",
    price: 280000,
    description:
      "A pure vitamin C serum that brightens the skin, reduces dark spots and helps fight signs of aging.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum1.1.jpg`,
    ],
    category: "Serums & Essences",
    brand: "The Ordinary",
    size: ["30ml"],
    color: [],
    stock: 30,
    _destroy: false,
  },
  {
    name: "Dior Rouge 999 Matte Lipstick",
    price: 1200000,
    description:
      "A luxury matte lipstick with a long-wearing formula and the classic Rouge 999 red shade.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm1.1.jpg`,
    ],
    category: "Lip Makeup",
    brand: "Dior",
    size: ["3.5g"],
    color: ["999 - Classic Red", "520 - Rose Red", "100 - Bright Red"],
    stock: 25,
    _destroy: false,
  },
  {
    name: "Anessa Perfect UV Sunscreen SPF50+",
    price: 620000,
    description:
      "Japanese sunscreen with Auto Booster technology; water and sweat resistant for reliable protection.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn1.1.jpg`,
    ],
    category: "Sunscreen",
    brand: "Anessa",
    size: ["60ml", "90ml"],
    color: [],
    stock: 40,
    _destroy: false,
  },
  {
    name: "Bioderma Sensibio H2O Micellar Water",
    price: 320000,
    description:
      "A gentle micellar cleanser for sensitive skin that removes makeup without drying.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt1.1.jpg`,
    ],
    category: "Makeup Remover",
    brand: "Bioderma",
    size: ["250ml", "500ml"],
    color: [],
    stock: 60,
    _destroy: false,
  },
  {
    name: "Laneige BB Cushion Pore Control",
    price: 880000,
    description:
      "An oil-control cushion foundation that provides coverage while minimizing the appearance of pores.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn1.1.jpg`,
    ],
    category: "Foundation",
    brand: "Laneige",
    size: ["15g"],
    color: ["No.13 - Ivory", "No.21 - Beige", "No.23 - Sand"],
    stock: 35,
    _destroy: false,
  },
  {
    name: "Chanel No.5 Eau De Parfum",
    price: 2800000,
    description:
      "The legendary women's perfume with a luxurious, long-lasting floral scent.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh1.1.jpg`,
    ],
    category: "Perfume",
    brand: "Chanel",
    size: ["50ml", "100ml"],
    color: [],
    stock: 15,
    _destroy: false,
  },
  {
    name: "SK-II Facial Treatment Mask",
    price: 1500000,
    description:
      "Premium sheet mask containing Pitera™ for deep hydration and instant radiance.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn1.1.jpg`,
    ],
    category: "Face Masks",
    brand: "SK-II",
    size: ["Box of 6 sheets", "Box of 10 sheets"],
    color: [],
    stock: 20,
    _destroy: false,
  },
  {
    name: "Urban Decay Naked3 Eyeshadow Palette",
    price: 1350000,
    description:
      "A 12-shade eyeshadow palette in pink-neutral tones with smooth, long-lasting pigments.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm1.1.jpg`,
    ],
    category: "Eye Makeup",
    brand: "Urban Decay",
    size: ["12-color palette"],
    color: ["Naked3 - Pink Tone"],
    stock: 18,
    _destroy: false,
  },
  {
    name: "CeraVe Foaming Facial Cleanser",
    price: 380000,
    description:
      "A gentle foaming cleanser with essential ceramides suitable for all skin types.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm1.1.jpg`,
    ],
    category: "Facial Cleansers",
    brand: "CeraVe",
    size: ["236ml", "473ml"],
    color: [],
    stock: 45,
    _destroy: false,
  },
  {
    name: "Paula's Choice BHA Liquid Exfoliant",
    price: 950000,
    description:
      "A chemical exfoliant with 2% BHA to deeply cleanse pores and help reduce breakouts.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner1.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner1.1.jpg`,
    ],
    category: "Toners & Essences",
    brand: "Paula's Choice",
    size: ["118ml"],
    color: [],
    stock: 28,
    _destroy: false,
  },
  {
    name: "Vichy Aqualia Thermal Rehydrating Light Cream",
    price: 650000,
    description:
      "A lightweight gel-cream moisturizer that provides deep hydration and keeps skin moisturized for up to 48 hours.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd2.1.jpg`,
    ],
    category: "Skincare",
    brand: "Vichy",
    size: ["50ml"],
    color: [],
    stock: 50,
    _destroy: false,
  },
  {
    name: "Kiehl's Clearly Corrective Dark Spot Solution",
    price: 2000000,
    description:
      "A brightening serum formulated with activated vitamin C to help reduce dark spots and even skin tone.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum2.1.jpg`,
    ],
    category: "Serums & Essences",
    brand: "Kiehl's",
    size: ["30ml"],
    color: [],
    stock: 30,
    _destroy: false,
  },
  {
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
    price: 250000,
    description:
      "A long-wearing liquid matte lipstick that lasts up to 16 hours with intense color payoff.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm2.1.jpg`,
    ],
    category: "Lip Makeup",
    brand: "Maybelline",
    size: ["5ml"],
    color: [
      "20 Pioneer - Classic Red",
      "15 Lover - Dusty Rose",
      "50 Voyager - Deep Wine Red",
    ],
    stock: 25,
    _destroy: false,
  },
  {
    name: "Biore UV Aqua Rich Watery Essence SPF50+",
    price: 190000,
    description:
      "A lightweight watery sunscreen with Micro Defense technology, SPF50+ PA++++ for effective protection without stickiness.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn2.1.jpg`,
    ],
    category: "Sunscreen",
    brand: "Biore",
    size: ["50g"],
    color: [],
    stock: 40,
    _destroy: false,
  },
  {
    name: "Garnier Micellar Cleansing Water (Sensitive Skin)",
    price: 170000,
    description:
      "Gentle micellar cleansing water without fragrance, suitable for sensitive skin and effective at removing makeup.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt2.1.jpg`,
    ],
    category: "Makeup Remover",
    brand: "Garnier",
    size: ["400ml"],
    color: [],
    stock: 60,
    _destroy: false,
  },
  {
    name: "Innisfree No-Sebum Powder Cushion SPF29/PA++",
    price: 430000,
    description:
      "An oil-control cushion foundation with a smooth, matte finish and long-lasting wear.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn2.1.jpg`,
    ],
    category: "Foundation",
    brand: "Innisfree",
    size: ["14g"],
    color: [
      "21N Vanilla - Light",
      "21C Rose Vanilla - Light Warm",
      "23N Ginger - Medium",
    ],
    stock: 35,
    _destroy: false,
  },
  {
    name: "Gucci Bloom Eau De Parfum",
    price: 2800000,
    description:
      "A floral, sophisticated fragrance with notes of jasmine, tuberose and rangoon creeper.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh2.1.jpg`,
    ],
    category: "Perfume",
    brand: "Gucci",
    size: ["50ml", "100ml"],
    color: [],
    stock: 15,
    _destroy: false,
  },
  {
    name: "Hada Labo Gokujyun Hyaluron Mask",
    price: 150000,
    description:
      "A deeply hydrating sheet mask with multiple hyaluronic acids to replenish moisture and improve elasticity.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn2.1.jpg`,
    ],
    category: "Face Masks",
    brand: "Hada Labo",
    size: ["Pack of 7 sheets"],
    color: [],
    stock: 20,
    _destroy: false,
  },
  {
    name: "Maybelline Lash Sensational Mascara",
    price: 250000,
    description:
      "Mascara that lifts, lengthens and defines lashes with a clump-free finish.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm2.1.jpg`,
    ],
    category: "Eye Makeup",
    brand: "Maybelline",
    size: ["9.5ml"],
    color: ["Black", "Brown"],
    stock: 55,
    _destroy: false,
  },
  {
    name: "Simple Kind To Skin Refreshing Facial Wash",
    price: 130000,
    description:
      "A soap-free, fragrance-free gel cleanser that removes dirt and oil while maintaining skin hydration.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm2.1.jpg`,
    ],
    category: "Facial Cleansers",
    brand: "Simple",
    size: ["150ml"],
    color: [],
    stock: 45,
    _destroy: false,
  },
  {
    name: "Some By Mi AHA-BHA-PHA 30 Days Miracle Toner",
    price: 320000,
    description:
      "An exfoliating toner with AHA, BHA and PHA combined with tea tree and niacinamide to help reduce blemishes and refine texture.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner2.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner2.1.jpg`,
    ],
    category: "Toners & Essences",
    brand: "Some By Mi",
    size: ["150ml"],
    color: [],
    stock: 28,
    _destroy: false,
  },
  {
    name: "Neutrogena Hydro Boost Water Gel",
    price: 350000,
    description:
      "A lightweight gel moisturizer with hyaluronic acid that provides continuous hydration without greasiness.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Skincare/csd3.1.jpg`,
    ],
    category: "Skincare",
    brand: "Neutrogena",
    size: ["50g"],
    color: [],
    stock: 40,
    _destroy: false,
  },
  {
    name: "COSRX Advanced Snail 96 Mucin Power Essence",
    price: 420000,
    description:
      "An essence containing 96% snail mucin to hydrate, repair and improve skin elasticity.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Serums/serum3.1.jpg`,
    ],
    category: "Serums & Essences",
    brand: "COSRX",
    size: ["100ml"],
    color: [],
    stock: 30,
    _destroy: false,
  },
  {
    name: "3CE Velvet Lip Tint - Daffodil",
    price: 330000,
    description:
      "A velvety liquid lip tint with smooth texture and long-lasting color; Daffodil is an earthy red shade.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/LipMakeup/tdm3.1.jpg`,
    ],
    category: "Lip Makeup",
    brand: "3CE",
    size: ["4g"],
    color: ["Daffodil - Earthy Red"],
    stock: 35,
    _destroy: false,
  },
  {
    name: "La Roche-Posay Anthelios Dry Touch Finish SPF50+",
    price: 550000,
    description:
      "An oil-control sunscreen with SPF50+ that provides strong protection and a dry, non-greasy finish.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Sunscreen/kcn3.1.jpg`,
    ],
    category: "Sunscreen",
    brand: "La Roche-Posay",
    size: ["50ml"],
    color: [],
    stock: 40,
    _destroy: false,
  },
  {
    name: "DHC Deep Cleansing Oil",
    price: 520000,
    description:
      "A popular cleansing oil with an olive oil base that dissolves waterproof makeup and impurities while moisturizing.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/MakeupRemover/tt3.1.jpg`,
    ],
    category: "Makeup Remover",
    brand: "DHC",
    size: ["200ml"],
    color: [],
    stock: 30,
    _destroy: false,
  },
  {
    name: "Maybelline Fit Me Matte Poreless Foundation SPF22",
    price: 185000,
    description:
      "A pore-minimizing foundation with a matte finish that provides natural coverage and controls oil.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Foundation/kn3.1.jpg`,
    ],
    category: "Foundation",
    brand: "Maybelline",
    size: ["30ml"],
    color: ["110 - Porcelain", "112 - Natural Ivory", "120 - Classic Ivory"],
    stock: 40,
    _destroy: false,
  },
  {
    name: "Lancôme La Vie Est Belle Eau De Parfum",
    price: 2950000,
    description:
      "A sweet and sophisticated women's fragrance with notes of fruit, iris and vanilla; long-lasting and ideal for special occasions.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Perfume/nh3.1.jpg`,
    ],
    category: "Perfume",
    brand: "Lancôme",
    size: ["50ml", "100ml"],
    color: [],
    stock: 20,
    _destroy: false,
  },
  {
    name: "Laneige Water Sleeping Mask EX",
    price: 650000,
    description:
      "An overnight gel mask that deeply hydrates and revitalizes tired skin using Sleep-Tox™ technology.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FaceMasks/mn3.1.jpg`,
    ],
    category: "Face Masks",
    brand: "Laneige",
    size: ["70ml"],
    color: [],
    stock: 25,
    _destroy: false,
  },
  {
    name: "Etude House Play Color Eyes - Rose Wine",
    price: 350000,
    description:
      "A 10-color eyeshadow palette in rose wine tones combining matte and shimmer finishes for versatile looks.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/EyeMakeup/tdm3.1.jpg`,
    ],
    category: "Eye Makeup",
    brand: "Etude House",
    size: ["10-color palette"],
    color: ["Rose Wine - Rose Wine Tone"],
    stock: 18,
    _destroy: false,
  },
  {
    name: "COSRX Low pH Good Morning Gel Cleanser",
    price: 220000,
    description:
      "A low pH gel cleanser (4.5–5.5) that cleanses without stripping skin and contains tea tree extract to support acne-prone skin.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/FacialCleansers/srm3.1.jpg`,
    ],
    category: "Facial Cleansers",
    brand: "COSRX",
    size: ["150ml"],
    color: [],
    stock: 50,
    _destroy: false,
  },
  {
    name: "L'Oréal Paris Revitalift Crystal Micro Essence",
    price: 420000,
    description:
      "A micro-essence that softens, hydrates and refines skin texture while helping to minimize pores and improve skin smoothness.",
    image: [
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner3.jpg`,
      `${BASE_URL}/images/uploads/cosmetics/Toner/toner3.1.jpg`,
    ],
    category: "Toners & Essences",
    brand: "L'Oréal Paris",
    size: ["130ml"],
    color: [],
    stock: 35,
    _destroy: false,
  },
];

export const users = [
  {
    username: "admin",
    email: "admin@gmail.com",
    password: "123456",
    _destroy: false,
  },
  {
    username: "khoinguyen",
    email: "dangkhoinguyen1501@gmail.com",
    password: "123456",
    _destroy: false,
  },
];
