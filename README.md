# test-dev-fullstack-2025-la-metis

Soumission du test pour La Mètis par Tom Bazarnik.

## Structure

Le sujet original est disponible dans le fichier [`SUBJECT.md`](SUBJECT.md).

```sh
.
├── README.md                         # Ce fichier
├── SUBJECT.md                        # Sujet original du test
├── .github                           # GitHub actions
├── tests/e2e                         # Tests end-to-end
└── src                               # Code source
    ├── index.ts                      # Point d'entrée
    ├── app.ts                        # Configuration de l'application Hono (Swagger inclus)
    ├── data-source.ts                # Source de données (TypeORM)
    ├── migrations                    # Migrations TypeORM
    ├── middleware                    # Middlewares Hono
    └── <module>                      # Module de fonctionnalité
        ├── <module>.route.ts         # Routes (avec documentations OpenAPI)
        ├── <module>.entity.ts        # Entité TypeORM
        ├── <module>.controller.ts    # Contrôleur (gestion des routes)
        ├── <module>.validator.ts     # Validateur (équivalents aux DTOs)
        └── <module>.service.ts       # Service (logique métier)
```

## Installation

Tout d'abord, il faut installer les dépendances.

```bash
npm install
```

Ensuite, il faut créer un fichier `.env` dans le projet et y renseigner les variables d'environnement en se basant sur le fichier `.env.example`.

```bash
HOST=localhost # Par défaut: localhost
PORT=3000 # Par défaut: 3000
DATABASE_URL=my-database.sqlite3
LOG_LEVEL=debug # Par défaut: null. Si "debug" est renseigné, les logs de TypeORM seront affichés
```

## Migrations

Pour le test technique, j'ai ajouté TypeORM pour gérer la base de données SQLite avec des entités (avec des décorateurs) et un système de migrations.

Avant de lancer le projet, il faut initialiser la base de données avec les migrations.

```bash
npm run migration:run
```

### Commandes

> [!NOTE]  
> Les scripts NPM listées ci-dessous sont des proxies pour des commandes du CLI de TypeORM, le tout étant exécuté avec `ts-node` pour que TypeORM puisse gérer les fichiers TypeScript.

Voici la liste des commandes disponibles :

```bash
npm run migration:show                            # Affiche les migrations
npm run migration:generate src/migrations/<name>  # Génère une migration
npm run migration:run                             # Exécute les migrations
npm run migration:revert                          # Annule la dernière migration
```

## Usage

Pour lancer le serveur de développement, il faut exécuter la commande suivante. Il sera accessible à l'adresse configurée selon vos variables d'environnement dans votre fichier `.env`.

```bash
npm run dev
```

### Swagger

Une interface Swagger sera disponible sur le endpoint `/docs` pointant vers la spec OpenAPI disponible sur le endpoint `/openapi.json` avec la possibilité de spécifier un header `X-User-ID` pour simuler un utilisateur authentifié.

La documentation des endpoints et schémas se fait via `@hono/zod-openapi` lors de la définition des routes, de la même manière que l'on ferait dans un projet sous NestJS avec `@nestjs/swagger`.

## Tests

> [!IMPORTANT]  
> Manquant d'expérience avec Hono et comment l'intégrer correctement avec TypeORM (avec des décorateurs) **et** Vitest, la plupart de la configuration e2e a été faite avec l'aide de l'IA et en utilisant Supertest.

Cela va lancer les tests unitaires et e2e en utilisant Vitest et Supertest. Un serveur de développement (avec les valeurs de `.env.test`) sera lancé pour exécuter les tests, il sera fermé automatiquement après la fin des tests.

```bash
npm test
```

### Github Actions

Le projet est configuré pour utiliser [Github Actions](https://github.com/tommywalkie/test-dev-fullstack-2025-la-metis/actions) pour lancer les tests unitaires et e2e.

## License

MIT @ [Tom Bazarnik](https://github.com/tommywalkie)
