const GenericDao = require("./generic_dao");
const Product = require("../models/product");
const pool = require("../config/db");

class ProductDao extends GenericDao {
  constructor() {
    super("products", Product);
  }

  // Danh mục hợp lệ (thống nhất với Service)
  VALID_CATEGORIES = ["Thức ăn", "Đồ uống", "Tráng miệng", "Khác", "Combo"];

  /**
   * 🔄 Cập nhật trạng thái còn bán / ngừng bán
   * @param {number} productId
   * @param {boolean} isAvailable
   */
  async updateAvailability(productId, isAvailable) {
    if (typeof isAvailable !== "boolean") {
      throw new Error("isAvailable phải là boolean");
    }

    const query = `
      UPDATE products
      SET is_available = $1,
          updated_at = NOW()
      WHERE product_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [isAvailable, productId]);
    return result.rows[0];
  }

  /**
   * 🏷️ Cập nhật danh mục sản phẩm
   * @param {number} productId
   * @param {string} category
   */
  async updateCategory(productId, category) {
    if (!this.VALID_CATEGORIES.includes(category)) {
      throw new Error(
        `Danh mục không hợp lệ. Chỉ chấp nhận: ${this.VALID_CATEGORIES.join(", ")}`
      );
    }

    const query = `
      UPDATE products
      SET category = $1,
          updated_at = NOW()
      WHERE product_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [category, productId]);
    return result.rows[0];
  }

  /**
   * ⏱️ Cập nhật thời gian chuẩn bị (prep_minutes)
   * @param {number} productId
   * @param {number} prepMinutes
   */
  async updatePrepMinutes(productId, prepMinutes) {
    if (!Number.isInteger(prepMinutes) || prepMinutes < 0) {
      throw new Error("prep_minutes phải là số nguyên không âm");
    }

    const query = `
      UPDATE products
      SET prep_minutes = $1,
          updated_at = NOW()
      WHERE product_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [prepMinutes, productId]);
    return result.rows[0];
  }

  /**
   * 🏪 Lấy toàn bộ sản phẩm thuộc 1 shop
   * @param {number} shopId
   */
  async getProductsByShop(shopId) {
    const query = `
      SELECT * FROM products
      WHERE shop_id = $1
      ORDER BY updated_at DESC;
    `;
    const result = await pool.query(query, [shopId]);
    return result.rows;
  }

  /**
   * 🍱 Lọc sản phẩm theo danh mục
   * @param {string} category
   * @param {number} limit
   * @param {number} offset
   */
  async getProductsByCategory(category, limit = 20, offset = 0) {
    if (!this.VALID_CATEGORIES.includes(category)) {
      throw new Error(
        `Danh mục không hợp lệ. Chỉ chấp nhận: ${this.VALID_CATEGORIES.join(", ")}`
      );
    }

    const query = `
      SELECT * FROM products
      WHERE category = $1
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [category, limit, offset]);
    return result.rows;
  }

  /**
   * 🔍 Tìm kiếm sản phẩm theo tên
   * @param {string} keyword
   * @param {number} limit
   * @param {number} offset
   */
  async searchProducts(keyword, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM products
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY updated_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [`%${keyword}%`, limit, offset]);
    return result.rows;
  }

  /**
   * 📦 Lấy danh sách sản phẩm đang bán
   */
  async getAvailableProducts() {
    const query = `
      SELECT * FROM products
      WHERE is_available = TRUE
      ORDER BY updated_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * 📂 Lấy danh mục sản phẩm (tối đa 4 loại)
   */
  async getAllCategories() {
    try {
      const query = `
        SELECT DISTINCT category
        FROM products
        WHERE category IS NOT NULL
        ORDER BY category
        LIMIT 4;
      `;
      const result = await pool.query(query);
      return result.rows.map((row) => ({ name: row.category }));
    } catch (err) {
      console.error("❌ [DAO] Lỗi khi truy vấn danh mục:", err.message);
      throw err;
    }
  }
}

module.exports = new ProductDao();
