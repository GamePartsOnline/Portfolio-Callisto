# Guide Complet de Sécurisation des Sites Internet

> **Projet Portfolio Callisto Arts** : le découpage *applicable* à ce dépôt (statique + option Rails) est dans **[SECURITY.md](./SECURITY.md)**. Ce fichier reste la **référence générale** (exemples Nginx, PHP, OWASP, checklist complète).

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Couche 1 : Chiffrement et Identité](#couche-1--chiffrement-et-identité)
3. [Couche 2 : Protection contre les attaques courantes](#couche-2--protection-contre-les-attaques-courantes)
4. [Couche 3 : Sécurisation de l'infrastructure](#couche-3--sécurisation-de-linfrastructure)
5. [Couche 4 : En-têtes de sécurité HTTP](#couche-4--en-têtes-de-sécurité-http)
6. [Couche 5 : Authentification et gestion des accès](#couche-5--authentification-et-gestion-des-accès)
7. [Couche 6 : Monitoring et détection](#couche-6--monitoring-et-détection)
8. [Normes et Standards de conformité](#normes-et-standards-de-conformité)
9. [Checklist de sécurité](#checklist-de-sécurité)
10. [Ressources et références](#ressources-et-références)

---

## Introduction

Sécuriser un site internet est aujourd'hui une **nécessité absolue**, autant pour protéger vos données que pour instaurer un climat de confiance avec vos utilisateurs. Les attaques informatiques coûtent en moyenne **4,29 millions de dollars** par incident (Source : IBM Security Report 2023). 

Cette documentation couvre les **6 couches stratégiques** essentielles pour blindé votre plateforme, en alignement avec les normes internationales (OWASP, NIST, ISO 27001).

---

## Couche 1 : Chiffrement et Identité

C'est le **premier rempart**, celui qui protège les données durant leur voyage entre l'utilisateur et votre serveur.

### 1.1 Certificat SSL/TLS (HTTPS)

**🔒 Indispensable et obligatoire**

- **Objectif** : Chiffrer les échanges de données et éviter que les données (mots de passe, cartes bancaires) ne soient lues en clair
- **Norme associée** : [TLS 1.2+](https://tools.ietf.org/html/rfc5246) (TLS 1.3 recommandé depuis 2018)
- **Implémentation** :
  - Obtenir un certificat auprès d'une autorité de certification (Let's Encrypt gratuit, Digicert, Sectigo, etc.)
  - Configurer HTTPS sur tous les domaines (y compris sous-domaines)
  - Rediriger automatiquement HTTP → HTTPS
  - Utiliser des certificats SAN (Subject Alternative Name) ou wildcard si nécessaire

```nginx
# Exemple configuration Nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

**Grade A sur SSL Labs** : https://www.ssllabs.com/ssltest/

### 1.2 Hachage des mots de passe

**⚠️ N'JAMAIS stocker les mots de passe en texte brut**

| Algorithme | Recommandation | Temps d'exécution | Use case |
|---|---|---|---|
| **Argon2id** | ⭐ Meilleur choix | 40-100ms | Tout site moderne |
| **BCrypt** | ⭐ Bon | 200-400ms | Authentification utilisateurs |
| **Scrypt** | ⭐ Acceptable | 100-200ms | Legacy systems |
| **PBKDF2** | ⚠️ Passable | 10-50ms | Non-critique |
| **MD5/SHA1** | ❌ DANGER | Instantané | À éviter absolument |

**Implémentation en PHP (Argon2) :**
```php
<?php
// Hachage du mot de passe
$password = "user_password_123";
$hash = password_hash($password, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,  // 64MB
    'time_cost' => 4,
    'threads' => 3
]);

// Vérification
if (password_verify($password, $hash)) {
    echo "Mot de passe correct";
} else {
    echo "Mot de passe incorrect";
}

// Rehash si nécessaire
if (password_needs_rehash($hash, PASSWORD_ARGON2ID)) {
    $hash = password_hash($password, PASSWORD_ARGON2ID);
}
?>
```

**Implémentation en Node.js (bcrypt) :**
```javascript
const bcrypt = require('bcrypt');

// Hachage
const password = 'user_password_123';
const saltRounds = 12; // Plus élevé = plus sûr mais plus lent
const hash = await bcrypt.hash(password, saltRounds);

// Vérification
const match = await bcrypt.compare(password, hash);
```

### 1.3 Double authentification (2FA)

**Vital pour l'administration du site**

Même si un pirate vole votre mot de passe, il ne pourra pas entrer sans le second facteur.

**Types de 2FA :**

1. **OTP (One-Time Password) via application** - ⭐ Recommandé
   - Google Authenticator, Microsoft Authenticator, Authy
   - Standard TOTP (Time-based One-Time Password) - RFC 6238
   - Codes de 6 chiffres valides 30 secondes

2. **SMS/SMS OTP** - ⚠️ Risqué
   - Vulnerable à l'usurpation SIM (SIM swapping)
   - À utiliser en dernier recours
   - Moins sécurisé que les applications

3. **Clés de sécurité physiques** - ⭐ Ultra sécurisé
   - YubiKey, Titan Key, Nitrokey
   - Protocole WebAuthn/FIDO2
   - Immune aux phishing

4. **Codes de sauvegarde** - ⭐ Indispensable
   - À générer et stocker de manière sécurisée
   - À fournir lors de la première activation

**Implémentation PHP avec TOTP :**
```php
<?php
use OTPHP\TOTP;

// Génération de la clé secrète
$totp = TOTP::create();
$secret = $totp->getSecret(); // À stocker en base de données

// QR Code pour l'utilisateur
$qrCode = $totp->getQrCode(/* parametres optionnels */);

// Vérification du code
$codeUtilisateur = '123456';
if ($totp->verify($codeUtilisateur)) {
    echo "Code valide";
} else {
    echo "Code invalide";
}
?>
```

---

## Couche 2 : Protection contre les attaques courantes

### 2.1 Injections SQL

**Norme associée** : [OWASP A03:2021 – Injection](https://owasp.org/Top10/A03_2021-Injection/)

**Le problème :**
```php
// ❌ DANGER - Requête vulnérable
$username = $_POST['username'];
$query = "SELECT * FROM users WHERE username = '" . $username . "'";
$result = mysqli_query($connection, $query);

// Attaque : username = ' OR '1'='1
// Requête générée : SELECT * FROM users WHERE username = '' OR '1'='1'
```

**✅ La solution : Requêtes préparées**

**PHP avec PDO :**
```php
<?php
// Bonne pratique - Requête préparée
$pdo = new PDO('mysql:host=localhost;dbname=mydb', 'user', 'pass');

$username = $_POST['username'];
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$result = $stmt->fetchAll();

// Ou avec named parameters
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
$stmt->execute([':username' => $username]);
?>
```

**Node.js avec mysql2/promise :**
```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'pass',
  database: 'mydb'
});

// Requête préparée
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE username = ?',
  [username]
);
```

**Bonnes pratiques supplémentaires :**
- Utiliser toujours des paramètres liés
- Limiter les droits de la base de données (principe du moindre privilège)
- Ne jamais afficher les erreurs SQL en production
- Implémenter un WAF (Web Application Firewall)

### 2.2 Failles XSS (Cross-Site Scripting)

**Norme associée** : [OWASP A07:2021 – Cross-Site Scripting (XSS)](https://owasp.org/Top10/A07_2021-Cross_Site_Scripting_%28XSS%29/)

**Types d'attaques XSS :**

1. **Stored XSS** - Donnée malveillante stockée en base
2. **Reflected XSS** - Donnée reflétée directement dans la réponse
3. **DOM-based XSS** - Exploitation du DOM JavaScript côté client

**Le problème :**
```php
// ❌ DANGER
$comment = $_POST['comment'];
echo "<p>" . $comment . "</p>";

// Attaque : comment = <img src=x onerror="alert('XSS')">
```

**✅ Les solutions :**

**1. Échapper les données HTML :**
```php
<?php
$comment = $_POST['comment'];
echo "<p>" . htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') . "</p>";

// htmlspecialchars convertit :
// & → &amp;
// " → &quot;
// ' → &#039;
// < → &lt;
// > → &gt;
?>
```

**2. Utiliser des templates avec échappement automatique :**
```php
// Avec Twig (recommandé)
{{ comment }} // Échappe automatiquement
{{ comment|raw }} // À éviter !
```

**3. Valider ET Nettoyer côté serveur :**
```php
<?php
use \HtmlPurifier;

$config = HtmlPurifier_Config::createDefault();
$purifier = new HtmlPurifier($config);
$clean_html = $purifier->purify($dirty_html);
?>
```

**4. Content Security Policy (CSP) - Protection en arrière-plan :**
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none'
```

### 2.3 Attaques CSRF (Cross-Site Request Forgery)

**Norme associée** : [OWASP A01:2021 – Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

**Le problème :**
Un attaquant force l'utilisateur à effectuer une action sans son consentement explicit.

```html
<!-- Site malveillant de l'attaquant -->
<img src="https://votre-site.com/transfer?amount=1000&to=attacker" />
<!-- L'utilisateur connecté exécute involontairement un transfert -->
```

**✅ La solution : Jetons CSRF**

**PHP classique :**
```php
<?php
session_start();

// Génération du token (une seule fois en début de session)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Dans le formulaire
echo '<form method="POST" action="traiter.php">';
echo '<input type="hidden" name="csrf_token" value="' . $_SESSION['csrf_token'] . '">';
echo '</form>';

// Vérification lors du traitement
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
    die('CSRF token invalide');
}
?>
```

**Avec Laravel (intégré automatiquement) :**
```php
<!-- Dans les formulaires -->
{{ csrf_field() }}

<!-- Dans les contrôleurs -->
// Automatiquement validé par le middleware
```

**Avec Express.js :**
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/process', csrfProtection, (req, res) => {
  // Token automatiquement vérifié
  res.send('Donnée traitée');
});
```

**Bonnes pratiques :**
- Utiliser SameSite cookie attribute : `Set-Cookie: session=abc123; SameSite=Strict`
- Vérifier l'en-tête `Referer`
- Implémenter le double-submit cookie pattern
- Rotation des tokens après chaque soumission critique

---

## Couche 3 : Sécurisation de l'infrastructure

### 3.1 Mises à jour systématiques

**⚠️ Les failles connues sont exploitées dans l'heure suivant leur divulgation**

**Points critiques à mettre à jour :**

| Composant | Fréquence | Outil |
|---|---|---|
| CMS (WordPress, PrestaShop) | Hebdomadaire | Plugin de mise à jour, Composer |
| Plugins/Extensions | Hebdomadaire | Dashboard admin |
| PHP/Python/Node.js Runtime | Mensuel | Version managers (nvm, pyenv) |
| Dépendances (npm, pip, composer) | Hebdomadaire | `npm audit`, `pip outdated`, `composer outdated` |
| OS/Kernel | Mensuel | apt update && apt upgrade |
| Base de données | Trimestriel | Procédure de migration testée |

**Automatiser les mises à jour :**

```bash
# Cron job pour vérifier les mises à jour
0 2 * * 1 /usr/local/bin/check-updates.sh

#!/bin/bash
# check-updates.sh
composer outdated > /var/log/composer-outdated.txt
npm outdated > /var/log/npm-outdated.txt

# Envoyer email si mises à jour disponibles
if [ -s /var/log/composer-outdated.txt ]; then
    mail -s "Mises à jour disponibles" admin@example.com < /var/log/composer-outdated.txt
fi
```

**Politique de versioning sécurisée :**
```json
// composer.json
{
  "require": {
    "symfony/framework": "^6.0",  // >= 6.0, < 7.0
    "monolog/monolog": "~2.0",    // >= 2.0, < 3.0
    "laravel/framework": "9.*"    // >= 9.0, < 10.0
  }
}
```

### 3.2 Pare-feu applicatif (WAF)

**Norme associée** : [OWASP ModSecurity](https://owasp.org/www-project-modsecurity/)

**Solutions populaires :**

| Solution | Type | Coût | Niveau |
|---|---|---|---|
| **Cloudflare** | Cloud | Gratuit+ | Beginner friendly |
| **Sucuri** | Cloud | Payant | Avancé |
| **AWS WAF** | Cloud | Payant | Enterprise |
| **ModSecurity** | Open Source | Gratuit | Technique |
| **Fail2ban** | Open Source | Gratuit | Léger |

**Configuration Fail2ban (Protection DDoS basique) :**
```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
maxretry = 5
findtime = 600
bantime = 3600

[apache-auth]
enabled = true
port = http,https
maxretry = 5

[apache-noscript]
enabled = true
maxretry = 6
```

### 3.3 Permissions de fichiers

**Principe du moindre privilège**

```bash
# Bonnes pratiques pour une application web
chmod 755 /var/www/html/                # Répertoire racine
chmod 644 /var/www/html/*.php           # Fichiers PHP
chmod 644 /var/www/html/.htaccess       # Configuration Apache
chmod 700 /var/www/html/uploads/        # Dossier uploads - writable
chmod 600 /var/www/html/.env            # Fichier de configuration sensible

# Propriété des fichiers
chown www-data:www-data /var/www/html/uploads/

# Empêcher l'exécution de scripts dans uploads
# Dans .htaccess (uploads)
<FilesMatch "\.php$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
```

### 3.4 Sauvegarde sécurisée

**3-2-1 Backup Rule :**
- **3** copies de vos données
- **2** sur des supports différents (SSD + disque externe)
- **1** hors site (cloud)

```bash
#!/bin/bash
# Sauvegarde quotidienne automatisée

BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/mnt/backups"

# Sauvegarder la base de données
mysqldump -u user -p'password' --all-databases | gzip > \
  ${BACKUP_DIR}/db-${BACKUP_DATE}.sql.gz

# Sauvegarder les fichiers
tar -czf ${BACKUP_DIR}/files-${BACKUP_DATE}.tar.gz /var/www/html/

# Envoyer vers le cloud (AWS S3 exemple)
aws s3 cp ${BACKUP_DIR}/db-${BACKUP_DATE}.sql.gz \
  s3://my-backup-bucket/

# Nettoyer les anciennes sauvegardes (+ de 90 jours)
find ${BACKUP_DIR} -name "*.gz" -mtime +90 -delete

echo "Sauvegarde complétée : ${BACKUP_DATE}"
```

---

## Couche 4 : En-têtes de sécurité HTTP

Ces en-têtes donnent des instructions au navigateur pour qu'il se protège.

### Configuration complète des en-têtes de sécurité

**Nginx :**
```nginx
# Ajoutez au bloc server {}

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.googleapis.com; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

# Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Empêcher le clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Empêcher le content sniffing
add_header X-Content-Type-Options "nosniff" always;

# Protection XSS (navigateurs anciens)
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Feature Policy / Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Apache (.htaccess) :**
```apache
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

**PHP :**
```php
<?php
header("Content-Security-Policy: default-src 'self'");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
?>
```

### Tableau récapitulatif des en-têtes

| En-tête | Rôle | Exemple | Importance |
|---|---|---|---|
| **Content-Security-Policy (CSP)** | Définit les sources de contenu autorisées | `default-src 'self'; script-src 'self' cdn.example.com` | ⭐⭐⭐ Critique |
| **Strict-Transport-Security (HSTS)** | Force HTTPS uniquement | `max-age=31536000; includeSubDomains` | ⭐⭐⭐ Critique |
| **X-Frame-Options** | Empêche le clickjacking | `DENY` ou `SAMEORIGIN` | ⭐⭐⭐ Critique |
| **X-Content-Type-Options** | Empêche le content sniffing | `nosniff` | ⭐⭐ Important |
| **X-XSS-Protection** | Filtre XSS navigateur (ancien) | `1; mode=block` | ⭐⭐ Important |
| **Referrer-Policy** | Contrôle les infos de referer | `strict-origin-when-cross-origin` | ⭐⭐ Important |
| **Permissions-Policy** | Limite les capacités du navigateur | `geolocation=(), microphone=()` | ⭐ Bonus |

---

## Couche 5 : Authentification et gestion des accès

### 5.1 Gestion des sessions

**Bonnes pratiques :**

```php
<?php
// Configuration sécurisée de la session
ini_set('session.cookie_httponly', 1);      // Accessible uniquement via HTTP
ini_set('session.cookie_secure', 1);        // Transmission uniquement en HTTPS
ini_set('session.cookie_samesite', 'Strict'); // Protection CSRF
ini_set('session.gc_maxlifetime', 1800);    // 30 minutes
ini_set('session.use_strict_mode', 1);      // Refuse les ID de session inconnus

session_start();

// Régénération ID session après login (anti-session fixation)
session_regenerate_id(true);

// Destruire session après logout
session_destroy();
?>
```

### 5.2 Gestion des droits d'accès (RBAC)

**Role-Based Access Control :**

```php
<?php
// Définition des rôles et permissions
$roles = [
    'admin' => ['create_user', 'edit_user', 'delete_user', 'view_logs'],
    'editor' => ['create_post', 'edit_own_post', 'delete_own_post'],
    'viewer' => ['view_post']
];

// Vérification d'accès
function hasPermission($user, $permission) {
    global $roles;
    $userRole = $user['role'];
    return in_array($permission, $roles[$userRole] ?? []);
}

// Utilisation
if (hasPermission($currentUser, 'delete_user')) {
    // Permettre la suppression
} else {
    http_response_code(403);
    die('Accès refusé');
}
?>
```

### 5.3 Rate Limiting

**Prévenir les attaques par force brute :**

```php
<?php
// Classe simple de rate limiting
class RateLimiter {
    private $cache = [];
    
    public function isAllowed($identifier, $maxAttempts = 5, $window = 300) {
        $key = 'ratelimit:' . $identifier;
        $current = $this->cache[$key] ?? 0;
        
        if ($current >= $maxAttempts) {
            return false;
        }
        
        $this->cache[$key] = $current + 1;
        return true;
    }
}

// Utilisation
$limiter = new RateLimiter();
if (!$limiter->isAllowed($_POST['username'])) {
    http_response_code(429); // Too Many Requests
    die('Trop de tentatives, réessayez plus tard');
}
?>
```

**Avec Redis (plus robuste) :**
```php
<?php
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

function checkRateLimit($key, $limit = 5, $window = 300) {
    $current = $redis->get($key) ?? 0;
    
    if ($current >= $limit) {
        return false;
    }
    
    $redis->incr($key);
    $redis->expire($key, $window);
    return true;
}

if (!checkRateLimit('login:' . $_POST['username'])) {
    http_response_code(429);
    die('Trop de tentatives');
}
?>
```

---

## Couche 6 : Monitoring et détection

### 6.1 Logging sécurisé

**Événements à logger :**
- Tentatives de connexion échouées
- Accès aux zones admin
- Modifications de données sensibles
- Erreurs système
- Accès refusés
- Détections d'attaques

```php
<?php
class SecurityLogger {
    private $logFile = '/var/log/security.log';
    
    public function log($event, $level = 'INFO', $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userId = $_SESSION['user_id'] ?? 'anonymous';
        
        $message = "[{$timestamp}] [{$level}] [{$ip}] [{$userId}] {$event}";
        if (!empty($context)) {
            $message .= " | " . json_encode($context);
        }
        
        error_log($message . "\n", 3, $this->logFile);
    }
}

$logger = new SecurityLogger();
$logger->log('Login attempt failed', 'WARNING', ['username' => 'admin']);
?>
```

**Configuration Log Rotation :**
```
# /etc/logrotate.d/security
/var/log/security.log {
    daily
    rotate 90
    compress
    delaycompress
    notifempty
    create 640 www-data www-data
    sharedscripts
}
```

### 6.2 Détection d'anomalies

```php
<?php
// Détection d'accès suspects
function detectSuspiciousActivity($userId) {
    // Comparer avec la localisation habituelle
    $currentIp = $_SERVER['REMOTE_ADDR'];
    $lastKnownIp = getUserLastIp($userId);
    
    if ($currentIp !== $lastKnownIp) {
        // IP différente - envoyer confirmation par email
        sendSecurityAlert($userId, "Connexion depuis une nouvelle IP");
    }
    
    // Vérifier l'user-agent
    $currentAgent = $_SERVER['HTTP_USER_AGENT'];
    $lastKnownAgent = getUserLastAgent($userId);
    
    if ($currentAgent !== $lastKnownAgent) {
        sendSecurityAlert($userId, "Connexion depuis un nouveau navigateur");
    }
}
?>
```

### 6.3 Monitoring avec Grafana + Prometheus

**Configuration basique :**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'application'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

---

## Normes et Standards de conformité

### 🏆 Normes de référence

| Norme | Domaine | Applicable à |
|---|---|---|
| **OWASP Top 10** | Sécurité web | Tous les sites |
| **OWASP API Security** | APIs REST | Développeurs |
| **ISO 27001** | Management de sécurité | Entreprises |
| **NIST Cybersecurity Framework** | Gouvernance | Secteur public, Grandes entreprises |
| **GDPR** | Protection données personnelles | EU + données clients EU |
| **CCPA** | Protection données personnelles | Californie + résidents CA |
| **PCI DSS** | Sécurité paiement | E-commerce, paiements |
| **HIPAA** | Données médicales | Santé |
| **SOC 2** | Service providers | SaaS, Hébergeurs |

### OWASP Top 10 2021 (vs Attaques courantes)

```
A01:2021 - Broken Access Control
  └─ Prévention : Implémenter RBAC, tester les contrôles d'accès

A02:2021 - Cryptographic Failures
  └─ Prévention : HTTPS/TLS, hachage des mots de passe, chiffrement en repos

A03:2021 - Injection
  └─ Prévention : Requêtes préparées, paramètres liés, validation input

A04:2021 - Insecure Design
  └─ Prévention : Threat modeling, SDLC sécurisé

A05:2021 - Security Misconfiguration
  └─ Prévention : Hardening, scanner config, CI/CD

A06:2021 - Vulnerable & Outdated Components
  └─ Prévention : Dépendances up-to-date, SBOM, SCA

A07:2021 - Identification & Authentication Failures
  └─ Prévention : 2FA, mots de passe forts, session management

A08:2021 - Software & Data Integrity Failures
  └─ Prévention : Code signing, CDN sécurisée, intégrité artefacts

A09:2021 - Logging & Monitoring Failures
  └─ Prévention : Logging complet, alertes, monitoring

A10:2021 - Server-Side Request Forgery (SSRF)
  └─ Prévention : Validation URLs, listes blanches, isolation réseau
```

### GDPR - Points clés pour sites

**Si vous traitez des données personnelles d'utilisateurs EU :**

```
✅ Obligation de consentement explicite
✅ Politique de confidentialité claire
✅ Droit d'accès aux données personnelles
✅ Droit à l'oubli (suppression)
✅ Portabilité des données
✅ Chiffrement des données sensibles
✅ Notification de violation dans les 72h
✅ Privacy by design (dès le développement)
```

---

## Checklist de sécurité

### 🔒 Avant le déploiement

- [ ] Certificate SSL/TLS installé et valide
- [ ] HTTPS redirigé (HTTP → HTTPS)
- [ ] Tous les mots de passe hachés (Argon2/BCrypt)
- [ ] 2FA activé pour admin
- [ ] Requêtes SQL préparées
- [ ] XSS protégé (htmlspecialchars, CSP)
- [ ] CSRF tokens implémentés
- [ ] Permissions fichiers correctes (755/644/700)
- [ ] Fichier .env ou config hors du web root
- [ ] Erreurs non affichées en production
- [ ] Backup testé et automatisé
- [ ] En-têtes de sécurité HTTP configurés
- [ ] WAF/ModSecurity en place
- [ ] Logging configuré
- [ ] Rate limiting implémenté

### 🔄 Maintenance mensuelle

- [ ] Mise à jour des dépendances (`composer/npm/pip outdated`)
- [ ] Scan des vulnérabilités (`npm audit`, `composer audit`)
- [ ] Rotation des clés API sensibles
- [ ] Vérification des logs de sécurité
- [ ] Test de sauvegarde/restauration
- [ ] Mise à jour du serveur (OS, PHP, MySQL)

### 📊 Monitoring continu

- [ ] Tableau de bord Grafana/New Relic
- [ ] Alertes anomalies
- [ ] SSL Labs Grade A+ https://www.ssllabs.com/
- [ ] OWASP ZAP scan automatisé
- [ ] Pentest annuel
- [ ] Analyse dépendances (SBOM)

### 🧪 Tests de sécurité

```bash
# Scanner automatisé des vulnérabilités dépendances
npm audit
composer audit
pip check

# Scan OWASP ZAP (si installé)
zaproxy -cmd -quickurl https://votre-site.com -quickout report.html

# Test SSL/TLS
nmap --script ssl-enum-ciphers -p 443 votre-site.com

# Vérification en-têtes sécurité
curl -I https://votre-site.com | grep -i security
```

---

## Ressources et références

### Documentation officielle

- 🔗 [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 🔗 [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- 🔗 [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- 🔗 [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines)

### Outils utiles

| Outil | Utilité | Lien |
|---|---|---|
| **SSL Labs** | Test certificat SSL | https://www.ssllabs.com/ssltest/ |
| **Security Headers** | Vérification en-têtes | https://securityheaders.com |
| **OWASP ZAP** | Scanner vulnérabilités | https://www.zaproxy.org/ |
| **Snyk** | Scan dépendances | https://snyk.io/ |
| **Dependabot** | Alertes dépendances | https://dependabot.com/ |
| **Have I Been Pwned** | Vérifier mots de passe | https://haveibeenpwned.com/ |

### Lectures recommandées

- 📚 "Web Security Testing Handbook" - OWASP
- 📚 "The OWASP Testing Guide"
- 📚 "Cryptography Engineering" - Ferguson, Schneier
- 📚 "The Web Application Security" - Shiflett

### Formation continue

- 🎓 [HackTheBox](https://www.hackthebox.com/) - Challenges pratiques
- 🎓 [DVWA](https://github.com/digininja/DVWA) - Application intentionnellement vulnérable
- 🎓 [TryHackMe](https://tryhackme.com/) - Parcours d'apprentissage
- 🎓 [PortSwigger Web Security Academy](https://portswigger.net/web-security) - Gratuit, très complet

---

## Conclusion

La sécurité est un **processus continu**, pas un état final. Les menaces évoluent, les techniques s'améliorent.

**Les 3 points clés à retenir :**

1. **Chiffrement** - HTTPS/TLS partout, hachage des mots de passe
2. **Validation** - Requêtes préparées, échappement données, CSP
3. **Maintenance** - Mises à jour régulières, monitoring, logging

**Les 80/20 de la sécurité web :**
- 20% des efforts = 80% de la protection
- HTTPS, mots de passe hachés, requêtes préparées couvrent 80% des attaques

Commencez par les basiques, progressez graduellement vers une sécurité robuste.

---

**Dernière mise à jour :** Mars 2026  
**Auteur :** Guide de sécurité web généraliste  
**Version :** 2.0
