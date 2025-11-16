// Database seeding script to populate MongoDB with sample data
import {connectDB, getDB} from "../src/config/mongo.js";
import {cosmetics, users} from "../data/sampleData.js";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();
    const db = getDB();

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("🧹 Clearing existing data...");
    await db.collection("products").deleteMany({});
    await db.collection("users").deleteMany({});

    // Seed products
    console.log("📦 Seeding products...");
    const productsToInsert = cosmetics.map((product) => ({
      ...product,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const productResult = await db
      .collection("products")
      .insertMany(productsToInsert);
    console.log(`✅ Inserted ${productResult.insertedCount} products`);

    // Seed users (hash passwords)
    console.log("👥 Seeding users...");
    const usersToInsert = [];

    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      usersToInsert.push({
        ...user,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    const userResult = await db.collection("users").insertMany(usersToInsert);
    console.log(`✅ Inserted ${userResult.insertedCount} users`);

    // Create some sample orders
    console.log("🛒 Creating sample orders...");
    const sampleOrders = [
      {
        userId: userResult.insertedIds[1], // Use the second user (khoinguyen)
        listProduct: [
          {
            productId: productResult.insertedIds[0],
            name: cosmetics[0].name,
            size: cosmetics[0].size[0],
            quantity: 2,
            price: cosmetics[0].price,
            totalPrice: cosmetics[0].price * 2,
          },
        ],
        city: "Ho Chi Minh City",
        country: "Vietnam",
        email: "dangkhoinguyen1501@gmail.com",
        firstName: "Khoi",
        lastName: "Nguyen",
        phoneNumber: "0123456789",
        paymentMethod: "credit_card",
        streetAddress: "123 Main Street",
        totalPriceOrder: cosmetics[0].price * 2,
        note: "Sample order 1",
        coupon: "",
        createAt: new Date(),
        _destroy: false,
        isPayment: true,
        status: "completed",
      },
      {
        userId: userResult.insertedIds[1],
        listProduct: [
          {
            productId: productResult.insertedIds[1],
            name: cosmetics[1].name,
            size: cosmetics[1].size[0],
            quantity: 1,
            price: cosmetics[1].price,
            totalPrice: cosmetics[1].price,
          },
          {
            productId: productResult.insertedIds[2],
            name: cosmetics[2].name,
            size: cosmetics[2].size[0],
            quantity: 1,
            price: cosmetics[2].price,
            totalPrice: cosmetics[2].price,
          },
        ],
        city: "Hanoi",
        country: "Vietnam",
        email: "dangkhoinguyen1501@gmail.com",
        firstName: "Khoi",
        lastName: "Nguyen",
        phoneNumber: "0123456789",
        paymentMethod: "paypal",
        streetAddress: "456 Second Street",
        totalPriceOrder: cosmetics[1].price + cosmetics[2].price,
        note: "Sample order 2",
        coupon: "",
        createAt: new Date(Date.now() - 86400000), // 1 day ago
        _destroy: false,
        isPayment: true,
        status: "processing",
      },
      {
        userId: userResult.insertedIds[1],
        listProduct: [
          {
            productId: productResult.insertedIds[3],
            name: cosmetics[3].name,
            size: cosmetics[3].size[0],
            quantity: 3,
            price: cosmetics[3].price,
            totalPrice: cosmetics[3].price * 3,
          },
        ],
        city: "Da Nang",
        country: "Vietnam",
        email: "dangkhoinguyen1501@gmail.com",
        firstName: "Khoi",
        lastName: "Nguyen",
        phoneNumber: "0123456789",
        paymentMethod: "bank_transfer",
        streetAddress: "789 Third Avenue",
        totalPriceOrder: cosmetics[3].price * 3,
        note: "Sample order 3",
        coupon: "",
        createAt: new Date(Date.now() - 172800000), // 2 days ago
        _destroy: false,
        isPayment: false,
        status: "pending",
      },
    ];

    const orderResult = await db.collection("orders").insertMany(sampleOrders);
    console.log(`✅ Inserted ${orderResult.insertedCount} orders`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📊 Summary:
- Products: ${productResult.insertedCount}
- Users: ${userResult.insertedCount}
- Orders: ${orderResult.insertedCount}
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
