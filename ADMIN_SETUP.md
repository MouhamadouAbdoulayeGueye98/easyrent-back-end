# Configuration de l'Administrateur - Guide de Sécurité

## 🔐 Pourquoi cette approche ?

Pour des raisons de sécurité, les identifiants de l'administrateur ne doivent **JAMAIS** être hardcoded dans le code. Nous utilisons désormais des variables d'environnement pour configurer le compte admin.

## 📋 Étapes de configuration

### 1. Copier le fichier d'exemple

```bash
cp .env.example .env
```

### 2. Configurer les identifiants admin dans `.env`

Ouvrez le fichier `.env` et configurez les variables suivantes :

```env
# ADMIN ACCOUNT (Pour la création de l'administrateur via seed)
ADMIN_EMAIL=votre_email_admin@example.com
ADMIN_PASSWORD=votre_mot_de_passe_super_secure
```

**Recommandations de sécurité :**
- Utilisez un mot de passe fort (minimum 12 caractères, majuscules, minuscules, chiffres, caractères spéciaux)
- N'utilisez PAS le même mot de passe que vos autres comptes
- Changez régulièrement le mot de passe admin

### 3. Exécuter le seed pour créer l'administrateur

```bash
npm run seed
```

Ou si vous utilisez Prisma directement :

```bash
npx prisma db seed
```

## ⚠️ Points importants

### Le fichier `.env` N'EST PAS versionné

Le fichier `.env` est déjà dans `.gitignore`, donc vos identifiants ne seront jamais commités sur Git.

### Le fichier `.env.example` EST versionné

Ce fichier contient des placeholders et est sécurisé à partager. Il sert de modèle pour les autres développeurs.

### Pour les environnements de production

Sur Render (ou autre plateforme de déploiement), vous devez configurer ces variables d'environnement dans le dashboard de la plateforme :

- `ADMIN_EMAIL` : votre email admin
- `ADMIN_PASSWORD` : votre mot de passe admin

## 🔄 Changer les identifiants admin

Si vous souhaitez changer les identifiants :

1. Modifiez les variables dans `.env`
2. Relancez le seed : `npm run seed`

Le seed utilise `upsert`, donc il mettra à jour le compte existant avec les nouveaux identifiants.

## 🚫 NE FAITES PAS

- ❌ Ne committez jamais le fichier `.env`
- ❌ Ne partagez jamais vos identifiants admin
- ❌ N'utilisez pas de mots de passe faibles
- ❌ Ne hardcodez pas les identifiants dans le code

## ✅ À FAIRE

- ✅ Utiliser des variables d'environnement
- ✅ Utiliser des mots de passe forts
- ✅ Configurer les variables dans votre dashboard de production
- ✅ Garder `.env` dans `.gitignore`
