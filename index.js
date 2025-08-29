require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const morgan = require("morgan");
app.use(morgan("dev"));

//Swagger Setup
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "BFHL API", version: "1.0.0" },
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const isIntegerString = (val) => typeof val === "string" && /^-?\d+$/.test(val);
const isIntegerNumber = (val) => typeof val === "number" && Number.isInteger(val);
const isAlphaString = (val) => typeof val === "string" && /^[a-zA-Z]+$/.test(val);
const lettersInString = (val) =>
  (typeof val === "string" ? val : String(val)).match(/[a-zA-Z]/g) || [];

const slugify = (s) =>
  String(s || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

const getUserId = () => {
  const fullName = slugify(process.env.FULL_NAME || "john_doe");
  const dob = String(process.env.DOB_DDMMYYYY || "01011990").replace(/[^0-9]/g, "");
  return `${fullName}_${dob}`;
};

app.get("/", (req, res) => {
  res.send("BFHL API is running ✅");
});

/**
 * @openapi
 * /bfhl:
 *   post:
 *     summary: Process array data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Successful response
 */

app.post("/bfhl", (req, res) => {
  try {
    const input = req.body?.data;
    if (!req.body || !Array.isArray(input)) {
    return res.status(400).json({
        is_success: false,
        error: "Invalid request. Expected JSON with 'data' as an array."
    });
}

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    const alphaCharsRaw = [];
    let sum = 0;

    for (const item of input) {
      const chars = lettersInString(item);
      if (chars.length) alphaCharsRaw.push(...chars);

      if (isIntegerString(item) || isIntegerNumber(item)) {
        const n = parseInt(item, 10);
        (n % 2 === 0 ? even_numbers : odd_numbers).push(String(n));
        sum += n;
      } else if (isAlphaString(item)) {
        alphabets.push(String(item).toUpperCase());
      } else {
        special_characters.push(String(item));
      }
    }

    const concat_string = alphaCharsRaw
      .reverse()
      .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
      .join("");

    return res.status(200).json({
      is_success: true,
      user_id: getUserId(),
      email: process.env.EMAIL || "john@xyz.com",
      roll_number: process.env.ROLL_NUMBER || "ABCD123",
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string,
    });
  } catch (err) {
    return res.status(500).json({ is_success: false, error: err?.message || "Internal Server Error" });
  }
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => console.log(`BFHL API running on http://localhost:${port}`));
}

module.exports = app;