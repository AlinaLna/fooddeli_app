const authService = require("../services/authService");
const userService = require("../services/userService");
const admin = require("../config/firebase");
const jwt = require("jsonwebtoken");

/**
 * 📱 Bước 1 - xác thực số điện thoại và mật khẩu (chưa tạo user)
 */
exports.verifyResPhone = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Vui lòng nhập đầy đủ số điện thoại và mật khẩu",
      });
    }

    // ✅ Gọi service để kiểm tra tồn tại
    const isPhoneTaken = await userService.getUserByPhone(phone);
    if (isPhoneTaken) {
      return res.status(400).json({
        success: false,
        message: "📱 Số điện thoại này đã tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Số điện thoại hợp lệ, tiếp tục đăng ký bước 2",
    });
  } catch (err) {
    console.error("❌ Lỗi verifyPhone:", err);
    res.status(500).json({
      success: false,
      message: "❌ Lỗi server khi xác thực số điện thoại",
    });
  }
};

/**
 * 🆕 Đăng ký tài khoản mới
 */
exports.register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "✅ Đăng ký tài khoản thành công",
      user: {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err.message);
    res.status(400).json({
      success: false,
      message: err.message || "Đăng ký thất bại",
    });
  }
};

/**
 * 🔑 Đăng nhập bằng số điện thoại
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Vui lòng nhập đầy đủ số điện thoại và mật khẩu",
      });
    }

    const user = await authService.login(phone, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "❌ Sai số điện thoại hoặc mật khẩu",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Đăng nhập thành công",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi server",
    });
  }
};

const generateJwt = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.verifyPhone = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const phoneNumber = decoded.phone_number;

    // ❌ Không tạo user mới nữa — chỉ tìm thôi
    const user = await userService.getUserByPhone(phoneNumber);
    if (!user) {
      return res.status(404).json({ error: "Tài khoản chưa tồn tại. Vui lòng đăng ký trước." });
    }

    const jwtToken = generateJwt(user);
    return res.status(200).json({ success: true, token: jwtToken, user });
  } catch (error) {
    console.error("❌ Lỗi xác thực token:", error);
    return res.status(401).json({ error: "Token không hợp lệ hoặc hết hạn" });
  }
};

/**
 * 🔴 Đăng xuất (xóa JWT nếu có)
 */
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "👋 Đăng xuất thành công",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi đăng xuất",
    });
  }
};
