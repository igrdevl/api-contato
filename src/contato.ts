import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/contato", async (req, res) => {
  const { nome, email, whatsapp, mensagem } = req.body;
  const recaptcha = req.body["g-recaptcha-response"];

  if (!recaptcha) {
    return res.status(400).json({ success: false, message: "reCAPTCHA ausente" });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY || "6Lcx3lQrAAAAAJjrkgX3MRoZxAPEhGWlRrTJlvQ4";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptcha}`;

  const response = await fetch(verifyUrl, { method: "POST" });
  const data = await response.json();

  if (!data.success) {
    return res.status(403).json({ success: false, message: "Falha na verificação do reCAPTCHA" });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_FROM || "seuemail@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "suasenha"
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "seuemail@gmail.com",
      to: process.env.EMAIL_TO || "destinatario@gmail.com",
      subject: "Nova mensagem do formulário de contato",
      html: `
        <h3>Nova mensagem de contato</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Mensagem:</strong> ${mensagem}</p>
      `
    });

    return res.status(200).json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao enviar email." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});