import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SubmitButton from "@/components/shared/SubmitButton";
import BackArrow from "@/components/shared/BackArrow";
import OutlineBorder from "@/components/shared/OutlineBorder";
import InputFrame from "@/components/shared/InputFrame";
import BlackOutline from "@/components/shared/BlackOutline";
import { auth } from "@/firebase/firebaseConfig";
import MiniLogo from "@/components/shared/MiniLogo";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const LoginPhone = () => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Common styles
  const labelStyle = {
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    fontSize: "1.5rem",
    fontWeight: "700",
    wordWrap: "break-word",
  };

  const activeLabelStyle = {
    ...labelStyle,
    color: "#363A33", // Black for active
  };

  const inactiveLabelStyle = {
    ...labelStyle,
    color: "#868686", // Gray for inactive
  };

  const outlineStyle = {
    position: "absolute",
    top: "4vh",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1,
  };

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("✅ reCAPTCHA verified:", response);
          },
        }
      );
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
        console.log("✅ reCAPTCHA widget ID:", widgetId);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (phone.length !== 10) {
      setError("Vui lòng nhập đúng số điện thoại 10 chữ số");
      return;
    }

    try {
      // ✅ 1. Kiểm tra số điện thoại trong DB
      const formattedPhone = "+84" + phone.substring(1);

      const checkRes = await fetch(
        "http://localhost:5000/api/auth/check-phone",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        }
      );

      const checkData = await checkRes.json();

      // Nếu không tồn tại
      if (!checkData.success) {
        setError(checkData.message || "Số điện thoại này chưa được đăng ký.");
        return;
      }

      // ✅ 2. Nếu có trong DB, gửi OTP qua Firebase
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      window.confirmationResult = confirmationResult;

      // ✅ 3. Điều hướng sang trang nhập OTP
      navigate("/otp", { state: { phone: formattedPhone } });
    } catch (err) {
      console.error("❌ Lỗi gửi OTP:", err);
      setError("Không thể gửi OTP. Vui lòng thử lại.");
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Only allow digits
    value = value.replace(/\D/g, "");
    // Must start with 0
    if (value && !value.startsWith("0")) {
      value = "0" + value;
    }
    // Max 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setPhone(value);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#fff",
      }}
    >
      {/* Header Group */}
      <div
        style={{
          position: "absolute",
          top: "5vh",
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Back Arrow */}
        <div
          style={{
            position: "absolute",
            left: "5.85vw",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          <BackArrow />
        </div>

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <MiniLogo></MiniLogo>
        </div>
      </div>

      {/* Tab Labels Group */}
      <div
        style={{
          position: "absolute",
          top: "8.75vh",
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        {/* Phone Label */}
        <div
          style={{
            position: "absolute",
            left: "25%",
            transform: "translateX(-50%)",
          }}
        >
          <div style={activeLabelStyle}>Điện thoại</div>
          <div style={outlineStyle}>
            <BlackOutline width="120px" />
          </div>
        </div>

        {/* Email Label */}
        <div
          style={{
            position: "absolute",
            left: "75%",
            transform: "translateX(-50%)",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login/email")}
        >
          <div style={inactiveLabelStyle}>Email</div>
        </div>
      </div>

      {/* Outline Border */}
      <div
        style={{
          position: "absolute",
          top: "13vh",
        }}
      >
        <OutlineBorder />
      </div>

      <div id="recaptcha-container" style={{ display: "none" }}></div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "absolute",
          left: "50%",
          top: "15.875vh",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <InputFrame isFocused={isFocused} style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)"
        }}>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "1.5rem",
              fontWeight: "500",
              color: "#000000",
              backgroundColor: "transparent",
            }}
          />
        </InputFrame>
        {error && (
          <div
            style={{
              position: "absolute",
              top: "185px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "267px",
              color: "red",
            }}
          >
            {error}
          </div>
        )}
        <SubmitButton
          isValid={phone.length === 10}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "64.625vh"
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              fontSize: "1.5rem",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            Tiếp tục
          </div>
        </SubmitButton>
      </form>
    </div>
  );
};

export default LoginPhone;
