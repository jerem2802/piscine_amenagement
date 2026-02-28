// api/contact.js — Vercel Serverless Function
// Envoi de mail via Gmail SMTP (Nodemailer)

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée.' });
  }

  const {
    form_type, nom, email, telephone,
    message, service, modele, superficie, budget
  } = req.body;

  // Validation
  if (!nom || !nom.trim()) {
    return res.status(422).json({ ok: false, error: 'Le nom est requis.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ ok: false, error: 'Une adresse e-mail valide est requise.' });
  }
  if (!message || !message.trim()) {
    return res.status(422).json({ ok: false, error: 'Le message est requis.' });
  }

  // Sujet selon le formulaire
  const subjects = {
    contact:  'Nouveau message de contact — Site Web',
    devis:    'Nouvelle demande de devis — Site Web',
    piscines: 'Demande de devis piscine coque — Site Web',
  };
  const subject = subjects[form_type] || 'Nouveau message — Site Web';

  // Corps du mail
  let body = `=== Nouveau message depuis le site web ===\n\n`;
  body += `Type : ${form_type || 'Non précisé'}\n\n`;
  body += `--- Coordonnées ---\n`;
  body += `Nom      : ${nom}\n`;
  body += `Email    : ${email}\n`;
  if (telephone) body += `Téléphone: ${telephone}\n`;
  if (service)   body += `\nService demandé : ${service}\n`;
  if (modele)    body += `Modèle piscine  : ${modele}\n`;
  if (superficie) body += `Superficie      : ${superficie}\n`;
  if (budget)    body += `Budget          : ${budget}\n`;
  body += `\n--- Message ---\n${message}\n`;
  body += `\n---\nDate : ${new Date().toLocaleString('fr-FR')}\n`;

  // Transporter Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from:     `"${nom}" <${process.env.GMAIL_USER}>`,
      replyTo:  email,
      to:       process.env.GMAIL_USER,
      subject,
      text:     body,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ ok: false, error: 'Erreur lors de l\'envoi. Contactez-nous directement.' });
  }
}
