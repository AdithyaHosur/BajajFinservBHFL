const request = require("supertest");
const app = require("../index");

describe("POST /bfhl", () => {
  it("should return success with correct response", async () => {
    const res = await request(app)
      .post("/bfhl")
      .send({ data: ["a","1","2","$"] });

    expect(res.status).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.odd_numbers).toContain("1");
    expect(res.body.even_numbers).toContain("2");
  });
});
