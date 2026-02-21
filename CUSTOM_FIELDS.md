# Champs Personnalisés — Uprising CRM

## Comment créer ces champs

Dans Uprising CRM : **Settings → Data model → Company** → clic sur "Add Field"

> Ces champs sont conçus pour l'ICP (plombiers, couvreurs, électriciens, etc.)
> et l'offre "Trifecta" d'Uprising Studio.

---

## Champs à créer sur l'objet "Company"

### 1. Système téléphonique actuel

- **Nom** : `Système téléphonique actuel`
- **Type** : Select (liste de choix)
- **Options** :
  - `📱 Cellulaire personnel` — Le patron répond lui-même
  - `👩‍💼 Secrétaire` — Quelqu'un répond, mais pas 24/7
  - `📞 Boîte vocale` — Personne ne répond = opportunité perdue
- **Pourquoi** : Crucial pour savoir comment Xavier va brancher l'IA vocale.
  Un prospect avec "Boîte vocale" est un client idéal.

### 2. Score Apify

- **Nom** : `Score Apify`
- **Type** : Number (nombre)
- **Plage** : 1 à 10
- **Calcul** :
  - Nombre d'avis Google (1-3 pts)
  - Note moyenne Google (1-3 pts)
  - État du site web (1-4 pts)
- **Pourquoi** : Priorise les prospects. Un score bas = plus besoin de nous.

### 3. Statut du Site Web

- **Nom** : `Statut du Site Web`
- **Type** : Select (liste de choix)
- **Options** :
  - `❌ Inexistant` — Pas de site web du tout → Vente facile
  - `🐌 Vieux/Lent` — Site existant mais obsolète → Mise à jour
  - `✅ Bon mais pas optimisé` — Site correct mais ne convertit pas → Optimisation
- **Pourquoi** : Détermine quel pilier de la Trifecta proposer en premier.

---

## Import CSV/Excel

L'import est **déjà intégré** dans Twenty CRM :

1. Allez dans n'importe quel objet (Companies, People, etc.)
2. Cliquez sur le bouton **Import** (icône ↑)
3. Glissez-déposez votre fichier `.csv` ou `.xlsx`
4. Mappez les colonnes aux champs du CRM
5. Validez l'import

### Format CSV recommandé

```csv
name,domainNamePrimaryLinkUrl,addressAddressCity,employees
"Plomberie Martin","https://plomberiemartin.ca","Montréal",8
"Toitures Lavoie","https://toitureslavoie.ca","Québec",12
```

---

## Connexion Email & Google Calendar

### Email (Gmail)

1. **Settings → Accounts → Email** → "Connect Gmail"
2. Autorisez l'accès OAuth Google
3. Les emails sont synchronisés automatiquement avec les contacts CRM

### Google Calendar

1. **Settings → Accounts → Calendar** → "Connect Google Calendar"
2. Autorisez l'accès OAuth Google
3. Les événements apparaissent sur les fiches contacts et dans la vue calendrier

> **Prérequis** : Configurer `AUTH_GOOGLE_CLIENT_ID` et `AUTH_GOOGLE_CLIENT_SECRET`
> dans le fichier `.env`. Voir `.env.uprising` pour les instructions.
