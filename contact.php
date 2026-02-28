<?php
/**
 * contact.php — Traitement des formulaires
 * Piscines & Aménagement Bordeaux Médoc
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Seules les requêtes POST sont acceptées
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

// Destination
define('DEST_EMAIL', 'piscinesabm@gmail.com');
define('DEST_NAME',  'Piscines & Aménagement Bordeaux Médoc');

// ---- Fonctions utilitaires ----

function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function req(string $key): string {
    return isset($_POST[$key]) ? clean($_POST[$key]) : '';
}

// ---- Collecte des champs ----

$form_type = req('form_type'); // 'contact', 'devis', ou 'piscines'
$nom       = req('nom');
$telephone = req('telephone');
$email     = req('email');
$message   = req('message');

// Champs spécifiques devis / piscines
$service   = req('service');
$modele    = req('modele');
$superficie= req('superficie');
$budget    = req('budget');

// ---- Validation basique ----

$errors = [];

if (empty($nom))     $errors[] = 'Le nom est requis.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors[] = 'Une adresse e-mail valide est requise.';
if (empty($message)) $errors[] = 'Le message est requis.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => implode(' ', $errors)]);
    exit;
}

// ---- Construction du corps du mail ----

$subject_map = [
    'contact'  => 'Nouveau message de contact — Site Web',
    'devis'    => 'Nouvelle demande de devis — Site Web',
    'piscines' => 'Demande de devis piscine coque — Site Web',
];
$subject = $subject_map[$form_type] ?? 'Nouveau message — Site Web';

$body  = "=== Nouveau message depuis le site web ===\n\n";
$body .= "Type de formulaire : " . ($form_type ?: 'Non précisé') . "\n\n";
$body .= "--- Coordonnées ---\n";
$body .= "Nom      : $nom\n";
$body .= "Email    : $email\n";
if ($telephone) $body .= "Téléphone: $telephone\n";

if ($service)    $body .= "\nService demandé : $service\n";
if ($modele)     $body .= "Modèle piscine  : $modele\n";
if ($superficie) $body .= "Superficie      : $superficie\n";
if ($budget)     $body .= "Budget          : $budget\n";

$body .= "\n--- Message ---\n$message\n";
$body .= "\n---\nEnvoyé depuis : " . ($_SERVER['HTTP_REFERER'] ?? 'Site web') . "\n";
$body .= "Date : " . date('d/m/Y H:i') . "\n";

// ---- En-têtes mail ----

$headers  = "From: =?UTF-8?B?" . base64_encode($nom) . "?= <$email>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "To: =?UTF-8?B?" . base64_encode(DEST_NAME) . "?= <" . DEST_EMAIL . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// ---- Envoi ----

$sent = mail(DEST_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erreur lors de l\'envoi. Veuillez nous contacter directement.']);
}
