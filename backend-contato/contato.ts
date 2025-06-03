import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3333;
const secretKey = "6Lcx3lQrAAAAAJjrkgX3MRoZxAPEhGWlRrTJlvQ4";

app.use(cors());
app.use(bodyParser.json());

app.post("/api/contato", async (req, res) => {
  const { nome, email, whatsapp, mensagem, "g-recaptcha-response": token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token do reCAPTCHA ausente." });
  }

  try {
    const verifyRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );
    const verification = await verifyRes.json();

    if (!verification.success) {
      return res.status(403).json({ success: false, message: "Falha na verificação do reCAPTCHA." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "contato@contabnacional.com",
        pass: process.env.EMAIL_PASS || "SENHA_DO_EMAIL"
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || "contato@contabnacional.com",
      to: process.env.EMAIL_USER || "contato@contabnacional.com",
      subject: `Novo contato de ${nome}`,
      text: `Nome: ${nome}
Email: ${email}
WhatsApp: ${whatsapp}

Mensagem:
${mensagem}`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!" });

  } catch (err) {
    console.error("Erro no envio:", err);
    return res.status(500).json({ success: false, message: "Erro ao processar o envio." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
